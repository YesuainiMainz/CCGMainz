
let musicEditId=null,musicEditImages=[],musicAdminUnsub=null,musicRecords=new Map();
function musicEsc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))}
function musicYoutubeId(link){try{const u=new URL(link);const h=u.hostname.toLowerCase().replace(/^www\./,'');if(h==='youtu.be')return /^[\w-]{11}$/.test(u.pathname.slice(1).split('/')[0])?u.pathname.slice(1).split('/')[0]:'';if(['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(h)){const v=u.searchParams.get('v')||u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1];return /^[\w-]{11}$/.test(v||'')?v:''}}catch(e){}return ''}
function musicSafeLink(link){try{const u=new URL(link);return ['https:','http:'].includes(u.protocol)?u.href:''}catch(e){return ''}}
function musicImage(file){return new Promise((resolve,reject)=>{if(!file.type.startsWith('image/'))return reject(Error('请选择图片'));if(file.size>20e6)return reject(Error('图片超过20MB'));const r=new FileReader();r.onerror=()=>reject(Error('读取失败'));r.onload=()=>{const im=new Image();im.onerror=()=>reject(Error('无法打开图片'));im.onload=()=>{const ratio=Math.min(1,900/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*ratio));c.height=Math.max(1,Math.round(im.height*ratio));c.getContext('2d').drawImage(im,0,0,c.width,c.height);const data=c.toDataURL('image/jpeg',.65);if(data.length>340000)return reject(Error('图片压缩后仍过大'));resolve(data)};im.src=r.result};r.readAsDataURL(file)})}
function musicResetEditor(){musicEditId=null;musicEditImages=[];['musicTitle','musicBody','musicLink','musicFiles'].forEach(id=>document.getElementById(id).value='');document.getElementById('musicSave').textContent='发布帖子';musicPreview()}
function musicPreview(){document.getElementById('musicImagePreview').innerHTML=musicEditImages.map((x,i)=>`<span style="display:inline-block;margin:6px"><img src="${x}" alt="图片" style="height:90px;max-width:130px;object-fit:cover"><button type="button" onclick="musicRemoveImage(${i})">移除</button></span>`).join('')}
function musicRemoveImage(i){musicEditImages.splice(i,1);musicPreview()}
async function musicSavePost(){
 const status=document.getElementById('musicAdminStatus'),btn=document.getElementById('musicSave');
 if(!fzhAdminReady||!fzhAdminStore){status.textContent='请先登录管理员';return}
 const title=document.getElementById('musicTitle').value.trim(),body=document.getElementById('musicBody').value.trim(),link=document.getElementById('musicLink').value.trim();
 if(!title){status.textContent='请填写标题';return}
 if(link&&!musicSafeLink(link)){status.textContent='链接必须是 http 或 https 地址';return}
 btn.disabled=true;status.textContent='正在保存…';
 try{
  const files=[...document.getElementById('musicFiles').files];if(files.length+musicEditImages.length>2)throw Error('最多上传2张图片');
  const images=[...musicEditImages];for(const file of files)images.push(await musicImage(file));
  const data={title,body,link,images,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  if(musicEditId)await fzhAdminStore.collection('musicPosts').doc(musicEditId).update(data);
  else await fzhAdminStore.collection('musicPosts').add({...data,createdAt:firebase.firestore.FieldValue.serverTimestamp(),authorUid:fzhAdminAuth.currentUser.uid});
  musicResetEditor();status.textContent='已保存到云端';
 }catch(e){status.textContent='保存失败：'+e.message}finally{btn.disabled=false}
}
function musicStartAdmin(){if(musicAdminUnsub||!fzhAdminReady||!fzhAdminStore)return;musicAdminUnsub=fzhAdminStore.collection('musicPosts').orderBy('createdAt','desc').onSnapshot(s=>{musicRecords.clear();s.forEach(d=>musicRecords.set(d.id,d.data()));musicRenderAdmin()},e=>{document.getElementById('musicAdminStatus').textContent='读取失败：'+e.message})}
function musicRenderAdmin(){
 const list=document.getElementById('musicAdminList');if(!list)return;
 list.innerHTML=[...musicRecords].map(([id,p])=>{const link=musicSafeLink(p.link),vid=musicYoutubeId(link);return `<article style="padding:14px;border-bottom:1px solid #ddd;min-height:170px"><strong>${musicEsc(p.title)}</strong><p style="white-space:pre-wrap;overflow-wrap:anywhere">${musicEsc(p.body)}</p>${(p.images||[]).map(x=>`<img src="${x}" style="height:90px;max-width:140px;object-fit:cover;margin:3px" alt="帖子图片">`).join('')}${link?`<p><a href="${musicEsc(link)}" target="_blank" rel="noopener noreferrer">${vid?'▶ YouTube 视频':'打开链接'}</a></p>`:''}<button type="button" data-music-edit="${musicEsc(id)}">编辑</button><button type="button" class="danger" data-music-delete="${musicEsc(id)}">删除</button></article>`}).join('')||'<p style="padding:14px">暂无帖子</p>';
 list.querySelectorAll('[data-music-edit]').forEach(b=>b.onclick=()=>musicEditPost(b.dataset.musicEdit));
 list.querySelectorAll('[data-music-delete]').forEach(b=>b.onclick=()=>musicDeletePost(b.dataset.musicDelete));
}
function musicEditPost(id){const p=musicRecords.get(id);if(!p)return;musicEditId=id;musicEditImages=[...(p.images||[])];document.getElementById('musicTitle').value=p.title||'';document.getElementById('musicBody').value=p.body||'';document.getElementById('musicLink').value=p.link||'';document.getElementById('musicFiles').value='';document.getElementById('musicSave').textContent='保存修改';musicPreview();document.getElementById('musicTitle').scrollIntoView({behavior:'smooth',block:'center'})}
async function musicDeletePost(id){if(!confirm('确定永久删除此音乐角帖子吗？'))return;try{await fzhAdminStore.collection('musicPosts').doc(id).delete();if(musicEditId===id)musicResetEditor()}catch(e){document.getElementById('musicAdminStatus').textContent='删除失败：'+e.message}}
