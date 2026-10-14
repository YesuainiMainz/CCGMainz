(()=>{'use strict';
const $=id=>document.getElementById(id);
const cfg=window.FZH_FIREBASE_CONFIG;
let resolveReady,rejectReady;
const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject});
window.CCGMember={user:null,profile:null,ready};
const status=$('memberStatus');
function message(v){status.textContent=v}
function panel(name){for(const id of ['loginPanel','registerPanel','recoveryPanel','loggedInPanel'])$(id).hidden=id!==name}
function errorText(e){const codes={'auth/email-already-in-use':'该邮箱已注册，请直接登录','auth/invalid-credential':'账号或密码错误','auth/weak-password':'密码强度不足','auth/invalid-email':'邮箱格式不正确','auth/too-many-requests':'请求过于频繁，请稍后再试'};return codes[e.code]||e.message||String(e)}
function lockInputs(locked){$('memberEmail').disabled=locked;$('memberPassword').disabled=locked}
async function profileFor(u){const ref=db.collection('platformMembers').doc(u.uid),snap=await ref.get();return snap.exists?snap.data():null}
let auth,db;
try{
 if(!window.firebase||!cfg)throw Error('Firebase 配置尚未加载');
 if(!firebase.apps.length)firebase.initializeApp(cfg);
 auth=firebase.auth();db=firebase.firestore();
 auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
}catch(e){message('登录服务无法启动：'+e.message);rejectReady(e);return}
function loggedOut(){window.CCGMember.user=null;window.CCGMember.profile=null;lockInputs(false);$('memberPassword').value='';$('memberServices').hidden=true;panel('loginPanel');message('请使用账号和密码登录')}
auth.onAuthStateChanged(async u=>{
 if(!u){loggedOut();return}
 try{
  let profile=await profileFor(u);
  window.CCGMember.user=u;window.CCGMember.profile=profile;
  $('memberEmail').value=u.email||'';$('memberPassword').value='';lockInputs(true);
  $('loggedInIdentity').textContent='当前账号：'+(u.email||'')+(profile?' · '+profile.name:'');
  panel('loggedInPanel');$('memberServices').hidden=!profile;
  $('completeProfile').hidden=!!profile;
  $('profilePanel').hidden=true;
  message(profile?'登录成功':'此账号尚未完善实名资料，请先补充姓名');
  if(profile)resolveReady({user:u,profile});
 }catch(e){message('加载实名资料失败：'+errorText(e))}
});
$('memberForm').addEventListener('submit',async e=>{e.preventDefault();const email=$('memberEmail').value.trim(),pass=$('memberPassword').value;message('正在登录…');try{await auth.signInWithEmailAndPassword(email,pass)}catch(err){message('登录失败：'+errorText(err))}});
$('register').onclick=()=>{panel('registerPanel');message('请填写注册资料')};
$('backLogin').onclick=()=>{panel('loginPanel');message('请登录')};
$('registerForm').addEventListener('submit',async e=>{e.preventDefault();const name=$('realName').value.trim(),email=$('registerEmail').value.trim(),pass=$('registerPassword').value;if(!name||name.length>40)return message('姓名应为1至40字');message('正在注册…');try{
 const result=await auth.createUserWithEmailAndPassword(email,pass);
 await db.collection('platformMembers').doc(result.user.uid).set({name,email:result.user.email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
 const profile=await profileFor(result.user);window.CCGMember.user=result.user;window.CCGMember.profile=profile;
 $('loggedInIdentity').textContent='当前账号：'+result.user.email+' · '+name;$('memberEmail').value=result.user.email;$('memberPassword').value='';lockInputs(true);panel('loggedInPanel');$('memberServices').hidden=false;$('completeProfile').hidden=true;message('注册成功');resolveReady({user:result.user,profile});
 }catch(err){message('注册失败：'+errorText(err))}});
$('completeProfile').onclick=()=>{$('profilePanel').hidden=false};
$('saveProfile').onclick=async()=>{const u=auth.currentUser,name=$('profileName').value.trim();if(!u||!name||name.length>40)return message('请输入1至40字的真实姓名');try{await db.collection('platformMembers').doc(u.uid).set({name,email:u.email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});const profile=await profileFor(u);window.CCGMember.profile=profile;$('memberServices').hidden=false;$('completeProfile').hidden=true;$('profilePanel').hidden=true;$('loggedInIdentity').textContent='当前账号：'+u.email+' · '+name;message('实名资料已保存');resolveReady({user:u,profile})}catch(err){message('保存失败：'+errorText(err))}};
$('logout').onclick=async()=>{if(!confirm('确定退出登录吗？'))return;try{await auth.signOut()}catch(e){message('退出失败：'+errorText(e))}};
$('forgotAccount').onclick=()=>{panel('recoveryPanel');$('recoveryName').value='';message('请填写注册姓名')};
$('backRecovery').onclick=()=>{panel('loginPanel');message('请登录')};
$('recoveryForm').addEventListener('submit',async e=>{
 e.preventDefault();const name=$('recoveryName').value.trim();if(!name||name.length>40){$('recoveryStatus').textContent='请输入1至40字的姓名';return}
 const btn=$('recoveryForm').querySelector('button[type="submit"]');btn.disabled=true;$('recoveryStatus').textContent='正在发送…';
 try{await db.collection('accountRecoveryRequests').add({name,createdAt:firebase.firestore.FieldValue.serverTimestamp()});$('recoveryStatus').textContent='请求已提交管理员，请等待人工核对。为保护账户安全，管理员不能查看原密码。'}
 catch(err){$('recoveryStatus').textContent='提交失败：'+errorText(err)}finally{btn.disabled=false}
});
})();