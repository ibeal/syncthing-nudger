import { FileSystemAdapter, Plugin } from 'obsidian';
import { registerCommands } from './commands';
import { DEFAULT_SETTINGS } from './settings';
import { FolderIdResolver } from './services/folder-id-resolver';
import { isMobileRuntime } from './services/mobile-guard';
import { PathMapper } from './services/path-mapper';
import { SyncthingClient } from './services/syncthing-client';
import { TriggerManager } from './services/trigger-manager';
import { FolderResolution, SyncthingNudgerSettings } from './types';
import { NoticeManager } from './ui/notices';
import { SyncthingNudgerSettingTab } from './ui/settings-tab';

const FOLDER_UNAVAILABLE_NOTICE_KEY = 'folder-unavailable';

export default class SyncthingNudgerPlugin extends Plugin {
  settings: SyncthingNudgerSettings;
  readonly notices = new NoticeManager();
  readonly pathMapper = new PathMapper();

  private triggerManager: TriggerManager | null = null;
  private detectedFolder: FolderResolution = {
    ok: false,
    message: 'Folder detection not yet run.',
  };

  private readonly syncthingClient = new SyncthingClient(
    () => ({
      apiUrl: this.settings.apiUrl,
      apiKey: this.settings.apiKey,
    }),
    (message) => this.debug(message),
  );

  private readonly folderResolver = new FolderIdResolver({
    getFolders: async () => this.syncthingClient.getFolders(),
    pathMapper: this.pathMapper,
    debugLog: (message) => this.debug(message),
  });

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new SyncthingNudgerSettingTab(this.app, this));

    if (isMobileRuntime()) {
      if (!this.settings.mobileStartupNoticeShown) {
        this.notices.info('Syncthing Trigger runs on desktop only. Mobile mode is no-op.');
        this.settings.mobileStartupNoticeShown = true;
        await this.saveSettings();
      }
      this.debug('Mobile runtime detected. Triggers and commands are intentionally not registered.');
      return;
    }

    await this.refreshFolderDetection(false);
    registerCommands(this);

    this.triggerManager = new TriggerManager(this);
    this.triggerManager.register();
    this.debug('Syncthing Trigger loaded.');
  }

  onunload(): void {
    this.triggerManager?.clearPending();
  }

  getDetectedFolder(): FolderResolution {
    return this.detectedFolder;
  }

  async refreshFolderDetection(showNotice = true): Promise<FolderResolution> {
    const vaultPath = this.getVaultBasePath();
    this.detectedFolder = await this.folderResolver.resolveForVault(vaultPath);

    if (showNotice) {
      if (this.detectedFolder.ok) {
        this.notices.info(`Detected Syncthing folder: ${this.detectedFolder.folderId}`);
      } else {
        this.notices.error(`Folder detection failed: ${this.detectedFolder.message}`, FOLDER_UNAVAILABLE_NOTICE_KEY);
      }
    }

    return this.detectedFolder;
  }

  async loadSettings(): Promise<void> {
    const loaded = (await this.loadData()) as Partial<SyncthingNudgerSettings> | null;
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
      triggers: {
        ...DEFAULT_SETTINGS.triggers,
        ...loaded?.triggers,
      },
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async scanPath(path: string, source: string): Promise<void> {
    if (!this.settings.enabled) {
      this.debug(`Skipping ${source} scan because plugin is disabled.`);
      return;
    }

    const folder = await this.getResolvedFolder();
    if (!folder.ok || !folder.folderId) {
      this.notices.error(`Scan skipped: ${folder.message}`, FOLDER_UNAVAILABLE_NOTICE_KEY);
      this.debug(`Scan skipped (${source}): ${folder.message}`);
      return;
    }

    const normalizedPath = this.pathMapper.normalizeVaultPath(path);
    const result = await this.syncthingClient.triggerScan(folder.folderId, normalizedPath);
    if (!result.ok) {
      this.notices.error(`Syncthing scan failed: ${result.message}`, 'scan-failed');
      this.debug(`Scan failed (${source}): ${result.message}`);
      return;
    }

    this.debug(`Scan ok (${source}): ${normalizedPath || '<root>'}`);
  }

  async scanRename(newPath: string, oldPath: string): Promise<void> {
    const hints = this.pathMapper.renameHints(oldPath, newPath);
    for (const hint of hints) {
      await this.scanPath(hint, 'rename');
    }
  }

  async scanDelete(deletedPath: string): Promise<void> {
    const hints = this.pathMapper.deleteHints(deletedPath);
    for (const hint of hints) {
      await this.scanPath(hint, 'delete');
    }
  }

  async runApiTest(showNotice = false): Promise<boolean> {
    const result = await this.syncthingClient.testApi();
    const folderResult = result.ok
      ? await this.refreshFolderDetection(false)
      : { ok: false, message: 'Folder detection skipped because API test failed.' };

    if (showNotice) {
      if (result.ok) {
        if (folderResult.ok) {
          this.notices.info(`Syncthing API ok. Folder detected: ${folderResult.folderId}`);
        } else {
          this.notices.error(`Syncthing API ok, but folder detection failed: ${folderResult.message}`);
        }
      } else {
        this.notices.error(`Syncthing API test failed: ${result.message}`, 'api-test-failed');
      }
    }

    this.debug(`API test result: ${result.ok ? 'ok' : 'fail'} - ${result.message}`);
    return result.ok;
  }

  private async getResolvedFolder(): Promise<FolderResolution> {
    if (this.detectedFolder.ok && this.detectedFolder.folderId) {
      return this.detectedFolder;
    }

    return this.refreshFolderDetection(false);
  }

  private getVaultBasePath(): string | null {
    const adapter = this.app.vault.adapter;
    if (adapter instanceof FileSystemAdapter) {
      return adapter.getBasePath();
    }

    return null;
  }

  private debug(message: string): void {
    if (this.settings.debugLogging) {
      console.debug(`[syncthing-nudger] ${message}`);
    }
  }
}
