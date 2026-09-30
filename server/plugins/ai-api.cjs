'use strict';

const { Solar } = require('../vendor/lunar.js');

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseDay(value) {
  if (!validDate(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1901 || year > 2099) return null;
  const lunar = Solar.fromYmd(year, month, day).getLunar();
  return {
    date: value,
    lunarDate: lunar.toString(),
    solarTerm: lunar.getJieQi() || null,
  };
}

function parseTerms(yearValue) {
  const year = Number(yearValue);
  if (!Number.isInteger(year) || year < 1901 || year > 2099) return null;
  const terms = [];
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  for (let time = start; time < end; time += 86400000) {
    const date = new Date(time);
    const lunar = Solar.fromYmd(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()).getLunar();
    const name = lunar.getJieQi();
    if (name) terms.push({ date: date.toISOString().slice(0, 10), name });
  }
  return { year, timezone: 'Asia/Shanghai', terms };
}

function todayShanghai(now) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

function checkToken(req, expected) {
  if (!expected) return { status: 503, body: { error: 'weather_api_not_configured' } };
  const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '');
  if (!match) return { status: 401, body: { error: 'bearer_token_required' } };
  const supplied = Buffer.from(match[1]);
  const configured = Buffer.from(expected);
  if (supplied.length !== configured.length || !require('node:crypto').timingSafeEqual(supplied, configured)) {
    return { status: 401, body: { error: 'invalid_bearer_token' } };
  }
  return null;
}

function createAiApiHandler({ apiToken, fetchImpl = globalThis.fetch, readJson, now = () => new Date() } = {}) {
  return async function handle(req, url) {
    if (url.pathname === '/api/v1/calendar/day') {
      if (req.method !== 'GET') return { status: 405, body: { error: 'method_not_allowed' } };
      const result = parseDay(url.searchParams.get('date'));
      return result ? { status: 200, body: result } : { status: 400, body: { error: 'date_must_be_1901_to_2099_yyyy_mm_dd' } };
    }

    if (url.pathname === '/api/v1/calendar/solar-terms') {
      if (req.method !== 'GET') return { status: 405, body: { error: 'method_not_allowed' } };
      const result = parseTerms(url.searchParams.get('year'));
      if (!result) return { status: 400, body: { error: 'year_must_be_1901_to_2099' } };
      if (result.terms.length !== 24) return { status: 502, body: { error: 'solar_term_data_unavailable' } };
      return { status: 200, body: result };
    }

    if (url.pathname === '/api/v1/weather/preview') {
      if (req.method !== 'POST') return { status: 405, body: { error: 'method_not_allowed' } };
      const auth = checkToken(req, apiToken);
      if (auth) return auth;
      let input;
      try { input = await readJson(req); }
      catch { return { status: 400, body: { error: 'invalid_json_body' } }; }
      const latitude = Number(input.latitude), longitude = Number(input.longitude);
      if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
        return { status: 400, body: { error: 'latitude_or_longitude_out_of_range' } };
      }
      const date = input.date || todayShanghai(now());
      if (!validDate(date)) return { status: 400, body: { error: 'date_must_be_yyyy_mm_dd' } };
      const requested = Date.parse(`${date}T00:00:00Z`), today = Date.parse(`${todayShanghai(now())}T00:00:00Z`);
      if (requested < today - 7 * 86400000 || requested > today + 3 * 86400000) {
        return { status: 400, body: { error: 'date_outside_forecast_window' } };
      }
      const target = new URL('https://api.open-meteo.com/v1/forecast');
      target.search = new URLSearchParams({
        latitude: String(latitude), longitude: String(longitude),
        hourly: 'precipitation,cloud_cover', past_days: '7', forecast_days: '4', timezone: 'Asia/Shanghai',
      }).toString();
      try {
        const response = await fetchImpl(target, { signal: AbortSignal.timeout(15000), redirect: 'error' });
        if (!response.ok) return { status: 502, body: { error: 'weather_provider_unavailable' } };
        const data = await response.json();
        const hourly = data.hourly;
        if (!hourly || !Array.isArray(hourly.time) || !Array.isArray(hourly.precipitation) || !Array.isArray(hourly.cloud_cover)) {
          return { status: 502, body: { error: 'weather_provider_response_invalid' } };
        }
        const samples = hourly.time.flatMap((time, index) => {
          if (typeof time !== 'string' || !time.startsWith(`${date}T`)) return [];
          return [{
            time,
            precipitationMm: Number.isFinite(hourly.precipitation[index]) ? hourly.precipitation[index] : null,
            cloudCoverPercent: Number.isFinite(hourly.cloud_cover[index]) ? hourly.cloud_cover[index] : null,
          }];
        });
        if (!samples.length) return { status: 502, body: { error: 'weather_data_unavailable_for_date' } };
        const total = samples.reduce((sum, sample) => sum + (sample.precipitationMm || 0), 0);
        return { status: 200, body: {
          source: 'Open-Meteo', date, timezone: 'Asia/Shanghai',
          precipitationTotalMm: Math.round(total * 100) / 100, hourly: samples,
        } };
      } catch {
        return { status: 502, body: { error: 'weather_provider_unavailable' } };
      }
    }
    return null;
  };
}

module.exports = { createAiApiHandler, parseDay, parseTerms };
