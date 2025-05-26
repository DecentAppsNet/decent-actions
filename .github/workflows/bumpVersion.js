// bumpVersion.js
const DEFAULT_VERSION = 'v0.0.1'; // Default version if none is provided

function _exitWith(version) {
  console.log(version);
  process.exit(0);
}

// Collect arguments.
const input = (process.argv[2] || '').trim();  // latest tag like "v1.2.3"
const override = (process.argv[3] || '').trim();  // optional MAJOR_MINOR_VERSION like "2.0"

// Check for valid input tag.
if (!input.startsWith('v') || input.length < 6) _exitWith(DEFAULT_VERSION);

// Parse input
const parts = input.slice(1).split('.').map(Number);
if (parts.length !== 3 || parts.some(isNaN)) _exitWith(DEFAULT_VERSION);
const [major, minor, patch] = parts;

// Handle major/minor override. Ignore if format doesn't match or doesn't change major/minor.
if (override) {
  const [overrideMajor, overrideMinor] = override.split('.').map(Number);
  if (!isNaN(overrideMajor) && !isNaN(overrideMinor) && (overrideMajor !== major || overrideMinor !== minor)) {
    _exitWith(`v${overrideMajor}.${overrideMinor}.0`);
  }
}

// Default: bump patch
_exitWith(`v${major}.${minor}.${patch + 1}`);