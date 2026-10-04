'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const htmlPath = path.join(__dirname, '..', 'dist', 'sayelf-qingyubiao-review.html');
const html = fs.readFileSync(htmlPath, 'utf8');

test('review H5 omits promotion, contact, QR codes, and external navigation', () => {
  for (const pattern of [
    /chat_tea/i,
    /二维码|扫码|分享有惊喜|复制做同款/i,
    /SAYELF|山野精灵 ·/i,
    /afdian\.com|chuanxituzhu-lab\.github\.io|github\.com/i,
    /wxId|wxAdd|shareHome|inviteHint|shareSurprise|qrcode/i,
    /<a\b[^>]*href\s*=\s*["']https?:\/\//i
  ]) assert.doesNotMatch(html, pattern);
});

test('calendar, weather entry points, and unblocked export remain available', () => {
  assert.match(html, /二十四节气/);
  assert.match(html, /农历日期/);
  assert.match(html, /function gate\(\)\{return true;\}/);
  assert.match(html, /function makeShareSheet\(mode,W,H\).*?drawSheet\(c\.getContext\('2d'\),W,H/);
  assert.match(html, /立即同步/);
  assert.match(html, /导出 PNG/);
  assert.match(html, /导出 PDF/);
});

test('all embedded scripts parse after review transformations', () => {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(scripts.length, 2);
  scripts.forEach((match, index) => new vm.Script(match[1], { filename: `inline-${index + 1}.js` }));
});
