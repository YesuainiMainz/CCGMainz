(()=>{'use strict';
const firebaseApp=window.firebase;
if(!firebaseApp||!window.FZH_FIREBASE_CONFIG)return;
// 会员始终使用默认 Firebase App；管理员使用独立的 ccg-mainz-admin 命名 App。
// 两端的 Auth 持久登录状态因此互不覆盖。
const memberApp=firebaseApp.apps.find(app=>app.name==='[DEFAULT]')||firebaseApp.initializeApp(window.FZH_FIREBASE_CONFIG);
const auth=memberApp.auth(),db=memberApp.firestore();
window.CCGMember={auth,db,user:null,profile:null,ready:new Promise(resolve=>{
 auth.onAuthStateChanged(async u=>{
  if(!u){location.replace('./platform.html?login=1');return;}
  try{const d=await db.collection('platformMembers').doc(u.uid).get();
   if(!d.exists){location.replace('./platform.html?profile=1');return;}
   if(d.data().status && d.data().status!=='approved'){location.replace('./platform.html?approval=1');return;}
   window.CCGMember.user=u;window.CCGMember.profile=d.data();resolve(window.CCGMember);
  }catch(e){document.body.textContent='账号资料读取失败：'+e.message;}
 });
})};
})();