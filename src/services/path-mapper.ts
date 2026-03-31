export class PathMapper {
  normalizeVaultPath(vaultRelativePath: string): string {
    const normalized = vaultRelativePath.replace(/\\/g, '/').replace(/^\.\//, '');
    return normalized.replace(/^\/+/, '');
  }

  normalizeAbsolutePath(absolutePath: string): string {
    const normalized = absolutePath.replace(/\\/g, '/').replace(/\/+$/, '');
    return normalized || '/';
  }

  comparableAbsolutePath(absolutePath: string): string {
    return this.normalizeAbsolutePath(absolutePath).toLocaleLowerCase();
  }

  parentPath(vaultRelativePath: string): string {
    const normalized = this.normalizeVaultPath(vaultRelativePath);
    if (!normalized.includes('/')) {
      return '';
    }

    return normalized.slice(0, normalized.lastIndexOf('/'));
  }

  renameHints(oldPath: string, newPath: string): string[] {
    const oldNormalized = this.normalizeVaultPath(oldPath);
    const newNormalized = this.normalizeVaultPath(newPath);

    return this.uniq([
      oldNormalized,
      newNormalized,
      this.parentPath(oldNormalized),
      this.parentPath(newNormalized),
    ]);
  }

  deleteHints(pathToDeletedItem: string): string[] {
    const normalized = this.normalizeVaultPath(pathToDeletedItem);
    return this.uniq([normalized, this.parentPath(normalized)]);
  }

  private uniq(values: string[]): string[] {
    return [...new Set(values.filter((value) => value.length > 0))];
  }
}
