const {test}=require('node:test'),assert=require('node:assert/strict');
const {complete,monthKey,referralCount,applyLifetimeMilestones,LIFETIME_REFERRALS,DIRECT_REWARD_DAYS,SECOND_LEVEL_REWARD_DAYS}=require('./rewards.cjs');
function user(code){return {code,months:{},proUntil:new Date(0).toISOString(),generated:null,ref:null};}
test('both parties, retries, cap, month rollover, self and invalid invite',()=>{
  const now=new Date('2026-09-30T10:00:00Z'),db={users:{a:user('a')},events:[]};
  for(let i=0;i<6;i++){let id='b'+i;db.users[id]=user(id);db.users[id].ref='a';const r=complete(db,id,now);assert.equal(r.inviteeDays,7);assert.equal(r.inviterDays,[7,7,7,7,2,0][i]);assert.equal(complete(db,id,now).awarded,false);}
  assert.equal(db.users.a.months[monthKey(now)],30);assert.equal(db.events.length,6);
  db.users.c=user('c');db.users.c.ref='a';assert.equal(complete(db,'c',new Date('2026-10-01T00:00:00Z')).inviterDays,7);
  db.users.self=user('self');db.users.self.ref='self';assert.equal(complete(db,'self',now).awarded,false);
  db.users.bad=user('bad');db.users.bad.ref='unknown';assert.equal(complete(db,'bad',now).awarded,false);
  assert.equal(monthKey(new Date('2026-09-30T16:00:00Z')),monthKey(new Date('2026-10-01T00:00:00Z')));
});
test('valid first generation credits Pro immediately from the event time',()=>{
  const now=new Date('2026-10-01T03:04:05Z'),db={users:{a:user('a'),b:user('b')},events:[]};
  db.users.b.ref='a';
  const result=complete(db,'b',now),expected=new Date(now.getTime()+7*86400000).toISOString();
  assert.deepEqual(result,{awarded:true,inviterDays:7,inviteeDays:7,upstreamDays:0,inviterReferrals:1,inviterLifetimePro:false,permanentGranted:false});
  assert.equal(db.users.a.proUntil,expected);
  assert.equal(db.users.b.proUntil,expected);
  assert.equal(db.events[0].at,now.toISOString());
});
test('direct referrals pay 7 days to both sides and the direct inviter parent gets 3 days only',()=>{
  const now=new Date('2026-10-02T03:04:05Z'),db={users:{root:user('root'),direct:user('direct'),newcomer:user('newcomer'),third:user('third')},events:[]};
  db.users.direct.ref='root';
  db.users.newcomer.ref='direct';
  let result=complete(db,'newcomer',now);
  assert.equal(result.inviterDays,DIRECT_REWARD_DAYS);
  assert.equal(result.inviteeDays,DIRECT_REWARD_DAYS);
  assert.equal(result.upstreamDays,SECOND_LEVEL_REWARD_DAYS);
  assert.equal(db.users.direct.months[monthKey(now)],7);
  assert.equal(db.users.newcomer.months[monthKey(now)],7);
  assert.equal(db.users.root.months[monthKey(now)],3);

  db.users.third.ref='newcomer';
  result=complete(db,'third',now);
  assert.equal(result.inviterDays,7);
  assert.equal(result.inviteeDays,7);
  assert.equal(result.upstreamDays,3);
  assert.equal(db.users.direct.months[monthKey(now)],10,'the intermediate inviter gets its own second-level reward');
  assert.equal(db.users.root.months[monthKey(now)],3,'rewards stop after two referral edges');
  assert.equal(db.users.newcomer.months[monthKey(now)],14,'a user keeps the 7-day invitee grant and earns 7 more for a direct invite');
});
test('second-level reward observes the same monthly 30-day cap',()=>{
  const now=new Date('2026-10-02T03:04:05Z'),db={users:{root:user('root'),direct:user('direct')},events:[]};
  db.users.direct.ref='root';
  db.users.root.months[monthKey(now)]=29;
  const child=user('child');child.ref='direct';db.users.child=child;
  const result=complete(db,'child',now);
  assert.equal(result.upstreamDays,1);
  assert.equal(db.users.root.months[monthKey(now)],30);
});
test('100 valid first generations automatically grant permanent Pro once',()=>{
  const firstMonth=new Date('2026-09-30T10:00:00Z'),nextMonth=new Date('2026-10-01T00:00:00Z');
  const db={users:{a:user('a')},events:[]};
  for(let i=1;i<LIFETIME_REFERRALS;i++){
    const id='invitee'+i;db.users[id]=user(id);db.users[id].ref='a';
    const result=complete(db,id,firstMonth);
    assert.equal(result.inviterReferrals,i);assert.equal(result.permanentGranted,false);
    assert.equal(!!db.users.a.lifetimePro,false);
  }
  assert.equal(referralCount(db,'a'),99);
  const hundredth=user('invitee100');db.users.hundredth=hundredth;hundredth.ref='a';
  const milestone=complete(db,'hundredth',firstMonth);
  assert.equal(milestone.inviterReferrals,100);
  assert.equal(milestone.permanentGranted,true);
  assert.equal(db.users.a.lifetimePro,true);
  assert.equal(milestone.inviterDays,0);
  assert.equal(milestone.inviteeDays,7);

  const later=user('invitee101');db.users.later=later;later.ref='a';
  const after=complete(db,'later',nextMonth);
  assert.equal(after.inviterReferrals,101);
  assert.equal(after.inviterDays,0);
  assert.equal(after.inviteeDays,7);
  assert.equal(referralCount(db,'a'),101);
  assert.equal(complete(db,'later',nextMonth).awarded,false);
  assert.equal(referralCount(db,'a'),101);
});
test('existing ledgers at the milestone are upgraded on service startup without changing smaller accounts',()=>{
  const db={users:{a:user('a'),b:user('b')},events:[]};
  for(let i=1;i<=LIFETIME_REFERRALS;i++)db.events.push({inviter:'a',invitee:'old'+i});
  assert.equal(applyLifetimeMilestones(db),true);
  assert.equal(db.users.a.lifetimePro,true);
  assert.equal(db.users.b.lifetimePro,undefined);
  assert.equal(applyLifetimeMilestones(db),false);
});
