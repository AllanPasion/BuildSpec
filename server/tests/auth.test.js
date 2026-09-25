const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
require('dotenv').config();
const app = require('../app');

let server;
let baseUrl;

before(async () => {
  server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('signed-out users cannot read the garage or a modification', async () => {
  for (const path of ['/api/vehicles', '/api/vehicles/test-id', '/api/modifications/test-id']) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 401, path);
  }
});

test('signed-out users cannot write, even from the configured website origin', async () => {
  for (const path of ['/api/vehicles', '/api/modifications', '/api/uploads']) {
    const response = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: { Origin: process.env.CLIENT_URL || 'http://localhost:5173' } });
    assert.equal(response.status, 401, path);
  }
});

test('wrong origins cannot write', async () => {
  const response = await fetch(`${baseUrl}/api/vehicles`, { method: 'POST', headers: { Origin: 'https://example.com' } });
  assert.equal(response.status, 403);
});

test('auth status does not expose a session or secret', async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.authenticated, false);
  assert.equal(body.user, null);
  assert.equal(Object.keys(body).sort().join(','), 'authenticated,configured,user');
});

test('OAuth callback rejects missing state', async () => {
  const response = await fetch(`${baseUrl}/api/auth/github/callback?code=untrusted`, { redirect: 'manual' });
  assert.equal(response.status, 400);
});
