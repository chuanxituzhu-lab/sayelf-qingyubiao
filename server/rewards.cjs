const DAY=86400000;
const LIFETIME_REFERRALS=100;
const DIRECT_REWARD_DAYS=7;
const SECOND_LEVEL_REWARD_DAYS=3;
function monthKey(now){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit'}).format(now);}
function referralCount(db,code){return db.events.filter(e=>e.inviter===code).length;}
function applyLifetimeMilestones(db){let changed=false;for(const user of Object.values(db.users))if(referralCount(db,user.code)>=LIFETIME_REFERRALS&&!user.lifetimePro){user.lifetimePro=true;changed=true;}return changed;}
function credit(user,now,requestedDays=DIRECT_REWARD_DAYS){
  const month=monthKey(now), days=Math.min(requestedDays,Math.max(0,30-(user.months[month]||0)));
  user.months[month]=(user.months[month]||0)+days;
  if(days)user.proUntil=new Date(Math.max(now.getTime(),Date.parse(user.proUntil)||0)+days*DAY).toISOString();
  return days;
}
function complete(db,id,now=new Date()){
  const u=db.users[id];if(u.generated)return {awarded:false};
  u.generated=now.toISOString();
  const direct=Object.values(db.users).find(x=>x.code===u.ref);
  if(!direct||direct===u)return {awarded:false};
  const upstream=Object.values(db.users).find(x=>x.code===direct.ref);
  const previousCount=referralCount(db,direct.code);
  const alreadyPermanent=!!direct.lifetimePro||previousCount>=LIFETIME_REFERRALS;
  if(alreadyPermanent)direct.lifetimePro=true;
  const directDays=alreadyPermanent?0:credit(direct,now,DIRECT_REWARD_DAYS);
  const inviteeDays=credit(u,now,DIRECT_REWARD_DAYS),count=previousCount+1;
  const permanentGranted=!alreadyPermanent&&count>=LIFETIME_REFERRALS;
  if(permanentGranted)direct.lifetimePro=true;
  const parentEligible=upstream&&upstream!==u&&upstream!==direct&&upstream.code!==direct.code;
  const upstreamAlreadyPermanent=!!(upstream&&upstream.lifetimePro);
  const upstreamDays=parentEligible&&!upstreamAlreadyPermanent?credit(upstream,now,SECOND_LEVEL_REWARD_DAYS):0;
  db.events.push({at:now.toISOString(),inviter:direct.code,invitee:u.code,upstream:parentEligible?upstream.code:null,inviterDays:directDays,inviteeDays,upstreamDays,inviterReferrals:count,permanentGranted});
  return {awarded:true,inviterDays:directDays,inviteeDays,upstreamDays,inviterReferrals:count,inviterLifetimePro:!!direct.lifetimePro,permanentGranted};
}
module.exports={monthKey,credit,referralCount,applyLifetimeMilestones,complete,LIFETIME_REFERRALS,DIRECT_REWARD_DAYS,SECOND_LEVEL_REWARD_DAYS};
