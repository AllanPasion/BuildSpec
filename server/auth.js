const crypto = require('crypto');
const express = require('express');
const prisma = require('./db');

const router = express.Router();
const SESSION_COOKIE = 'buildspec_session';
const STATE_COOKIE = 'buildspec_oauth_state';
const SESSION_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const STATE_AGE_MS = 10 * 60 * 1000;

function cookieValue(request, name) {
  const cookie = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return cookie?.slice(name.length + 1) || '';
}

function cookieOptions(path = '/') {
  const sameSite = process.env.COOKIE_SAME_SITE?.toLowerCase() === 'none' ? 'None' : 'Lax';
  return `Path=${path}; HttpOnly; SameSite=${sameSite}${process.env.NODE_ENV === 'production' || sameSite === 'None' ? '; Secure' : ''}`;
}

function setCookie(response, name, value, maxAge, path = '/') {
  response.append('Set-Cookie', `${name}=${value}; ${cookieOptions(path)}; Max-Age=${maxAge}`);
}

function clearCookie(response, name, path = '/') {
  setCookie(response, name, '', 0, path);
}

function githubConfigured() {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL && process.env.GITHUB_ALLOWED_USER_ID);
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function currentSession(request) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await prisma.authSession.findUnique({ where: { tokenHash: tokenHash(token) } });
  if (!session || session.expiresAt <= new Date() || session.githubUserId !== process.env.GITHUB_ALLOWED_USER_ID) return null;
  return session;
}

async function requireOwner(request, response, next) {
  try {
    const session = await currentSession(request);
    if (!session) return response.status(401).json({ error: 'Sign in with GitHub to access your garage.' });
    request.authSession = session;
    return next();
  } catch (error) { return next(error); }
}

function requireClientOrigin(request, response, next) {
  const expected = new URL(process.env.CLIENT_URL || 'http://localhost:5173').origin;
  if (request.get('origin') !== expected) return response.status(403).json({ error: 'Request origin is not allowed.' });
  return next();
}

router.get('/me', async (request, response, next) => {
  try {
    const session = await currentSession(request);
    response.set('Cache-Control', 'no-store');
    return response.json({ authenticated: Boolean(session), configured: githubConfigured(), user: session ? { login: session.githubLogin } : null });
  } catch (error) { return next(error); }
});

router.get('/github', (request, response) => {
  if (!githubConfigured()) return response.status(503).send('GitHub sign-in is not configured on this server.');
  const state = crypto.randomBytes(32).toString('hex');
  setCookie(response, STATE_COOKIE, state, STATE_AGE_MS / 1000, '/api/auth/github/callback');
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', process.env.GITHUB_CALLBACK_URL);
  authorize.searchParams.set('state', state);
  return response.redirect(authorize.toString());
});

router.get('/github/callback', async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const stateCookie = cookieValue(request, STATE_COOKIE);
  clearCookie(response, STATE_COOKIE, '/api/auth/github/callback');
  const state = request.query.state;
  if (typeof state !== 'string' || !/^[a-f0-9]{64}$/.test(stateCookie) || !/^[a-f0-9]{64}$/.test(state) ||
      !crypto.timingSafeEqual(Buffer.from(stateCookie), Buffer.from(state))) {
    return response.status(400).send('GitHub sign-in expired or failed its security check. Return to BuildSpec and try again.');
  }
  if (request.query.error) return response.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/?auth_error=denied`);
  if (typeof request.query.code !== 'string' || !githubConfigured()) return response.status(400).send('Invalid GitHub sign-in response.');

  try {
    const exchange = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'BuildSpec' },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code: request.query.code, redirect_uri: process.env.GITHUB_CALLBACK_URL }),
      signal: AbortSignal.timeout(10000),
    });
    if (!exchange.ok) throw new Error(`GitHub token exchange failed: ${exchange.status}`);
    const result = await exchange.json();
    if (!result.access_token) throw new Error(`GitHub token exchange failed: ${result.error || 'missing token'}`);

    const identity = await fetch('https://api.github.com/user', {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${result.access_token}`, 'User-Agent': 'BuildSpec', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(10000),
    });
    if (!identity.ok) throw new Error(`GitHub identity check failed: ${identity.status}`);
    const user = await identity.json();
    if (String(user.id) !== process.env.GITHUB_ALLOWED_USER_ID) return response.status(403).send('This GitHub account cannot manage BuildSpec.');

    const previousToken = cookieValue(request, SESSION_COOKIE);
    if (/^[a-f0-9]{64}$/.test(previousToken)) await prisma.authSession.deleteMany({ where: { tokenHash: tokenHash(previousToken) } });
    await prisma.authSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.authSession.create({ data: { tokenHash: tokenHash(token), githubUserId: String(user.id), githubLogin: user.login, expiresAt: new Date(Date.now() + SESSION_AGE_MS) } });
    setCookie(response, SESSION_COOKIE, token, SESSION_AGE_MS / 1000);
    return response.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  } catch (error) {
    console.error('GitHub sign-in failed:', error);
    return response.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/?auth_error=failed`);
  }
});

router.post('/logout', requireClientOrigin, async (request, response, next) => {
  try {
    const token = cookieValue(request, SESSION_COOKIE);
    if (/^[a-f0-9]{64}$/.test(token)) await prisma.authSession.deleteMany({ where: { tokenHash: tokenHash(token) } });
    clearCookie(response, SESSION_COOKIE);
    return response.status(204).send();
  } catch (error) { return next(error); }
});

module.exports = { router, requireOwner, requireClientOrigin };
