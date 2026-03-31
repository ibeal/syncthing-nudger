/* eslint-disable obsidianmd/ui/sentence-case */
import SyncthingNudgerPlugin from '../main';

export function registerTestCliCommand(plugin: SyncthingNudgerPlugin): void {
  plugin.addCommand({
    id: 'test-syncthing-cli-connection',
    name: 'Test syncthing cli connection',
    callback: async () => {
      await plugin.runCliTest(true);
    },
  });
}
