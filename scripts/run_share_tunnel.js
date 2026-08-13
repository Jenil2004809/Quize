const { spawn } = require('child_process');

console.log('Starting Cloudflare Public Tunnel...');
console.log('Please wait a few seconds...\n');

const cloudflared = spawn('npx', ['-y', 'cloudflared', 'tunnel', '--url', 'http://localhost:5173'], { shell: true });

let linkFound = false;

const handleOutput = (text) => {
  if (linkFound) return;
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match) {
    linkFound = true;
    const link = match[0];
    console.clear();
    console.log('\x1b[36m=========================================================================\x1b[0m');
    console.log('\x1b[1m\x1b[32m         🚀 ONLINE QUIZ SYSTEM - LIVE PUBLIC SHARE LINK 🚀               \x1b[0m');
    console.log('\x1b[36m=========================================================================\x1b[0m');
    console.log('');
    console.log(' ✨ YOUR PUBLIC SHARE LINK IS READY:');
    console.log('');
    console.log('  \x1b[1m\x1b[33m👉  ' + link + '  👈\x1b[0m');
    console.log('');
    console.log(' 📋 Share this link with students or teachers to access the live app!');
    console.log(' 📋 (Link copied to your clipboard automatically!)');
    console.log('\x1b[36m=========================================================================\x1b[0m');
    console.log('\x1b[31m\x1b[1m ⚠️  IMPORTANT: KEEP THIS TERMINAL WINDOW OPEN WHILE SHARING! \x1b[0m');
    console.log('\x1b[33m 📌 If you close this window, the link will expire and show Error 1033.\x1b[0m');
    console.log('\x1b[36m=========================================================================\x1b[0m');
    console.log('\n(Press Ctrl+C to stop sharing)');

    // Copy link to Windows clipboard automatically
    try {
      const clipProcess = spawn('clip', [], { shell: true });
      clipProcess.stdin.write(link);
      clipProcess.stdin.end();
    } catch (e) {
      // clipboard fallback
    }
  }
};

cloudflared.stdout.on('data', data => handleOutput(data.toString()));
cloudflared.stderr.on('data', data => handleOutput(data.toString()));
