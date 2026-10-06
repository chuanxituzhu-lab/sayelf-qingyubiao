// Node.js 22+; no npm install required. Calendar library is bundled locally.
// Single process with an atomic local ledger.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {monthKey,referralCount,applyLifetimeMilestones,complete}=require('./rewards.cjs');
const {createAiApiHandler}=require('./plugins/ai-api.cjs');
const PORT=Number(process.env.PORT||8000),HOST=process.env.HOST||'127.0.0.1';
const home=new URL(process.env.PUBLIC_URL||`http://localhost:${PORT}/`);
if(!['http:','https:'].includes(home.protocol)||home.username||home.password)throw Error('PUBLIC_URL must be an HTTP(S) URL');
home.pathname='/';home.search='';home.hash='';
const dir=process.env.DATA_DIR||path.join(__dirname,'private-data'),file=path.join(dir,'ledger.json');
fs.mkdirSync(dir,{recursive:true});
let db=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{users:{},events:[]};
const eligible=new Map(),limits=new Map();
function save(){fs.writeFileSync(file+'.tmp',JSON.stringify(db),{mode:0o600});fs.renameSync(file+'.tmp',file);}
if(applyLifetimeMilestones(db))save();
function session(req,res){
  const raw=(req.headers.cookie||'').match(/(?:^|;\s*)qy_session=([a-f0-9]{64})(?:;|$)/),old=raw&&raw[1];
  if(old&&db.users[old])return old;
  const id=crypto.randomBytes(32).toString('hex');
  db.users[id]={code:crypto.randomBytes(12).toString('hex'),months:{},proUntil:new Date(0).toISOString(),generated:null,ref:null,lifetimePro:false};save();
  res.setHeader('Set-Cookie',`qy_session=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=315360000${home.protocol==='https:'?'; Secure':''}`);return id;
}
function state(id,extra={}){const u=db.users[id],month=monthKey(new Date()),successfulInvites=referralCount(db,u.code);return {code:u.code,home:home.href,proUntil:u.proUntil,month,monthDays:u.months[month]||0,successfulInvites,lifetimePro:!!u.lifetimePro||successfulInvites>=100,generated:!!u.generated,...extra};}
function json(res,status,o){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(o));}
async function body(req){let s='';for await(const c of req){s+=c;if(s.length>4096)throw Error('Request too large');}return JSON.parse(s||'{}');}
const handleAiApi=createAiApiHandler({apiToken:process.env.API_TOKEN,readJson:body});
function weatherURL(raw){
  const u=new URL(raw),archive=u.hostname==='archive-api.open-meteo.com';
  if(u.protocol!=='https:'||u.port||u.username||u.password||u.hash||!['api.open-meteo.com','archive-api.open-meteo.com'].includes(u.hostname)||u.pathname!==(archive?'/v1/archive':'/v1/forecast'))throw Error('Invalid weather URL');
  const allowed=['latitude','longitude','hourly','timezone','past_days','forecast_days','start_date','end_date'];
  if([...u.searchParams.keys()].some(k=>!allowed.includes(k))||u.searchParams.get('hourly')!=='precipitation,cloud_cover'||u.searchParams.get('timezone')!=='Asia/Shanghai')throw Error('Invalid weather parameters');
  const lat=Number(u.searchParams.get('latitude')),lon=Number(u.searchParams.get('longitude'));
  if(!u.searchParams.has('latitude')||!u.searchParams.has('longitude')||!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180)throw Error('Invalid coordinates');
  if(archive){const start=u.searchParams.get('start_date'),end=u.searchParams.get('end_date');if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||!(Date.parse(end)>=Date.parse(start))||Date.parse(end)-Date.parse(start)>366*86400000)throw Error('Invalid date range');}
  else if(u.searchParams.get('past_days')!=='7'||u.searchParams.get('forecast_days')!=='4')throw Error('Invalid forecast range');
  return u;
}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  try{
    const u=new URL(req.url,'http://local');
    const aiResult=await handleAiApi(req,u);
    if(aiResult)return json(res,aiResult.status,aiResult.body);
    if(u.pathname==='/api/state'&&req.method==='GET'){const id=session(req,res);return json(res,200,state(id));}
    if(u.pathname==='/api/weather'&&req.method==='GET'){
      const target=weatherURL(u.searchParams.get('url')),id=session(req,res);
      let bucket=limits.get(id);if(!bucket||bucket.until<Date.now())bucket={until:Date.now()+60000,count:0};
      if(++bucket.count>20)return json(res,429,{error:'请稍后重试天气同步'});limits.set(id,bucket);
      const r=await fetch(target,{signal:AbortSignal.timeout(30000),redirect:'error'});if(!r.ok)throw Error('Weather service unavailable');
      const data=await r.json();if(!data.hourly||!Array.isArray(data.hourly.time)||!data.hourly.time.length||!Array.isArray(data.hourly.precipitation)||!data.hourly.precipitation.some(Number.isFinite))throw Error('No weather records');
      eligible.set(id,Date.now()+300000);return json(res,200,data);
    }
    if(['/api/invite','/api/complete'].includes(u.pathname)&&req.method==='POST'){
      if(req.headers.origin!==home.origin)return json(res,403,{error:'Invalid origin'});
      const id=session(req,res),b=await body(req),user=db.users[id];
      if(u.pathname==='/api/invite'){
        const inviter=Object.values(db.users).find(x=>x.code===b.ref);
        if(!user.generated&&!user.ref&&inviter&&inviter!==user){user.ref=inviter.code;save();}
        return json(res,200,state(id));
      }
      if(user.generated)return json(res,200,state(id,{awarded:false}));
      if((eligible.get(id)||0)<Date.now())return json(res,409,{error:'请先成功同步天气并生成晴雨表，再领取奖励'});
      const result=complete(db,id);save();eligible.delete(id);return json(res,200,state(id,result));
    }
    if(req.method==='GET'&&(u.pathname==='/'||decodeURIComponent(u.pathname)==='/山野精灵.晴雨表.html')){
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});
      return res.end(fs.readFileSync(path.join(__dirname,'../templates/山野精灵.晴雨表.html')));
    }
    const payFiles={
      '/pay/山野精灵.晴雨表_订阅与授权.html':['山野精灵.晴雨表_订阅与授权.html','text/html; charset=utf-8'],
      '/pay/微信二维码.jpg':['微信二维码.jpg','image/jpeg'],
    };
    const publicPath=decodeURIComponent(u.pathname);
    if(req.method==='GET'&&payFiles[publicPath]){
      const [name,type]=payFiles[publicPath];
      res.writeHead(200,{'Content-Type':type,'Cache-Control':'public, max-age=3600'});
      return res.end(fs.readFileSync(path.join(__dirname,'../pay',name)));
    }
    json(res,404,{error:'Not found'});
  }catch(e){json(res,400,{error:'请求未完成：'+e.message});}
});
server.listen(PORT,HOST,()=>console.log(`晴雨表已启动：${home.href}（监听 ${HOST}:${PORT}）`));
