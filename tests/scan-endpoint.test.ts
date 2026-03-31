/* eslint-disable import/no-nodejs-modules */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildScanEndpoint } from '../src/services/scan-endpoint.js';

void test('scan endpoint uses provided resolved folder id', () => {
  const endpoint = buildScanEndpoint('http://127.0.0.1:8384/', 'vault-id', 'Notes/a.md');
  assert.equal(
    endpoint,
    'http://127.0.0.1:8384/rest/db/scan?folder=vault-id&sub=Notes%2Fa.md',
  );
});
