'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAiApiHandler, parseDay, parseTerms } = require('./ai-api.cjs');

test('calendar day returns lunar date and solar term without exposing other records', () => {
  const result = parseDay('2026-02-17');
  assert.equal(result.lunarDate, '二〇二六年正月初一');
  assert.equal(result.solarTerm, null);
  assert.equal(parseDay('2026-02-30'), null);
  assert.equal(parseDay('1899-01-01'), null);
});

test('solar term endpoint returns all 24 terms in date order', () => {
  const result = parseTerms('2026');
  assert.equal(result.terms.length, 24);
  assert.equal(result.terms[0].name, '小寒');
  assert.equal(result.terms.at(-1).name, '冬至');
  assert.deepEqual([...result.terms].sort((a, b) => a.date.localeCompare(b.date)), result.terms);
});

test('weather tool requires a bearer token and sends a fixed provider request', async () => {
  let requested;
  const handler = createAiApiHandler({
    apiToken: 'local-test-token',
    now: () => new Date('2026-09-30T00:00:00Z'),
    readJson: async () => ({ latitude: 29.53, longitude: 106.57, date: '2026-09-30' }),
    fetchImpl: async (url) => {
      requested = new URL(url);
      return { ok: true, json: async () => ({ hourly: {
        time: ['2026-09-30T00:00', '2026-09-30T01:00', '2026-10-01T00:00'],
        precipitation: [1, 2, 8], cloud_cover: [40, 60, 70],
      } }) };
    },
  });
  const url = new URL('http://local/api/v1/weather/preview');
  assert.equal((await handler({ method: 'POST', headers: {} }, url)).status, 401);
  const result = await handler({ method: 'POST', headers: { authorization: 'Bearer local-test-token' } }, url);
  assert.equal(result.status, 200);
  assert.equal(result.body.precipitationTotalMm, 3);
  assert.equal(result.body.hourly.length, 2);
  assert.equal(requested.hostname, 'api.open-meteo.com');
  assert.equal(requested.searchParams.get('latitude'), '29.53');
});

test('weather tool rejects invalid coordinates and dates before network use', async () => {
  let calls = 0;
  const handler = createAiApiHandler({
    apiToken: 'token', readJson: async () => ({ latitude: 91, longitude: 0 }),
    fetchImpl: async () => { calls++; },
  });
  const result = await handler({ method: 'POST', headers: { authorization: 'Bearer token' } }, new URL('http://local/api/v1/weather/preview'));
  assert.equal(result.status, 400);
  assert.equal(calls, 0);
});
