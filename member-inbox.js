(()=>{'use strict';
const $=id=>document.getElementById(id);if(!window.firebase)return;
const auth=firebase.auth(),db=firebase.firestore();let off=[],loans=[],notices=[],requests=[],myNeeds=[];
function clear(){off.forEach(f=>f());off=[];loans=[];notices=[];requests=[];myNeeds=[];const root=$('memberInbox');if(root)root.replaceChildren()}
const when=x=>x?.toDate?.()?.toLocaleString('zh-CN')||'时间待同步';
const status=x=>({pending:'需求已发送',accepted:'历史记录：已接受',rejected:'历史记录：已拒绝'})[x]||'需求已发送';
function render(){
 const rows=[
 ...loans.map(x=>({kind:'图书借阅进度',title:x.bookName||'图书借阅',summary:({pending:'等待管理员审核',approved:'已借出未归还',returned:'已归还',rejected:'申请未获批准'})[x.status]||x.status||'处理中',details:[['书名',x.bookName],['处理状态',x.status==='approved'?'已借出未归还':x.status==='returned'?'已归还':x.status==='rejected'?'未获批准':'等待管理员审核'],['借阅申请时间',when(x.createdAt)]],time:x.createdAt})),
 ...myNeeds.map(x=>({postId:x.postId,kind:'我的爱心站需求',title:'已向发布者发送需求',summary:status(x.status),details:[['申请人',x.requester],['需求内容',x.details],['申请状态',status(x.status)],['发送时间',when(x.createdAt)]],time:x.createdAt})),
 ...requests.map(x=>({postId:x.postId,kind:'有人需要您的物品',title:(x.requester||'会员')+' 提交了需求',summary:'点击查看需求详情',details:[['申请人',x.requester],['需求内容',x.details],['状态','已通知发布者（无需线上批准或拒绝）'],['发送时间',when(x.createdAt)]],time:x.createdAt})),
 ...notices.filter(x=>!requests.some(r=>r.id===x.needId)).map(x=>({postId:x.postId,kind:'爱心站提醒',title:'您的物品收到需求',summary:'点击查看通知详情',details:[['需求内容',x.text],['通知时间',when(x.createdAt)]],time:x.createdAt}))
 ].sort((a,b)=>(b.time?.seconds||0)-(a.time?.seconds||0));
 const root=$('memberInbox');if(!root)return;root.replaceChildren();
 for(const x of rows){
  const card=document.createElement('details');card.className='ccg-message-row';
  const heading=document.createElement('summary');heading.className='ccg-message-summary';
  const left=document.createElement('span');left.className='ccg-message-heading';
  const strong=document.createElement('strong');strong.textContent=x.kind;
  const title=document.createElement('span');title.textContent=x.title;
  const sub=document.createElement('small');sub.textContent=x.summary+' · '+when(x.time);
  left.append(strong,title,sub);heading.append(left);
  const panel=document.createElement('div');panel.className='ccg-message-detail';
  for(const [label,value] of x.details){const line=document.createElement('p');const b=document.createElement('strong');b.textContent=label+'：';line.append(b,document.createTextNode(value||'—'));panel.append(line)}
  if(x.postId){
   const link=document.createElement('a');link.href='./posts.html?post='+encodeURIComponent(x.postId);
   link.className='ccg-message-post-link';link.textContent='查看对应的爱心站帖子 →';
   panel.append(link);
  }
  card.append(heading,panel);root.append(card);
  card.addEventListener('toggle',()=>requestAnimationFrame(()=>{const first=[...root.children].slice(0,2);root.style.maxHeight=first.length?Math.ceil(first.reduce((n,node)=>n+node.getBoundingClientRect().height,0)+2)+'px':'180px';}));
 }
 $('inboxStatus').textContent=rows.length?'共 '+rows.length+' 条消息；点击可展开详情，每屏最多2条':'暂无消息';
 requestAnimationFrame(()=>{const first=[...root.children].slice(0,2);root.style.maxHeight=first.length?Math.ceil(first.reduce((sum,node)=>sum+node.getBoundingClientRect().height,0)+2)+'px':'180px'});
}
let memberStatusUnsub=null;
auth.onAuthStateChanged(u=>{
 clear();
 if(memberStatusUnsub){memberStatusUnsub();memberStatusUnsub=null}
 if(!u){$('inboxStatus').textContent='请先登录';return}
 $('inboxStatus').textContent='正在检查会员审核状态…';
 memberStatusUnsub=db.collection('platformMembers').doc(u.uid).onSnapshot(snap=>{
  const profile=snap.exists?snap.data():null;
  if(!profile || (profile.status && profile.status!=='approved')){
   clear();$('inboxStatus').textContent='账号尚未通过审核，无法查看消息';return
  }
  if(off.length)return;
 off.push(db.collection('libraryRequests').where('uid','==',u.uid).onSnapshot(s=>{loans=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>{$('inboxStatus').textContent='借阅消息加载失败：'+e.message}));
 off.push(db.collection('careNeeds').where('uid','==',u.uid).onSnapshot(s=>{myNeeds=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>{$('inboxStatus').textContent='我的需求消息加载失败：'+e.message}));
 off.push(db.collection('careNeeds').where('ownerUid','==',u.uid).onSnapshot(s=>{requests=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>{$('inboxStatus').textContent='需求通知加载失败：'+e.message}));
 off.push(db.collection('memberNotifications').where('uid','==',u.uid).onSnapshot(s=>{notices=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>{$('inboxStatus').textContent='提醒加载失败：'+e.message}));
 },e=>{$('inboxStatus').textContent='审核状态读取失败：'+e.message});
});})();
