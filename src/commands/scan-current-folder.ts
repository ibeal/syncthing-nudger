import { TFile } from 'obsidian';
import SyncthingNudgerPlugin from '../main';

export function registerScanCurrentFolderCommand(plugin: SyncthingNudgerPlugin): void {
  plugin.addCommand({
    id: 'scan-current-folder',
    name: 'Scan current folder',
    checkCallback: (checking) => {
      const file = plugin.app.workspace.getActiveFile();
      if (!(file instanceof TFile)) {
        return false;
      }

      if (!checking) {
        const folder = plugin.pathMapper.parentPath(file.path);
        void plugin.scanPath(folder, 'command:folder');
      }

      return true;
    },
  });
}
