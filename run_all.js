const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Quizzy Application (Backend + Frontend)...');

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

// 2. Start Frontend Dev Server on Port 5173
const frontend = spawn('npx', ['vite', '--port', '5173'], {
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
