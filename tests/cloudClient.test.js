import test from 'node:test';
import assert from 'node:assert/strict';
import { getCloudSession, signOut } from '../src/cloudClient.js';

function installLocalStorage() {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  return values;
}

test('signOut clears the local session even when the remote logout request fails', async () => {
  const values = installLocalStorage();
  values.set('quietgridlabs-cloud-session', JSON.stringify({
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
  }));

  await assert.rejects(signOut(), /Cloud storage is not configured/);
  assert.equal(getCloudSession(), null);
  assert.equal(values.has('quietgridlabs-cloud-session'), false);

  delete globalThis.localStorage;
});
