'use strict';

const assert = require('node:assert/strict');
const { after, before, describe, it } = require('node:test');
const { createAppServer, parseOptions, parsePort } = require('../bin/hisab-calculator.cjs');

describe('CLI options', () => {
  it('uses safe local defaults', () => {
    assert.deepEqual(parseOptions([], {}), { host: '127.0.0.1', port: 4174 });
  });

  it('parses host and port options', () => {
    assert.deepEqual(parseOptions(['--host', '0.0.0.0', '--port=8080'], {}), {
      host: '0.0.0.0',
      port: 8080
    });
  });

  it('rejects invalid ports', () => {
    assert.throws(() => parsePort('70000'), /Invalid port/);
    assert.throws(() => parsePort('nope'), /Invalid port/);
  });
});

describe('calculator web server', () => {
  let server;
  let origin;

  before(async () => {
    server = createAppServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    origin = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });

  it('serves the Bengali calculator home page', async () => {
    const response = await fetch(origin);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.match(html, /ক্যালকুলেটর/);
    assert.match(html, /beforeinstallprompt/);
    assert.match(html, /hisab-calculator\.apk/);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  });

  it('serves static app assets', async () => {
    const response = await fetch(`${origin}/script.js`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /javascript/);
    assert.match(await response.text(), /vat/);
  });

  it('serves installable app metadata and icons', async () => {
    const manifestResponse = await fetch(`${origin}/manifest.webmanifest`);
    assert.equal(manifestResponse.status, 200);
    const manifest = await manifestResponse.json();
    assert.equal(manifest.display, 'standalone');
    for (const icon of manifest.icons) {
      const iconResponse = await fetch(new URL(icon.src, `${origin}/`));
      assert.equal(iconResponse.status, 200);
      assert.match(iconResponse.headers.get('content-type'), /image\/png/);
    }
  });

  it('does not expose package files or unknown paths', async () => {
    for (const pathname of ['/package.json', '/bin/hisab-calculator.cjs', '/missing']) {
      const response = await fetch(`${origin}${pathname}`);
      assert.equal(response.status, 404);
    }
  });

  it('rejects unsupported request methods', async () => {
    const response = await fetch(origin, { method: 'POST' });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET, HEAD');
  });

  it('supports HEAD requests without returning a body', async () => {
    const response = await fetch(origin, { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '');
  });
});
