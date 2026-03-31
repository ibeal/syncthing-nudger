import { TFile } from 'obsidian';
import SyncthingNudgerPlugin from '../main';
import { TriggerManager } from '../services/trigger-manager';

export function registerOpenTrigger(
  plugin: SyncthingNudgerPlugin,
  onOpen: (file: TFile) => Promise<void>,
): void {
  plugin.registerEvent(
    plugin.app.workspace.on('file-open', async (file) => {
      if (!plugin.settings.enabled || !plugin.settings.triggers.openFile) {
        return;
      }

      const openedFile = TriggerManager.asFile(file);
      if (!openedFile) {
        return;
      }

      await onOpen(openedFile);
    }),
  );
}
