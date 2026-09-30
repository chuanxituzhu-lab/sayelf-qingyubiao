const DAY=86400000;
function monthKey(now){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit'}).format(now);}
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
  const a=credit(inviter,now),b=credit(u,now);
  db.events.push({at:now.toISOString(),inviter:inviter.code,invitee:u.code,inviterDays:a,inviteeDays:b});
  return {awarded:true,inviterDays:a,inviteeDays:b};
}
module.exports={monthKey,credit,complete};
