const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

process.env.NODE_ENV = 'test';
const app = require('../server');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('root responds with the mounted API route prefixes', async () => {
  const response = await fetch(baseUrl);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.endpoints.auth, '/api/auth');
  assert.equal(body.endpoints.products, '/api/products');
  assert.equal(body.endpoints.admin, '/api/admin');
  assert.equal(body.endpoints.payments, undefined);
});

test('health reports unavailable database as not ready', async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.database, 'unavailable');
});

test('database-backed routes expose temporary database unavailability', async () => {
  const response = await fetch(`${baseUrl}/api/products`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.success, false);
});

test('protected auth route rejects requests without a token', async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
});

test('development frontend origin is allowed for credentialed CORS', async () => {
  const response = await fetch(`${baseUrl}/api/products`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET',
    },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
});

test('untrusted browser origins cannot make state-changing requests', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      Origin: 'https://untrusted.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.success, false);
});

test('unknown API paths return the standard not-found response', async () => {
  const response = await fetch(`${baseUrl}/api/not-a-real-route`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
});
