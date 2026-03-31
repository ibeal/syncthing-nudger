import SyncthingNudgerPlugin from '../main';
import { registerScanCurrentFileCommand } from './scan-current-file';
import { registerScanCurrentFolderCommand } from './scan-current-folder';
import { registerTestApiCommand } from './test-api';
import { registerTestCliCommand } from './test-cli';

export function registerCommands(plugin: SyncthingNudgerPlugin): void {
  registerScanCurrentFileCommand(plugin);
  registerScanCurrentFolderCommand(plugin);
  registerTestApiCommand(plugin);
  registerTestCliCommand(plugin);
}
