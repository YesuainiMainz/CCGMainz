(()=>{'use strict';const $=id=>document.getElementById(id);
if(!window.firebase)return;const auth=firebase.auth(),db=firebase.firestore();let off=[],loans=[],needs=[],requests=[],myNeeds=[];
function clear(){off.forEach(f=>f());off=[];loans=[];needs=[];requests=[];myNeeds=[];$('memberInbox').replaceChildren()}
function render(){
 const rows=[
  ...loans.map(x=>({kind:'图书借阅',title:x.bookName,status:({pending:'待审批',approved:'已借出未归还',returned:'已归还',rejected:'已拒绝'})[x.status]||x.status,time:x.createdAt})),
  ...needs.map(x=>({kind:'爱心站需求提醒',title:'有人需要您分享的物品',status:x.text,time:x.createdAt})),
  ...myNeeds.map(x=>({kind:'我的爱心站申请',title:'已向发布者发送需求',status:({pending:'等待发布者处理',accepted:'发布者已接受匹配',rejected:'发布者已拒绝申请'})[x.status]||'处理中',time:x.createdAt})),
  ...requests.map(x=>({kind:'爱心站匹配申请',title:x.requester+' 申请您的物品',status:(x.status==='accepted'?'已接受':x.status==='rejected'?'已拒绝':'待您处理')+' · '+x.details,time:x.createdAt,request:x}))
 ].sort((a,b)=>(b.time?.seconds||0)-(a.time?.seconds||0));
 const root=$('memberInbox');root.replaceChildren();
 for(const x of rows){
  const div=document.createElement('div');div.style.cssText='padding:12px 0;border-bottom:1px solid #e1e7e2';
  const title=document.createElement('strong');title.textContent=x.kind+' · '+x.title;
  const detail=document.createElement('div');detail.textContent=x.status||'';
  const time=document.createElement('small');time.textContent=x.time?.toDate?.()?.toLocaleString('zh-CN')||'';
  div.append(title,detail,time);
  if(x.request&&(!x.request.status||x.request.status==='pending')){
   for(const [status,label] of [['accepted','接受匹配'],['rejected','拒绝申请']]){
    const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.style.cssText='margin:7px 8px 0 0;background:#246746;color:white;border:0;border-radius:7px;padding:9px 12px;cursor:pointer';
    btn.onclick=()=>decide(x.request,status);div.append(btn);
   }
  }
  root.append(div);
 }
 $('inboxStatus').textContent=rows.length?'共 '+rows.length+' 条消息':'暂无消息';
}
async function decide(req,status){
 if(!confirm(status==='accepted'?'确认接受这条匹配申请吗？':'确认拒绝这条匹配申请吗？'))return;
 try{
  const uid=auth.currentUser?.uid;if(!uid)throw Error('请重新登录');
  await db.runTransaction(async tx=>{
   const ref=db.collection('careNeeds').doc(req.id),snap=await tx.get(ref);
   if(!snap.exists)throw Error('申请已不存在');
   const n=snap.data();
   if(n.ownerUid!==uid||n.status!=='pending')throw Error('申请已被处理或无权限');
   const postRef=db.collection('carePosts').doc(n.postId),post=await tx.get(postRef);
   if(!post.exists||post.data().uid!==uid)throw Error('帖子不存在或无权限');
   tx.update(ref,{status,decidedAt:firebase.firestore.FieldValue.serverTimestamp()});
   if(status==='accepted'){
    tx.set(db.collection('careMatches').doc(req.id),{postId:n.postId,needId:req.id,postText:String(post.data().text||'').slice(0,1500),author:post.data().author,requester:n.requester,details:n.details,ownerUid:uid,matchedAt:firebase.firestore.FieldValue.serverTimestamp()});
   }
  });
 }catch(e){alert('处理失败：'+e.message)}
}
auth.onAuthStateChanged(u=>{clear();if(!u){$('inboxStatus').textContent='请先登录';return;}
 off.push(db.collection('libraryRequests').where('uid','==',u.uid).onSnapshot(s=>{loans=s.docs.map(d=>d.data());render()},e=>{$('inboxStatus').textContent='借阅消息加载失败：'+e.message}));
 off.push(db.collection('careNeeds').where('uid','==',u.uid).onSnapshot(s=>{myNeeds=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>{$('inboxStatus').textContent='我的需求消息加载失败：'+e.message}));
 off.push(db.collection('careNeeds').where('ownerUid','==',u.uid).onSnapshot(s=>{requests=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>{$('inboxStatus').textContent='匹配请求加载失败：'+e.message}));
 off.push(db.collection('memberNotifications').where('uid','==',u.uid).onSnapshot(s=>{needs=s.docs.map(d=>d.data());render()},e=>{$('inboxStatus').textContent='爱心站消息加载失败：'+e.message}));
});})();