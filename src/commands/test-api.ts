/* eslint-disable obsidianmd/ui/sentence-case */
import SyncthingNudgerPlugin from '../main';

export function registerTestApiCommand(plugin: SyncthingNudgerPlugin): void {
  plugin.addCommand({
    id: 'test-syncthing-api-connection',
    name: 'Test syncthing api connection',
    callback: async () => {
      await plugin.runApiTest(true);
    },
  });
}
