const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Full-Stack Remote Mobile Launcher (Backend + Frontend + Dual Public Tunnels)...');

// 1. Start Backend Server on Port 5005
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

// 2. Start Frontend Server on Port 5173
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

// 3. Start Public Backend API Tunnel (Port 5005)
setTimeout(() => {
  const backendTunnel = spawn('npx', ['localtunnel', '--port', '5005', '--subdomain', 'quizzy-backend-api-2026'], {
    cwd: path.join(__dirname, 'backend'),
    shell: true,
    stdio: 'pipe'
  });

  backendTunnel.stdout.on('data', (data) => {
    const line = data.toString().trim();
    if (line) console.log(`🔒 [PUBLIC BACKEND API TUNNEL] ${line}`);
  });

  backendTunnel.stderr.on('data', (data) => {
    const line = data.toString().trim();
    if (line) console.log(`[BACKEND TUNNEL ERROR] ${line}`);
  });
}, 3000);

// 4. Start Public Frontend App Tunnel (Port 5173)
setTimeout(() => {
  const frontendTunnel = spawn('npx', ['localtunnel', '--port', '5173', '--subdomain', 'quizzy-frontend-app-2026'], {
    cwd: path.join(__dirname, 'frontend'),
    shell: true,
    stdio: 'pipe'
  });

  frontendTunnel.stdout.on('data', (data) => {
    const line = data.toString().trim();
    if (line) console.log(`🌟 [PUBLIC FRONTEND APP TUNNEL] ${line}`);
  });

  frontendTunnel.stderr.on('data', (data) => {
    const line = data.toString().trim();
    if (line) console.log(`[FRONTEND TUNNEL ERROR] ${line}`);
  });
}, 4000);
