(()=>{'use strict';
const firebaseApp=window.firebase;
if(!firebaseApp||!window.FZH_FIREBASE_CONFIG)return;
// 会员始终使用默认 Firebase App；管理员使用独立的 ccg-mainz-admin 命名 App。
// 两端的 Auth 持久登录状态因此互不覆盖。
const memberApp=firebaseApp.apps.find(app=>app.name==='[DEFAULT]')||firebaseApp.initializeApp(window.FZH_FIREBASE_CONFIG);
const auth=memberApp.auth(),db=memberApp.firestore();
let memberUnsubscribe=null;
window.CCGMember={auth,db,user:null,profile:null,ready:new Promise(resolve=>{
 auth.onAuthStateChanged(u=>{
  if(memberUnsubscribe){memberUnsubscribe();memberUnsubscribe=null}
  if(!u){location.replace('./platform.html?login=1');return}
  memberUnsubscribe=db.collection('platformMembers').doc(u.uid).onSnapshot(snap=>{
   if(!snap.exists){location.replace('./platform.html?profile=1');return}
   const profile=snap.data();
   if(profile.status && profile.status!=='approved'){
    location.replace('./platform.html?approval=1');return
   }
   window.CCGMember.user=u;window.CCGMember.profile=profile;
   resolve(window.CCGMember);
  },e=>{
   document.body.textContent='会员审核状态无法验证，请返回幸福家人平台重试：'+e.message;
  });
 });
})};
})();