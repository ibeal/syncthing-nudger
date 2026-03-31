/* eslint-disable import/no-nodejs-modules */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS } from '../src/settings.js';

void test('default settings no longer require folder id', () => {
  assert.equal('folderId' in DEFAULT_SETTINGS, false);
  assert.equal(DEFAULT_SETTINGS.apiUrl.length > 0, true);
});
