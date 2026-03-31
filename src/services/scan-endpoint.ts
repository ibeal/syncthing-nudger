export function buildScanEndpoint(baseUrl: string, folderId: string, subPath?: string): string {
  const params = new URLSearchParams({ folder: folderId.trim() });
  if (subPath && subPath.length > 0) {
    params.set('sub', subPath);
  }

  return `${baseUrl.replace(/\/$/, '')}/rest/db/scan?${params.toString()}`;
}
