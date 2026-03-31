import { TFile } from 'obsidian';
import SyncthingNudgerPlugin from '../main';

export function registerScanCurrentFileCommand(plugin: SyncthingNudgerPlugin): void {
  plugin.addCommand({
    id: 'scan-current-file',
    name: 'Scan current file',
    checkCallback: (checking) => {
      const file = plugin.app.workspace.getActiveFile();
      if (!(file instanceof TFile)) {
        return false;
      }

      if (!checking) {
        void plugin.scanPath(file.path, 'command:file');
      }

      return true;
    },
  });
}
