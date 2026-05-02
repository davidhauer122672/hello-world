const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const RETENTION_DAYS = 7;

function runBackup() {
  if (!fs.existsSync(DATA_DIR)) return { backed: 0 };

  const today = new Date().toISOString().split('T')[0];
  const dest = path.join(BACKUP_DIR, today);

  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  let backed = 0;

  for (const file of files) {
    try {
      fs.copyFileSync(path.join(DATA_DIR, file), path.join(dest, file));
      backed++;
    } catch (err) {
      console.error(`[backup] Failed to copy ${file}:`, err.message);
    }
  }

  // Prune old backups
  pruneBackups();

  console.log(`[backup] ${backed} file(s) backed up to ${dest}`);
  return { backed, destination: dest };
}

function pruneBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const dirs = fs.readdirSync(BACKUP_DIR).filter(d => {
    const full = path.join(BACKUP_DIR, d);
    return fs.statSync(full).isDirectory() && d < cutoffStr;
  });

  for (const dir of dirs) {
    const full = path.join(BACKUP_DIR, dir);
    fs.rmSync(full, { recursive: true, force: true });
    console.log(`[backup] Pruned old backup: ${dir}`);
  }
}

function startBackupScheduler() {
  console.log('[backup] Scheduler started. Daily backup at 2:00 AM.');
  cron.schedule('0 2 * * *', () => {
    try {
      runBackup();
    } catch (err) {
      console.error('[backup] Scheduled backup failed:', err.message);
    }
  });
}

module.exports = { runBackup, startBackupScheduler };
