import { requestUrl } from 'obsidian';
import { ScanResult, SyncthingFolder } from '../types';
import { buildScanEndpoint } from './scan-endpoint';

interface SyncthingConnection {
  apiUrl: string;
  apiKey: string;
}

export class SyncthingClient {
  constructor(
    private readonly getConnection: () => SyncthingConnection,
    private readonly debugLog: (message: string) => void,
  ) {}

  async testApi(): Promise<ScanResult> {
    const baseUrl = this.baseUrl();
    const response = await this.safeRequest(`${baseUrl}/rest/system/ping`, 'GET');
    if (!response.ok) {
      return response;
    }

    return {
      ok: true,
      status: response.status,
      message: 'Syncthing API reachable.',
    };
  }

  async getFolders(): Promise<{ ok: boolean; folders: SyncthingFolder[]; message: string }> {
    const endpoint = `${this.baseUrl()}/rest/config`;
    const response = await this.safeRequest(endpoint, 'GET');
    if (!response.ok) {
      return { ok: false, folders: [], message: response.message };
    }

    const body = response.body as { folders?: Array<{ id?: string; path?: string; label?: string }> };
    const folders = (body.folders ?? [])
      .filter((folder) => typeof folder.id === 'string' && typeof folder.path === 'string')
      .map((folder) => ({
        id: folder.id as string,
        path: folder.path as string,
        label: folder.label,
      }));

    return { ok: true, folders, message: `Loaded ${folders.length} folders from Syncthing.` };
  }


  async triggerScan(folderId: string, subPath?: string): Promise<ScanResult> {
    if (!folderId.trim()) {
      return { ok: false, status: 0, message: 'Missing Syncthing folder ID.' };
    }

    const endpoint = buildScanEndpoint(this.baseUrl(), folderId, subPath);
    this.debugLog(`POST ${endpoint}`);

    const response = await this.safeRequest(endpoint, 'POST');
    if (!response.ok) {
      return response;
    }

    return {
      ok: true,
      status: response.status,
      message: subPath
        ? `Scan requested for: ${subPath}`
        : 'Scan requested for configured Syncthing folder.',
    };
  }

  private baseUrl(): string {
    return this.getConnection().apiUrl.trim().replace(/\/$/, '');
  }

  private async safeRequest(
    url: string,
    method: 'GET' | 'POST',
  ): Promise<ScanResult & { body?: unknown }> {
    const { apiKey } = this.getConnection();
    if (!apiKey.trim()) {
      return { ok: false, status: 0, message: 'Missing Syncthing API key.' };
    }

    try {
      const response = await requestUrl({
        url,
        method,
        headers: {
          'X-API-Key': apiKey.trim(),
        },
      });

      let body: unknown;
      try {
        body = response.json;
      } catch {
        body = undefined;
      }

      return {
        ok: true,
        status: response.status,
        message: 'OK',
        body,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('401') || message.includes('403')) {
        return { ok: false, status: 401, message: 'Syncthing rejected the API key.' };
      }

      return { ok: false, status: 0, message: `Syncthing request failed: ${message}` };
    }
  }
}
