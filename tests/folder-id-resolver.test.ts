/* eslint-disable import/no-nodejs-modules */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FolderIdResolver } from '../src/services/folder-id-resolver.js';
import { PathMapper } from '../src/services/path-mapper.js';
import { SyncthingFolder } from '../src/types.js';

function createResolver(folders: SyncthingFolder[]) {
  return new FolderIdResolver({
    getFolders: async () => ({ ok: true, folders, message: 'ok' }),
    pathMapper: new PathMapper(),
    debugLog: () => undefined,
  });
}

void test('exact path match resolves correct folder id', async () => {
  const resolver = createResolver([{ id: 'vault', path: '/Users/me/Vault' }]);
  const result = await resolver.resolveForVault('/Users/me/Vault');

  assert.equal(result.ok, true);
  assert.equal(result.folderId, 'vault');
});

void test('normalized path match works with windows-style separators', async () => {
  const resolver = createResolver([{ id: 'vault', path: 'C:\\Vault\\Notes' }]);
  const result = await resolver.resolveForVault('c:/vault/notes');

  assert.equal(result.ok, true);
  assert.equal(result.folderId, 'vault');
});

void test('no match returns structured error', async () => {
  const resolver = createResolver([{ id: 'vault', path: '/Users/me/Other' }]);
  const result = await resolver.resolveForVault('/Users/me/Vault');

  assert.equal(result.ok, false);
  assert.match(result.message, /No Syncthing folder matches/);
});

void test('multiple matches return ambiguity error', async () => {
  const resolver = createResolver([
    { id: 'root', path: '/Users/me' },
    { id: 'vault', path: '/Users/me/Vault' },
  ]);
  const result = await resolver.resolveForVault('/Users/me/Vault/Sub');

  assert.equal(result.ok, false);
  assert.match(result.message, /Multiple Syncthing folders could contain this vault path/);
});
