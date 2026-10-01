const { createClient } = require('@supabase/supabase-js');

const BUCKET_NAME = 'buildspec-photos';
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

let cachedClient;
let cachedCredentials;

function configurationError(message) {
  const error = new Error(message);
  error.code = 'STORAGE_NOT_CONFIGURED';
  return error;
}

function photoStorageMode() {
  const mode = process.env.PHOTO_STORAGE || (process.env.NODE_ENV === 'production' ? 'supabase' : 'local');
  if (mode !== 'local' && mode !== 'supabase') throw configurationError('PHOTO_STORAGE must be local or supabase.');
  if (mode === 'local' && process.env.NODE_ENV === 'production') throw configurationError('Production photo storage must use Supabase.');
  return mode;
}

function photoBucket() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw configurationError('SUPABASE_URL and SUPABASE_SECRET_KEY are required for photo storage.');
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') throw new Error('Supabase URL must use HTTPS.');
  } catch {
    throw configurationError('SUPABASE_URL must be a valid HTTPS URL.');
  }
  const credentials = `${url}\n${key}`;
  if (!cachedClient || cachedCredentials !== credentials) {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    cachedCredentials = credentials;
  }
  return cachedClient.storage.from(BUCKET_NAME);
}

module.exports = { BUCKET_NAME, MIME_TYPES, photoBucket, photoStorageMode };
