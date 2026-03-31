export interface TriggerSettings {
  openFile: boolean;
  modify: boolean;
  rename: boolean;
  delete: boolean;
}

export interface SyncthingNudgerSettings {
  enabled: boolean;
  apiUrl: string;
  apiKey: string;
  cliPath: string;
  debounceSeconds: number;
  debugLogging: boolean;
  triggers: TriggerSettings;
}

export interface ScanResult {
  ok: boolean;
  status: number;
  message: string;
}

export interface SyncthingFolder {
  id: string;
  path: string;
  label?: string;
}

export interface FolderResolution {
  ok: boolean;
  folderId?: string;
  folderPath?: string;
  message: string;
}
