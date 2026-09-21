const net = require('node:net');

function isListening(port, host) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ port, host, timeout: 1000 });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', error => {
      socket.destroy();
      if (error.code === 'ECONNREFUSED' || error.code === 'EAFNOSUPPORT') resolve(false);
      else reject(error);
    });
  });
}

async function main() {
  const ports = [
    { name: 'API', value: Number(process.env.PORT || 3000) },
    { name: 'website', value: Number(process.env.VITE_DEV_PORT || 5173) },
  ];

  for (const { name, value } of ports) {
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      throw new Error(`Invalid ${name} port: ${value}`);
    }
    for (const host of ['127.0.0.1', '::1']) {
      if (await isListening(value, host)) {
        throw new Error(`Port ${value} (${name}) is already in use. Stop the existing dev server before running npm run dev.`);
      }
    }
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
