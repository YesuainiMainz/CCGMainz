(()=>{'use strict';const $=id=>document.getElementById(id);let busy=false;
try{if(!firebase.apps.length)firebase.initializeApp(window.FZH_FIREBASE_CONFIG);
const auth=firebase.auth(),db=firebase.firestore();auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
function lock(on){busy=on;for(const id of ['register','login'])$(id).disabled=on;}
function error(e){$('memberStatus').textContent=e.message||String(e)}
auth.onAuthStateChanged(async user=>{
 $('logout').hidden=!user;$('login').hidden=!!user;$('register').hidden=!!user;$('completeProfile').hidden=true;
 if(!user){$('memberServices').hidden=true;$('memberStatus').textContent='请注册或登录';return;}
 try{const doc=await db.collection('platformMembers').doc(user.uid).get();
 if(!doc.exists){$('memberServices').hidden=true;$('completeProfile').hidden=false;$('memberStatus').textContent='账号尚未完成实名登记，请填写真实姓名并点击「补充实名资料」。';return;}
 $('memberServices').hidden=false;$('memberStatus').textContent='已登录：'+doc.data().name+'（'+user.email+'）';
 }catch(e){$('memberServices').hidden=true;error(e)}
});
$('memberForm').onsubmit=async e=>{e.preventDefault();if(busy)return;lock(true);
 try{await auth.signInWithEmailAndPassword($('memberEmail').value.trim(),$('memberPassword').value);$('memberPassword').value=''}catch(e){error(e)}finally{lock(false)}
};
$('register').onclick=async()=>{if(busy)return;const name=$('realName').value.trim();
 if(!name||name.length>40){$('memberStatus').textContent='请填写真实姓名（最多40字）';return;}
 if(!$('memberEmail').validity.valid||$('memberPassword').value.length<6){$('memberStatus').textContent='请输入有效邮箱及至少6位密码';return;}
 if(!confirm('确定以「'+name+'」实名注册吗？爱心站发布的帖子会显示此姓名。'))return;
 lock(true);try{const result=await auth.createUserWithEmailAndPassword($('memberEmail').value.trim(),$('memberPassword').value);
 await db.collection('platformMembers').doc(result.user.uid).set({name,email:result.user.email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
 $('memberPassword').value='';$('memberStatus').textContent='注册成功，正在加载会员资料…';
 // Auth event may run before profile write; refresh the profile state by reloading.
 location.reload();
 }catch(e){error(e)}finally{lock(false)}
};
$('completeProfile').onclick=async()=>{
 const u=auth.currentUser,name=$('realName').value.trim();if(!u)return;
 if(!name||name.length>40){$('memberStatus').textContent='请填写1至40字的真实姓名';return;}
 if(!confirm('确定使用「'+name+'」作为公开发帖的实名吗？'))return;
 try{await db.collection('platformMembers').doc(u.uid).set({name,email:u.email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});location.reload()}
 catch(e){error(e)}
};
$('logout').onclick=async()=>{if(confirm('确定退出登录吗？'))await auth.signOut()};
}catch(e){$('memberStatus').textContent='登录组件加载失败：'+e.message}
})();