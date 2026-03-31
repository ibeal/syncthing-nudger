import { TFile } from 'obsidian';
import SyncthingNudgerPlugin from '../main';

export function registerDeleteTrigger(
  plugin: SyncthingNudgerPlugin,
  onDelete: (file: TFile) => Promise<void>,
): void {
  plugin.registerEvent(
    plugin.app.vault.on('delete', async (file) => {
      if (!plugin.settings.enabled || !plugin.settings.triggers.delete) {
        return;
      }

      if (!(file instanceof TFile)) {
        return;
      }

      await onDelete(file);
    }),
  );
}
