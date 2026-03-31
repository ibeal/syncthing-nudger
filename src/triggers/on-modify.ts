import { TFile } from 'obsidian';
import SyncthingNudgerPlugin from '../main';

export function registerModifyTrigger(
  plugin: SyncthingNudgerPlugin,
  onModify: (file: TFile) => void,
): void {
  plugin.registerEvent(
    plugin.app.vault.on('modify', (file) => {
      if (!plugin.settings.enabled || !plugin.settings.triggers.modify) {
        return;
      }

      if (!(file instanceof TFile)) {
        return;
      }

      onModify(file);
    }),
  );
}
