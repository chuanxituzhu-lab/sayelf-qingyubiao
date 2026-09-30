#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'templates', '山野精灵.晴雨表.html');
const destination = path.resolve(process.argv[2] || path.join(root, 'dist', 'sayelf-qingyubiao-h5.html'));
const publicRoot = 'https://chuanxituzhu-lab.github.io/sayelf-qingyubiao/';

let html = fs.readFileSync(source, 'utf8');
const replacements = [
  ["var PAY_ROOT=location.pathname.indexOf('/templates/')>=0?'../':'./';", `var PAY_ROOT='${publicRoot}';`],
  ["var SHARE_HOME=''; // Offline distribution: set to your deployed HTTPS home URL.", `var SHARE_HOME='${publicRoot}'; // Standalone H5: use the published HTTPS entry for share links.`],
];

for (const [before, after] of replacements) {
  const first = html.indexOf(before);
  if (first < 0 || html.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected exactly one build marker, found 0 or multiple: ${before.slice(0, 80)}`);
  }
  html = html.slice(0, first) + after + html.slice(first + before.length);
}

if (!html.includes('data:image/jpeg;base64,') || !html.includes('function makeShareSheet(') || !html.includes('class="share-guide"')) {
  throw new Error('The source is missing embedded branding, the built-in share renderer or its sharing guide.');
}
if (html.includes("var PAY_ROOT=location.pathname") || html.includes("var SHARE_HOME='';")) {
  throw new Error('A local-only URL remained in the standalone build.');
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, html, 'utf8');
process.stdout.write(`Built ${destination} (${Buffer.byteLength(html)} bytes)\n`);
