const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const androidDir = path.join(process.cwd(), 'android');
const localPropertiesPath = path.join(androidDir, 'local.properties');

if (!fs.existsSync(androidDir)) {
  console.error('Missing android native project directory.');
  console.error('This folder is currently app-code only (no native scaffold).');
  console.error('Create a React Native CLI project and copy src into it.');
  process.exit(1);
}

function findAndroidSdk() {
  const envSdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (envSdk && fs.existsSync(envSdk)) {
    return envSdk;
  }

  const candidates = [
    path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
    'C:/Android/Sdk',
  ];

  return candidates.find((p) => fs.existsSync(p));
}

function writeLocalProperties(sdkPath) {
  const escaped = sdkPath.replace(/\\/g, '\\\\');
  fs.writeFileSync(localPropertiesPath, `sdk.dir=${escaped}\n`, 'utf8');
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options,
  });
}

function readApplicationId() {
  const buildGradlePath = path.join(androidDir, 'app', 'build.gradle');
  if (!fs.existsSync(buildGradlePath)) {
    return 'com.trainticketshell';
  }

  const content = fs.readFileSync(buildGradlePath, 'utf8');
  const match = content.match(/applicationId\s+"([^"]+)"/);
  return match ? match[1] : 'com.trainticketshell';
}

const sdkPath = findAndroidSdk();

if (!sdkPath) {
  console.error('Android SDK not found.');
  console.error('Install Android Studio and Android SDK, then set ANDROID_HOME.');
  console.error('Expected default location: %USERPROFILE%\\AppData\\Local\\Android\\Sdk');
  process.exit(1);
}

writeLocalProperties(sdkPath);

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const projectCacheDir = path.join(os.homedir(), '.gradle', 'project-cache', 'mtp-mobile-android');
const adbPath = path.join(sdkPath, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');

if (!fs.existsSync(adbPath)) {
  console.error('adb not found under Android SDK platform-tools.');
  console.error(`Expected: ${adbPath}`);
  process.exit(1);
}

const assemble = spawnSync(
  gradlew,
  ['--no-daemon', '--project-cache-dir', projectCacheDir, 'app:installDebug'],
  {
    cwd: androidDir,
    stdio: 'inherit',
    shell: true,
  },
);

if (assemble.status !== 0) {
  process.exit(assemble.status || 1);
}

const appId = readApplicationId();
const launch = run(adbPath, ['shell', 'am', 'start', '-n', `${appId}/${appId}.MainActivity`]);

if (launch.status !== 0) {
  console.warn('APK installed, but app launch command failed.');
  console.warn('If emulator/device is not connected, start one and rerun bun run android.');
}

console.log('Android debug install completed.');
console.log('Start Metro in another terminal if needed: bun run start');
process.exit(0);
