const DAY=86400000;
const LIFETIME_REFERRALS=100;
function monthKey(now){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit'}).format(now);}
function referralCount(db,code){return db.events.filter(e=>e.inviter===code).length;}
function applyLifetimeMilestones(db){let changed=false;for(const user of Object.values(db.users))if(referralCount(db,user.code)>=LIFETIME_REFERRALS&&!user.lifetimePro){user.lifetimePro=true;changed=true;}return changed;}
function credit(user,now){
  const month=monthKey(now), days=Math.min(7,Math.max(0,30-(user.months[month]||0)));
  user.months[month]=(user.months[month]||0)+days;
  if(days)user.proUntil=new Date(Math.max(now.getTime(),Date.parse(user.proUntil)||0)+days*DAY).toISOString();
  return days;
}
function complete(db,id,now=new Date()){
  const u=db.users[id];if(u.generated)return {awarded:false};
  u.generated=now.toISOString();
  const inviter=Object.values(db.users).find(x=>x.code===u.ref);
  if(!inviter||inviter===u)return {awarded:false};
  const previousCount=referralCount(db,inviter.code);
  const alreadyPermanent=!!inviter.lifetimePro||previousCount>=LIFETIME_REFERRALS;
  if(alreadyPermanent)inviter.lifetimePro=true;
  const a=alreadyPermanent?0:credit(inviter,now),b=credit(u,now),count=previousCount+1;
  const permanentGranted=!alreadyPermanent&&count>=LIFETIME_REFERRALS;
  if(permanentGranted)inviter.lifetimePro=true;
  db.events.push({at:now.toISOString(),inviter:inviter.code,invitee:u.code,inviterDays:a,inviteeDays:b,inviterReferrals:count,permanentGranted});
  return {awarded:true,inviterDays:a,inviteeDays:b,inviterReferrals:count,inviterLifetimePro:!!inviter.lifetimePro,permanentGranted};
}
module.exports={monthKey,credit,referralCount,applyLifetimeMilestones,complete,LIFETIME_REFERRALS};
