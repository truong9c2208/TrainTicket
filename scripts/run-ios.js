const os = require('os');
const fs = require('fs');
const path = require('path');

const isMac = os.platform() === 'darwin';
const iosDir = path.join(process.cwd(), 'ios');

if (!isMac) {
  console.error('iOS builds require macOS with Xcode.');
  console.error('Current OS: ' + os.platform());
  console.error('Use Android on this machine: bun run android');
  process.exit(1);
}

if (!fs.existsSync(iosDir)) {
  console.error('Missing ios native project directory.');
  console.error('Initialize a proper React Native app scaffold first.');
  process.exit(1);
}

require('child_process').spawn('npx', ['react-native', 'run-ios'], {
  stdio: 'inherit',
  shell: true,
});
