/* CCGMainz 公告：平台登录页公开，图书馆及爱心站仅限已审核会员 */
(function(){
 'use strict';
 const target=document.currentScript?.dataset?.target;
 if(!['platform','library','posts'].includes(target))return;
 const modal=document.createElement('div');
 modal.id='ccgAnnouncementModal';
 modal.hidden=true;
 modal.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.65);display:none;align-items:center;justify-content:center;padding:15px';
 modal.innerHTML='<section role="dialog" aria-modal="true" aria-labelledby="ccgAnnouncementHeading" style="background:#fff;color:#193c2d;width:min(100%,600px);max-height:90vh;overflow:auto;border-radius:16px;padding:24px;box-shadow:0 8px 35px #0004"><h2 id="ccgAnnouncementHeading" style="margin-top:0"></h2><p id="ccgAnnouncementText" style="white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7"></p><img id="ccgAnnouncementImage" alt="公告配图" hidden style="width:100%;max-height:55vh;object-fit:contain;border-radius:8px"><p style="text-align:right"><button id="ccgAnnouncementClose" type="button" style="background:#246746;color:white;border:0;border-radius:8px;padding:12px 24px;cursor:pointer">我已阅读</button></p></section>';
 document.body.append(modal);
 const close=()=>{modal.style.display='none';modal.hidden=true};
 modal.querySelector('#ccgAnnouncementClose').onclick=close;
 const shownVersions=new Set();
 let off=null,profileOff=null,authOff=null;
 function approved(profile){return !!profile&&(!profile.status||profile.status==='approved')}
 function start(db){
  if(off)return;
  off=db.collection('siteAnnouncements').doc(target).onSnapshot(snap=>{
   if(!snap.exists){close();return}
   const data=snap.data();
   if(data.active!==true){close();return}
   const version=(data.updatedAt?.seconds||0)+':'+(data.updatedAt?.nanoseconds||0);
   if(shownVersions.has(version))return;
   shownVersions.add(version);
   modal.querySelector('#ccgAnnouncementHeading').textContent=data.title||'CCGMainz 公告';
   modal.querySelector('#ccgAnnouncementText').textContent=data.body||'';
   const image=modal.querySelector('#ccgAnnouncementImage');
   if(typeof data.image==='string'&&/^data:image\/jpeg;base64,/.test(data.image)){
    image.src=data.image;image.hidden=false;
   }else{image.hidden=true;image.removeAttribute('src')}
   modal.hidden=false;modal.style.display='flex';
  },e=>console.warn('公告读取失败',e));
 }
 function stop(){
  if(off){off();off=null}
  close();
 }
 function setup(){
  if(!window.firebase||!window.FZH_FIREBASE_CONFIG)return;
  const app=firebase.apps.find(a=>a.name==='[DEFAULT]')||firebase.initializeApp(window.FZH_FIREBASE_CONFIG);
  const auth=app.auth(),db=app.firestore();
  authOff=auth.onAuthStateChanged(user=>{
   if(profileOff){profileOff();profileOff=null}
   stop();
   if(target==='platform'){start(db);return}
   if(!user)return;
   profileOff=db.collection('platformMembers').doc(user.uid).onSnapshot(snap=>{
    if(approved(snap.exists?snap.data():null))start(db);
    else stop();
   },e=>{stop();console.warn('公告会员审核失败',e)});
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
 else setup();
})();
