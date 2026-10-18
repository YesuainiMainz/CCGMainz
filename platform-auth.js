(()=>{'use strict';
const $=id=>document.getElementById(id);
const cfg=window.FZH_FIREBASE_CONFIG;
let resolveReady,rejectReady;
const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject});
window.CCGMember={user:null,profile:null,ready};
const status=$('memberStatus');
function message(v){status.textContent=v}
function memberStatusText(profile){return profile?.status==='disabled'?'该账号已被管理员停用。如需恢复，请联系管理员。':profile?.status==='rejected'?'该账号未获批准，请联系管理员。':'账号正在等待管理员审核，审核通过后可使用图书馆和爱心站'}
function isApproved(profile){return !!profile && (!profile.status || profile.status==='approved')}
function panel(name){for(const id of ['loginPanel','registerPanel','recoveryPanel','loggedInPanel'])$(id).hidden=id!==name}
function errorText(e){const codes={'auth/email-already-in-use':'该邮箱已注册，请直接登录','auth/invalid-credential':'账号或密码错误','auth/weak-password':'密码强度不足','auth/invalid-email':'邮箱格式不正确','auth/too-many-requests':'请求过于频繁，请稍后再试'};return codes[e.code]||e.message||String(e)}
function lockInputs(locked){$('memberEmail').disabled=locked;$('memberPassword').disabled=locked}
async function profileFor(u){const ref=db.collection('platformMembers').doc(u.uid),snap=await ref.get();return snap.exists?snap.data():null}
let auth,db;
try{
 if(!window.firebase||!cfg)throw Error('Firebase 配置尚未加载');
 if(!firebase.apps.length)firebase.initializeApp(cfg);
 auth=firebase.auth();db=firebase.firestore();
 if(typeof db.enablePersistence==='function')db.enablePersistence({synchronizeTabs:true}).catch(e=>{if(e.code!=='failed-precondition'&&e.code!=='unimplemented')console.warn('Firestore 缓存不可用',e)});
 auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
}catch(e){message('登录服务无法启动：'+e.message);rejectReady(e);return}
function loggedOut(){$('passwordChangeForm').hidden=true;$('passwordChangeForm').reset();window.CCGMember.user=null;window.CCGMember.profile=null;lockInputs(false);$('memberPassword').value='';$('memberServices').hidden=true;panel('loginPanel');message('请使用账号和密码登录')}
let profileWatchUnsub=null;
auth.onAuthStateChanged(async u=>{
 if(profileWatchUnsub){profileWatchUnsub();profileWatchUnsub=null}
 if(!u){loggedOut();return}
 try{
  let profile=await profileFor(u);
  window.CCGMember.user=u;window.CCGMember.profile=profile;
  $('memberEmail').value=u.email||'';$('memberPassword').value='';lockInputs(true);
  $('loggedInIdentity').textContent='当前账号：'+(u.email||'')+(profile?' · '+profile.name:'');
  panel('loggedInPanel');$('passwordChangeForm').hidden=true;$('passwordChangeForm').reset();$('memberServices').hidden=!isApproved(profile);
  $('completeProfile').hidden=!!profile;
  $('profilePanel').hidden=true;
  message(profile?(isApproved(profile)?'登录成功':memberStatusText(profile)):'当前没有会员申请记录。请点击完善实名资料，重新提交审核申请。');
  if(isApproved(profile))resolveReady({user:u,profile});
  profileWatchUnsub=db.collection('platformMembers').doc(u.uid).onSnapshot(snap=>{
   const latest=snap.exists?snap.data():null;window.CCGMember.profile=latest;
   $('memberServices').hidden=!isApproved(latest);
   $('loggedInIdentity').textContent='当前账号：'+(u.email||'')+(latest?' · '+latest.name:'');
   $('completeProfile').hidden=!!latest;
   if(isApproved(latest)){message('管理员已批准，会员功能现已开放');resolveReady({user:u,profile:latest});}
   else if(latest)message(memberStatusText(latest));
   else message('当前没有会员申请记录。请补充实名资料，重新提交审核申请。');
  },e=>console.warn('会员状态实时更新失败',e));
 }catch(e){message('加载实名资料失败：'+errorText(e))}
});
$('memberForm').addEventListener('submit',async e=>{e.preventDefault();const email=$('memberEmail').value.trim(),pass=$('memberPassword').value;message('正在登录…');try{await auth.signInWithEmailAndPassword(email,pass)}catch(err){message('登录失败：'+errorText(err))}});
$('register').onclick=()=>{panel('registerPanel');message('请填写注册资料')};
$('backLogin').onclick=()=>{panel('loginPanel');message('请登录')};
$('registerForm').addEventListener('submit',async e=>{e.preventDefault();const name=$('realName').value.trim(),email=$('registerEmail').value.trim(),pass=$('registerPassword').value;if(!name||name.length>40)return message('姓名应为1至40字');message('正在注册…');try{
 const result=await auth.createUserWithEmailAndPassword(email,pass);
 await db.collection('platformMembers').doc(result.user.uid).set({name,email:result.user.email,createdAt:firebase.firestore.FieldValue.serverTimestamp(),status:'pending'});
 const profile=await profileFor(result.user);window.CCGMember.user=result.user;window.CCGMember.profile=profile;
 $('loggedInIdentity').textContent='当前账号：'+result.user.email+' · '+name;$('memberEmail').value=result.user.email;$('memberPassword').value='';lockInputs(true);panel('loggedInPanel');$('memberServices').hidden=true;$('completeProfile').hidden=true;message('注册申请已提交，等待管理员批准；批准前不能访问图书馆、爱心站和我的消息。');
 }catch(err){message('注册失败：'+errorText(err))}});
$('completeProfile').onclick=()=>{$('profilePanel').hidden=false};
$('saveProfile').onclick=async()=>{const u=auth.currentUser,name=$('profileName').value.trim();if(!u||!name||name.length>40)return message('请输入1至40字的真实姓名');try{await db.collection('platformMembers').doc(u.uid).set({name,email:u.email,createdAt:firebase.firestore.FieldValue.serverTimestamp(),status:'pending'});const profile=await profileFor(u);window.CCGMember.profile=profile;$('memberServices').hidden=true;$('completeProfile').hidden=true;$('profilePanel').hidden=true;$('loggedInIdentity').textContent='当前账号：'+u.email+' · '+name;message('实名资料已保存，等待管理员审核')}catch(err){message('保存失败：'+errorText(err))}};
$('logout').onclick=async()=>{if(!confirm('确定退出登录吗？'))return;try{await auth.signOut()}catch(e){message('退出失败：'+errorText(e))}};
$('forgotAccount').onclick=()=>{panel('recoveryPanel');$('passwordResetEmail').value=$('memberEmail').value.trim();$('passwordResetStatus').textContent='';$('recoveryStatus').textContent='';message('请输入注册邮箱以重置密码')};
$('backRecovery').onclick=()=>{panel('loginPanel');message('请登录')};
$('passwordResetForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const email=$('passwordResetEmail').value.trim();
 if(!email)return;
 const btn=$('sendPasswordReset');btn.disabled=true;
 $('passwordResetStatus').textContent='正在发送重置邮件…';
 try{
  await auth.sendPasswordResetEmail(email);
  $('passwordResetStatus').textContent='如果该邮箱已注册且可以接收邮件，您将收到密码重置链接。请检查收件箱及垃圾邮件文件夹。';
 }catch(err){
  if(['auth/user-not-found','auth/invalid-email'].includes(err.code)){
   $('passwordResetStatus').textContent='如果该邮箱已注册且可以接收邮件，您将收到密码重置链接。请检查收件箱及垃圾邮件文件夹。';
  }else{
   $('passwordResetStatus').textContent='邮件发送失败：'+errorText(err);
  }
 }finally{btn.disabled=false}
});

$('recoveryForm').addEventListener('submit',async e=>{
 e.preventDefault();const name=$('recoveryName').value.trim();if(!name||name.length>40){$('recoveryStatus').textContent='请输入1至40字的姓名';return}
 const btn=$('recoveryForm').querySelector('button[type="submit"]');btn.disabled=true;$('recoveryStatus').textContent='正在发送…';
 try{await db.collection('accountRecoveryRequests').add({name,createdAt:firebase.firestore.FieldValue.serverTimestamp(),status:'pending'});$('recoveryStatus').textContent='请求已提交管理员，请等待人工核对。为保护账户安全，管理员不能查看原密码。'}
 catch(err){$('recoveryStatus').textContent='提交失败：'+errorText(err)}finally{btn.disabled=false}
});

$('showPasswordChange').onclick=()=>{
 const form=$('passwordChangeForm');form.hidden=!form.hidden;
 form.reset();$('passwordChangeStatus').textContent='';
 if(!form.hidden)$('oldMemberPassword').focus();
};
$('cancelPasswordChange').onclick=()=>{$('passwordChangeForm').reset();$('passwordChangeForm').hidden=true;$('passwordChangeStatus').textContent=''};
$('passwordChangeForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const u=auth.currentUser,oldPass=$('oldMemberPassword').value,newPass=$('newMemberPassword').value,confirmPass=$('confirmMemberPassword').value;
 const status=$('passwordChangeStatus'),submit=$('passwordChangeForm').querySelector('button[type="submit"]');
 if(!u||!u.email)return status.textContent='请先登录账号';
 if(newPass.length<6)return status.textContent='新密码至少需要6位';
 if(newPass!==confirmPass)return status.textContent='两次输入的新密码不一致';
 if(oldPass===newPass)return status.textContent='新密码不能与当前密码相同';
 submit.disabled=true;status.textContent='正在验证当前密码…';
 try{
  const credential=firebase.auth.EmailAuthProvider.credential(u.email,oldPass);
  await u.reauthenticateWithCredential(credential);
  await u.updatePassword(newPass);
  $('passwordChangeForm').reset();$('passwordChangeForm').hidden=true;
  message('密码修改成功。下次登录请使用新密码。');
 }catch(err){status.textContent='修改失败：'+errorText(err)}
 finally{submit.disabled=false}
});
})();
