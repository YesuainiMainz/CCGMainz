/* MCG v5.8: display-only Simplified/Traditional Chinese conversion.
   Original Firestore data, user inputs and original DOM strings are never overwritten in storage. */
(()=>{
 'use strict';
 const btn=document.getElementById('mcgLanguageSwitch');
 const status=document.getElementById('mcgLanguageStatus');
 if(!btn)return;
 const key='mcg-public-language';
 let mode='cn', converters=null, converting=false, scheduled=false;
 const originals=new WeakMap(), lastShown=new WeakMap();
 const attrOriginals=new WeakMap(),attrShown=new WeakMap();
 const attrNames=['placeholder','title','alt','aria-label'];
 const ignoreTags=new Set(['SCRIPT','STYLE','TEXTAREA','OPTION','NOSCRIPT','CODE','PRE']);
 const textFilter=node=>{
  const parent=node.parentElement;
  if(!parent||parent.closest('[data-no-translate]')||ignoreTags.has(parent.tagName)||parent.closest('svg'))return false;
  return /[\u3400-\u9fff]/.test(node.nodeValue||'');
 };
 function converter(){return mode==='tw'?converters.toTraditional:converters.toSimplified}
 function convertText(value){return converter()(value)}
 function apply(){
  if(!converters||converting)return;
  converting=true;
  try{
   const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
   const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
   for(const node of nodes){
    if(!textFilter(node))continue;
    const current=node.nodeValue;
    const last=lastShown.get(node);
    if(!originals.has(node)||current!==last)originals.set(node,current);
    const target=convertText(originals.get(node));
    if(current!==target)node.nodeValue=target;
    lastShown.set(node,target);
   }
   const elements=document.body.querySelectorAll('[placeholder],[title],[alt],[aria-label]');
   for(const el of elements){
    if(el.closest('[data-no-translate]'))continue;
    let map=attrOriginals.get(el),shown=attrShown.get(el);
    if(!map){map={};attrOriginals.set(el,map)}
    if(!shown){shown={};attrShown.set(el,shown)}
    for(const attr of attrNames){
     if(!el.hasAttribute(attr))continue;
     const current=el.getAttribute(attr);
     if(!(attr in map)||current!==shown[attr])map[attr]=current;
     const target=convertText(map[attr]);
     if(current!==target)el.setAttribute(attr,target);
     shown[attr]=target;
    }
   }
   document.documentElement.lang=mode==='tw'?'zh-Hant':'zh-Hans';
   btn.textContent=mode==='tw'?'切换为简体中文':'切換為繁體中文';
   btn.setAttribute('aria-label',mode==='tw'?'切换为简体中文':'切換為繁體中文');
  }finally{converting=false}
 }
 function schedule(){
  if(scheduled||!converters)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;apply()});
 }
 const observer=new MutationObserver(changes=>{
  if(changes.some(c=>c.type==='childList'||c.type==='characterData'||c.type==='attributes'))schedule();
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrNames});
 function loadScript(url){
  return new Promise((resolve,reject)=>{
   const s=document.createElement('script');s.src=url;s.async=true;
   s.onload=resolve;s.onerror=()=>{s.remove();reject(Error('转换组件加载失败'))};
   document.head.append(s);
  });
 }
 async function ensureConverter(){
  if(converters)return;
  if(!window.OpenCC){
   try{await loadScript('https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js')}
   catch{await loadScript('https://unpkg.com/opencc-js@1.0.5/dist/umd/full.js')}
  }
  if(!window.OpenCC||typeof window.OpenCC.Converter!=='function')throw Error('简繁转换组件不可用，请检查网络');
  converters={
   toTraditional:window.OpenCC.Converter({from:'cn',to:'tw'}),
   toSimplified:window.OpenCC.Converter({from:'tw',to:'cn'})
  };
 }
 btn.addEventListener('click',async()=>{
  if(btn.disabled)return;
  btn.disabled=true;
  if(status)status.textContent='正在切换语言…';
  try{
   await ensureConverter();
   mode=mode==='cn'?'tw':'cn';
   try{localStorage.setItem(key,mode)}catch{}
   apply();
   if(status)status.textContent='';
  }catch(e){if(status)status.textContent='语言切换失败：'+e.message}
  finally{btn.disabled=false}
 });
 try{
  if(localStorage.getItem(key)==='tw'){
   btn.disabled=true;
   ensureConverter().then(()=>{mode='tw';apply()})
   .catch(e=>{if(status)status.textContent='语言切换失败：'+e.message})
   .finally(()=>{btn.disabled=false});
  }
 }catch{}
})();
