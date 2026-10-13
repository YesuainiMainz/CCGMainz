(()=>{'use strict';
const firebaseApp=window.firebase;
if(!firebaseApp||!window.FZH_FIREBASE_CONFIG)return;
if(!firebaseApp.apps.length)firebaseApp.initializeApp(window.FZH_FIREBASE_CONFIG);
const auth=firebaseApp.auth(),db=firebaseApp.firestore();
window.CCGMember={auth,db,user:null,profile:null,ready:new Promise(resolve=>{
 auth.onAuthStateChanged(async u=>{
  if(!u){location.replace('./platform.html?login=1');return;}
  try{const d=await db.collection('platformMembers').doc(u.uid).get();
   if(!d.exists){location.replace('./platform.html?profile=1');return;}
   window.CCGMember.user=u;window.CCGMember.profile=d.data();resolve(window.CCGMember);
  }catch(e){document.body.textContent='账号资料读取失败：'+e.message;}
 });
})};
})();