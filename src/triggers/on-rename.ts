import { TFile } from 'obsidian';
import SyncthingNudgerPlugin from '../main';

export function registerRenameTrigger(
  plugin: SyncthingNudgerPlugin,
  onRename: (file: TFile, oldPath: string) => Promise<void>,
): void {
  plugin.registerEvent(
    plugin.app.vault.on('rename', async (file, oldPath) => {
      if (!plugin.settings.enabled || !plugin.settings.triggers.rename) {
        return;
      }

      if (!(file instanceof TFile)) {
        return;
      }

      await onRename(file, oldPath);
    }),
  );
}
