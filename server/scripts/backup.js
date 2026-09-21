require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing. Set it in server/.env before backing up.');
  process.exit(1);
}

let database;
try {
  database = new URL(connectionString);
  if (!['postgresql:', 'postgres:'].includes(database.protocol) || !database.pathname.slice(1)) {
    throw new Error('Invalid PostgreSQL URL');
  }
} catch {
  console.error('DATABASE_URL must be a PostgreSQL connection URL.');
  process.exit(1);
}

function findPgDump() {
  const executable = process.platform === 'win32' ? 'pg_dump.exe' : 'pg_dump';
  const onPath = spawnSync(executable, ['--version'], { encoding: 'utf8', windowsHide: true });
  if (!onPath.error && onPath.status === 0) return executable;

  if (process.platform === 'win32') {
    const installRoot = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PostgreSQL');
    if (fs.existsSync(installRoot)) {
      const versions = fs.readdirSync(installRoot).sort((a, b) => Number(b) - Number(a));
      for (const version of versions) {
        const candidate = path.join(installRoot, version, 'bin', executable);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }

  console.error('pg_dump is required for backups. Install PostgreSQL client tools or add pg_dump to PATH.');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDirectory = path.join(__dirname, '..', 'backups', stamp);
const archive = path.join(backupDirectory, 'database.dump');
fs.mkdirSync(backupDirectory, { recursive: true });

// Pass credentials through the environment so they are not in process arguments.
const result = spawnSync(findPgDump(), ['--no-password', '--schema=public', '--format=custom', '--file', archive], {
  env: {
    ...process.env,
    PGHOST: database.hostname,
    PGPORT: database.port || '5432',
    PGUSER: decodeURIComponent(database.username),
    PGPASSWORD: decodeURIComponent(database.password),
    PGDATABASE: decodeURIComponent(database.pathname.slice(1)),
    ...(database.searchParams.has('sslmode') ? { PGSSLMODE: database.searchParams.get('sslmode') } : {}),
  },
  encoding: 'utf8',
  windowsHide: true,
});

if (result.error || result.status !== 0) {
  fs.rmSync(archive, { force: true });
  console.error(result.stderr?.trim() || result.error?.message || 'pg_dump failed.');
  process.exit(1);
}

const uploads = path.join(__dirname, '..', 'uploads');
if (fs.existsSync(uploads)) {
  fs.cpSync(uploads, path.join(backupDirectory, 'uploads'), { recursive: true });
}

fs.writeFileSync(path.join(backupDirectory, 'backup.json'), JSON.stringify({
  createdAt: new Date().toISOString(),
  database: database.pathname.slice(1),
  host: database.hostname,
  includesUploads: fs.existsSync(uploads),
}, null, 2));

console.log(`Backup saved to ${backupDirectory}`);
