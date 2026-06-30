/**
 * Bag Chaser Save Utilities
 * Handles emergency backups before risky actions.
 */

const BACKUP_KEY = 'bag-chaser-backup';
const SAVE_KEY = 'bag-chaser-save';

export const backupSave = () => {
  try {
    const currentSave = localStorage.getItem(SAVE_KEY);
    if (currentSave) {
      localStorage.setItem(BACKUP_KEY, currentSave);
    }
  } catch (e) {
    console.error('Failed to create emergency backup:', e);
  }
};

export const restoreBackup = () => {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (backup) {
      localStorage.setItem(SAVE_KEY, backup);
      window.location.reload();
    }
  } catch (e) {
    console.error('Failed to restore backup:', e);
  }
};
