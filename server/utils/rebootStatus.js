const fs = require('fs');
const os = require('os');

/**
 * Reboot-required detection for the /health probe.
 *
 * Raspberry Pi OS kernel packages do NOT create /var/run/reboot-required, so the
 * stock Debian flag alone misses the case we care about most. Instead compare the
 * running kernel against the newest one installed under /lib/modules for the same
 * flavour (e.g. "-rpi-v8"; the Pi 5 "-rpi-2712" kernels are installed alongside
 * and must be ignored). Unattended-upgrades installs kernels but never reboots, so
 * this is what tells Hermes a human-triggered reboot is due.
 */

const parseVersion = (release) => {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(release);
  return m ? m.slice(1).map(Number) : null;
};

const compareVersions = (a, b) => {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
};

const getRebootStatus = () => {
  const running = os.release();
  const flavourMatch = /-rpi-[^-]+$/.exec(running);
  const runningVersion = parseVersion(running);

  let newestInstalled = running;
  try {
    if (flavourMatch && runningVersion) {
      let newestVersion = runningVersion;
      for (const release of fs.readdirSync('/lib/modules')) {
        const version = parseVersion(release);
        if (!release.endsWith(flavourMatch[0]) || !version) continue;
        if (compareVersions(version, newestVersion) > 0) {
          newestVersion = version;
          newestInstalled = release;
        }
      }
    }
  } catch (_) { /* no /lib/modules (dev machine) — fall back to the flag file */ }

  const flagFile = fs.existsSync('/var/run/reboot-required');
  const kernelPending = newestInstalled !== running;

  return {
    required: kernelPending || flagFile,
    running_kernel: running,
    installed_kernel: newestInstalled,
    flag_file: flagFile
  };
};

module.exports = { getRebootStatus };
