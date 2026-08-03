const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Full-Stack Application (Backend + Frontend + Public Mobile Tunnel)...');

// 1. Start Backend Server
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'pipe'
});

backend.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`[BACKEND] ${line}`);
});

backend.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`[BACKEND ERROR] ${line}`);
});

// 2. Start Frontend Server strictly on port 5173
const frontend = spawn('npx', ['vite', '--host', '--port', '5173', '--strictPort'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
  stdio: 'pipe'
});

frontend.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`[FRONTEND] ${line}`);
});

frontend.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`[FRONTEND ERROR] ${line}`);
});

// 3. Start Public Mobile Tunnel for port 5173
setTimeout(() => {
  const tunnel = spawn('npx', ['localtunnel', '--port', '5173'], {
    cwd: path.join(__dirname, 'frontend'),
    shell: true,
    stdio: 'pipe'
  });

  tunnel.stdout.on('data', (data) => {
    const line = data.toString().trim();
    if (line) console.log(`🌟 [PUBLIC MOBILE TUNNEL] ${line}`);
  });

  tunnel.stderr.on('data', (data) => {
    const line = data.toString().trim();
    if (line) console.log(`[TUNNEL ERROR] ${line}`);
  });
}, 3000);
