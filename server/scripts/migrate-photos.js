require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const prisma = require('../db');
const { BUCKET_NAME, MIME_TYPES, photoBucket } = require('../storage');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
const dryRun = process.argv.includes('--dry-run');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function photoName(value) {
  if (!value?.startsWith('/uploads/')) return null;
  const name = value.slice('/uploads/'.length);
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) throw new Error(`Unsafe photo path in database: ${value}`);
  return name;
}

async function main() {
  const [vehicles, modifications] = await Promise.all([
    prisma.vehicle.findMany({ select: { imageUrl: true, finalImageUrl: true } }),
    prisma.modification.findMany({ select: { installImageUrl: true } }),
  ]);
  const referenced = new Set([
    ...vehicles.flatMap((vehicle) => [vehicle.imageUrl, vehicle.finalImageUrl]),
    ...modifications.map((modification) => modification.installImageUrl),
  ].map(photoName).filter(Boolean));
  const entries = await fs.readdir(uploadDirectory, { withFileTypes: true });
  const names = entries.filter((entry) => entry.isFile() && MIME_TYPES[path.extname(entry.name).toLowerCase()]).map((entry) => entry.name).sort();
  const missing = [...referenced].filter((name) => !names.includes(name));
  if (missing.length) throw new Error(`${missing.length} database-referenced photo(s) are missing locally: ${missing.join(', ')}`);
  console.log(`${names.length} local photos, ${referenced.size} referenced by the database, 0 missing.`);
  if (dryRun) return;

  const bucket = photoBucket();
  let uploaded = 0;
  let alreadyPresent = 0;
  for (const name of names) {
    const bytes = await fs.readFile(path.join(uploadDirectory, name));
    const { error } = await bucket.upload(name, bytes, {
      contentType: MIME_TYPES[path.extname(name).toLowerCase()],
      upsert: false,
    });
    if (error && String(error.statusCode) !== '409' && error.error !== 'Duplicate') throw new Error(`Upload failed for ${name}: ${error.message}`);
    if (error) alreadyPresent += 1;
    else uploaded += 1;

    const { data, error: downloadError } = await bucket.download(name);
    if (downloadError) throw new Error(`Verification download failed for ${name}: ${downloadError.message}`);
    if (sha256(bytes) !== sha256(Buffer.from(await data.arrayBuffer()))) throw new Error(`Verification hash mismatch for ${name}`);
    console.log(`Verified ${name}`);
  }
  console.log(`Verified all ${names.length} photos in private bucket ${BUCKET_NAME} (${uploaded} uploaded, ${alreadyPresent} already present). Local files were kept.`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
