import { SyncthingNudgerSettings } from './types';

export const DEFAULT_SETTINGS: SyncthingNudgerSettings = {
  enabled: true,
  apiUrl: 'http://127.0.0.1:8384',
  apiKey: '',
  cliPath: 'syncthing',
  debounceSeconds: 2,
  debugLogging: false,
  triggers: {
    openFile: true,
    modify: true,
    rename: true,
    delete: true,
  },
};
