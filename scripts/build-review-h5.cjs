#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const destination = path.resolve(process.argv[2] || path.join(root, 'dist', 'sayelf-qingyubiao-review.html'));
const intermediate = path.join(root, 'dist', '.sayelf-qingyubiao-review-source.html');
const standaloneBuilder = path.join(root, 'scripts', 'build-standalone-h5.cjs');

function replaceOne(html, pattern, replacement, label) {
  const matches = html.match(pattern);
  if (!matches || matches.length !== 1) throw new Error(`${label}: expected one match, found ${matches ? matches.length : 0}`);
  return html.replace(pattern, replacement);
}

function replaceBetween(html, startMarker, endMarker, replacement, label) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0 || html.indexOf(startMarker, start + startMarker.length) >= 0) {
    throw new Error(`${label}: build markers are missing or ambiguous`);
  }
  return html.slice(0, start) + replacement + html.slice(end);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
execFileSync(process.execPath, [standaloneBuilder, intermediate], { cwd: root, stdio: 'inherit' });

try {
  let html = fs.readFileSync(intermediate, 'utf8');

  html = replaceOne(html, /^<link rel="icon"[^\n]*\r?\n/m, '', 'remove branded favicon');
  html = replaceOne(html, /\s*<img class="logo"[^>]*data:image\/jpeg;base64,[^">]*"[^>]*>\s*/, '\n', 'remove branded header image');
  html = replaceOne(html, /\.hd \.logo\{[^}]*\}/, '', 'remove branded header image style');
  html = replaceOne(html, /var LOGO_DATA='data:image\/jpeg;base64,[^']*';\r?\n/, '', 'remove embedded watermark image');
  html = replaceOne(html, /var LOGO_IMG=\(typeof Image!==\'undefined\'\)\?new Image\(\):null;\r?\nif\(LOGO_IMG\)LOGO_IMG\.src=LOGO_DATA;\r?\n/, '', 'remove watermark image loader');
  html = replaceBetween(
    html,
    '  /* 右上角圆形 logo（同源 data URI，不污染画布） */',
    '  ctx.fillStyle=INK;font(ctx,700,Math.round(30*sc));',
    '',
    'remove export watermark drawing'
  );

  html = replaceBetween(html, '// QR Code Generator for JavaScript', '</script>', '', 'remove QR generation library');
  html = replaceOne(html, /<span class="pill" id="licp"[^>]*><\/span>\s*/, '', 'remove subscription status control');
  html = replaceOne(html, /<details class="share-surprise" id="shareSurprise"[\s\S]*?<\/details>/, '', 'remove referral promotion panel');
  html = replaceBetween(html, '<div class="dlg" id="licDlg"', '\n<script>', '', 'remove purchase and contact dialog');

  html = html.replace('<title>山野精灵.晴雨表</title>', '<title>晴雨表</title>');
  html = html.replace("var APP_NAME='山野精灵.晴雨表';", "var APP_NAME='晴雨表';");
  html = html.replace("var APP_IP='山野精灵 · SAYELF';", "var APP_IP='';");
  html = html.replace('重庆 · 南岸区 · 山野精灵.晴雨表', '重庆 · 南岸区 · 晴雨表');
  html = html.replace('<span class="bname">山野精灵.晴雨表</span>', '<span class="bname">晴雨表</span>');
  html = html.replace('（订阅功能）">场景决策', '">场景决策');
  html = html.replace('场景决策（订阅功能）：', '场景决策：');
  html = replaceOne(html, /var PAY_ROOT='[^']*';/, "var PAY_ROOT='';", 'clear off-site purchase page');

  html = replaceOne(html, /<div class="share-guide"><b>分享玩法：<\/b>[\s\S]*?<\/div>/, '<div class="share-guide">分享图片仅包含当前晴雨表记录。</div>', 'remove promotional sharing copy');
  html = replaceOne(html, /<div class="ds">选择平台尺寸后点[\s\S]*?<\/div>/, '<div class="ds">选择图片尺寸，可保存图片或使用系统分享。</div>', 'remove QR sharing instructions');
  html = replaceOne(html, /<div class="shtip" id="inviteHint"><\/div><button onclick="copyInvite\(\)">[\s\S]*?<\/details><div class="shgrid"/, '<div class="shgrid"', 'remove referral links and online-entry controls');

  html = replaceBetween(
    html,
    'var SHARE=[',
    'function copyText(t){',
    `var SHARE=[
  {k:'portrait',n:'竖版',w:1080,h:1440,tip:'竖版晴雨表图片'},
  {k:'story',n:'长图',w:1080,h:1920,tip:'长版晴雨表图片'},
  {k:'landscape',n:'横版',w:1440,h:1080,tip:'横版晴雨表图片'}
];
var shKey='portrait';
function shareText(){
  var st=statData();
  return year+'年 '+placeTitle()+'：累计降水 '+st.tot+' mm，雨日 '+st.wet+' 天，最大单日 '+st.max+' mm，已记录 '+st.n+' 天。';
}
function openSh(){
  var g=document.getElementById('shGrid'),h='';
  SHARE.forEach(function(o){h+='<button class="shb'+(o.k===shKey?' on':'')+'" data-k="'+o.k+'" onclick="shareTo(\\''+o.k+'\\')"><b>'+o.n+'</b><em>'+o.w+'×'+o.h+'</em></button>';});
  g.innerHTML=h;
  document.getElementById('shTxt').value=shareText();
  document.getElementById('shDlg').className='dlg on';
  shPrev();
}
function closeSh(){document.getElementById('shDlg').className='dlg';}
function shCfg(k){for(var i=0;i<SHARE.length;i++)if(SHARE[i].k===k)return SHARE[i];return SHARE[0];}
function shPrev(){
  var c=shCfg(shKey),pv=document.getElementById('shPrev');
  var pw=Math.min(260,Math.round(260*c.w/c.h)),ph=Math.round(pw*c.h/c.w);
  if(ph>340){ph=340;pw=Math.round(ph*c.w/c.h);}
  pv.width=pw;pv.height=ph;
  var sheet=makeShareSheet(curTab===3?0:curTab,Math.round(c.w*.3),Math.round(c.h*.3));
  var cx=pv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,pw,ph);cx.imageSmoothingQuality='high';cx.drawImage(sheet,0,0,pw,ph);
  document.getElementById('shTip').textContent=shCfg(shKey).tip;
}
function shareTo(k){
  shKey=k;var cfg=shCfg(k),btns=document.querySelectorAll('#shGrid .shb');
  for(var i=0;i<btns.length;i++)btns[i].className='shb'+(btns[i].dataset.k===k?' on':'');
  shPrev();var nm=fileName()+'_'+cfg.n+'_'+ymd(new Date())+'.png',c=makeShareSheet(curTab===3?0:curTab,cfg.w,cfg.h);
  c.toBlob(function(b){
    if(!b){alert('图片生成失败');return;}
    var txt=shareText(),f=null;try{f=new File([b],nm,{type:'image/png'});}catch(e){}
    if(f&&navigator.canShare&&navigator.canShare({files:[f]})){
      navigator.share({files:[f],title:APP_NAME+' · '+placeTitle(),text:txt}).then(function(){toast('晴雨表已分享。');},function(e){if(e&&e.name!=='AbortError'){dl(b,nm);copyText(txt);toast('图片已保存，记录文字已复制。');}});
    }else{dl(b,nm);copyText(txt);toast('图片已保存，记录文字已复制。');}
  },'image/png');
}
function dlShare(){var cfg=shCfg(shKey),nm=fileName()+'_'+cfg.n+'_'+ymd(new Date())+'.png';makeShareSheet(curTab===3?0:curTab,cfg.w,cfg.h).toBlob(function(b){if(b)dl(b,nm);},'image/png');toast('晴雨表图片已保存。');}
function sysShare(){
  var cfg=shCfg(shKey),nm=fileName()+'_'+cfg.n+'_'+ymd(new Date())+'.png';
  makeShareSheet(curTab===3?0:curTab,cfg.w,cfg.h).toBlob(function(b){
    if(!b)return;var f=null;try{f=new File([b],nm,{type:'image/png'});}catch(e){}
    if(f&&navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:APP_NAME+' · '+placeTitle(),text:shareText()}).catch(function(){});
    else if(navigator.share)navigator.share({title:APP_NAME+' · '+placeTitle(),text:shareText()}).catch(function(){});
    else{dl(b,nm);copyText(shareText());toast('图片已保存，记录文字已复制。');}
  },'image/png');
}
function copyShare(){copyText(document.getElementById('shTxt').value||shareText());}
function copyInvite(){}
`,
    'replace share and referral workflow'
  );

  html = replaceBetween(
    html,
    '/* 订阅入口：',
    '/* ============ 详情与官方校订 ============ */',
    `var LIC=null;
function licLoad(){}
function licensed(){return true;}
function unlocked(){return true;}
function openSub(){}
function closeSub(){}
function gate(){return true;}
function licPill(){}

`,
    'remove subscription and contact logic'
  );

  html = replaceBetween(
    html,
    'var GROWTH={',
    'var calendarCache={};',
    'var GROWTH={state:null,ready:false};\n',
    'remove referral configuration'
  );
  html = replaceBetween(
    html,
    'function growthAPI(path,body){',
    'load();licLoad();initUI();rLegend();clock();setInterval(clock,1000);',
    `function growthInit(){return Promise.resolve();}
function growthCompleted(){}
function applySameStyle(){}
function makeShareSheet(mode,W,H){var c=document.createElement('canvas');c.width=W;c.height=H;drawSheet(c.getContext('2d'),W,H,{mode:mode});return c;}

`,
    'remove referral network requests and QR image rendering'
  );

  const blocked = [
    [/chat_tea/i, 'contact identifier'],
    [/二维码|扫码|复制做同款|分享有惊喜/i, 'QR or referral text'],
    [/SAYELF|山野精灵 ·/i, 'external brand watermark'],
    [/afdian\.com|chuanxituzhu-lab\.github\.io|github\.com/i, 'off-site promotion link'],
    [/wxId|wxAdd|shareHome|inviteHint|shareSurprise|qrcode/i, 'contact, invite or QR implementation']
  ];
  for (const [pattern, label] of blocked) {
    const hit = html.match(pattern);
    if (hit) {
      const at = html.indexOf(hit[0]);
      throw new Error(`Review build still contains ${label}: ${html.slice(Math.max(0, at - 80), at + 120).replace(/\s+/g, ' ')}`);
    }
  }
  if (/href\s*=\s*["']https?:\/\//i.test(html)) throw new Error('Review build still contains an external navigation link');
  if (!html.includes('二十四节气') || !html.includes('农历日期') || !html.includes('function makeShareSheet')) {
    throw new Error('Review build lost required calendar or sharing behavior');
  }

  fs.writeFileSync(destination, html, 'utf8');
  process.stdout.write(`Built review H5 ${destination} (${Buffer.byteLength(html)} bytes)\n`);
} finally {
  if (fs.existsSync(intermediate)) fs.unlinkSync(intermediate);
}
