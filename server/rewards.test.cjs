const {test}=require('node:test'),assert=require('node:assert/strict');
const {complete,monthKey}=require('./rewards.cjs');
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
