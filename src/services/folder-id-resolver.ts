import { PathMapper } from './path-mapper';
import { FolderResolution, SyncthingFolder } from '../types';

interface FolderResolverDeps {
  getFolders: () => Promise<{ ok: boolean; folders: SyncthingFolder[]; message: string }>;
  pathMapper: PathMapper;
  debugLog: (message: string) => void;
}

interface FolderCandidate {
  folder: SyncthingFolder;
  kind: 'exact' | 'vault-descendant';
}

export class FolderIdResolver {
  constructor(private readonly deps: FolderResolverDeps) {}

  async resolveForVault(vaultPath: string | null): Promise<FolderResolution> {
    if (!vaultPath) {
      return { ok: false, message: 'Vault path unavailable. Cannot auto-detect Syncthing folder.' };
    }

    const folderResult = await this.deps.getFolders();
    if (!folderResult.ok) {
      return { ok: false, message: folderResult.message };
    }

    const candidates = this.findMatches(vaultPath, folderResult.folders);
    const exactCandidates = candidates.filter((candidate) => candidate.kind === 'exact');

    const exactMatch = exactCandidates[0];
    if (exactCandidates.length === 1 && exactMatch) {
      return this.success(exactMatch.folder, 'Matched Syncthing folder by exact path.');
    }

    if (exactCandidates.length > 1) {
      return {
        ok: false,
        message: `Multiple Syncthing folders exactly match this vault path: ${exactCandidates
          .map((candidate) => candidate.folder.id)
          .join(', ')}`,
      };
    }

    const descendantCandidates = candidates.filter((candidate) => candidate.kind === 'vault-descendant');
    const descendantMatch = descendantCandidates[0];
    if (descendantCandidates.length === 1 && descendantMatch) {
      return this.success(descendantMatch.folder, 'Matched Syncthing folder by containing path.');
    }

    if (descendantCandidates.length > 1) {
      return {
        ok: false,
        message: `Multiple Syncthing folders could contain this vault path: ${descendantCandidates
          .map((candidate) => candidate.folder.id)
          .join(', ')}`,
      };
    }

    return {
      ok: false,
      message: 'No Syncthing folder matches this vault path.',
    };
  }

  private success(folder: SyncthingFolder, message: string): FolderResolution {
    this.deps.debugLog(`${message} id=${folder.id} path=${folder.path}`);
    return {
      ok: true,
      folderId: folder.id,
      folderPath: folder.path,
      message,
    };
  }

  private findMatches(vaultPath: string, folders: SyncthingFolder[]): FolderCandidate[] {
    const vaultComparable = this.deps.pathMapper.comparableAbsolutePath(vaultPath);

    return folders
      .map((folder) => {
        const folderComparable = this.deps.pathMapper.comparableAbsolutePath(folder.path);
        if (folderComparable === vaultComparable) {
          return { folder, kind: 'exact' } satisfies FolderCandidate;
        }

        if (vaultComparable.startsWith(`${folderComparable}/`)) {
          return { folder, kind: 'vault-descendant' } satisfies FolderCandidate;
        }

        return null;
      })
      .filter((value): value is FolderCandidate => value !== null);
  }
}
