(function(){
'use strict';
const traditional={"爱": "愛", "书": "書", "图": "圖", "馆": "館", "发": "發", "台": "臺", "们": "們", "这": "這", "个": "個", "为": "為", "与": "與", "关": "關", "闭": "閉", "开": "開", "页": "頁", "录": "錄", "册": "冊", "号": "號", "码": "碼", "阅": "閱", "請": "請", "认": "認", "确": "確", "审": "審", "过": "過", "会": "會", "員": "員", "进": "進", "门": "門", "间": "間", "时": "時", "对": "對", "话": "話", "单": "單", "选": "選", "择": "擇", "转": "轉", "换": "換", "语": "語", "简": "簡", "体": "體", "传": "傳", "递": "遞", "帮": "幫", "查": "查", "库": "庫", "线": "線", "览": "覽", "联": "聯", "络": "絡", "显": "顯", "经": "經", "圣": "聖", "场": "場", "张": "張", "马": "馬", "陈": "陳", "丽": "麗", "灵": "靈", "旧": "舊", "区": "區", "种": "種", "类": "類", "项": "項", "记": "記", "说": "說", "标": "標", "题": "題", "数": "數", "归": "歸", "还": "還", "冻": "凍", "结": "結", "优": "優", "检": "檢", "处": "處", "权": "權", "状": "狀", "态": "態", "变": "變", "编": "編", "辑": "輯", "报": "報", "贴": "貼", "达": "達", "邮": "郵", "电": "電", "历": "歷", "条": "條", "礼": "禮", "贡": "貢", "献": "獻", "众": "眾", "户": "戶", "备": "備", "注": "註", "证": "證"};
const languages={zh:'简体中文',tw:'繁體中文'};
let language='zh',working=false;
const originals=new WeakMap(),originalAttrs=new WeakMap();
function translate(value){return language==='tw'?Array.from(value).map(c=>traditional[c]||c).join(''):value}
function apply(){
 if(working)return;working=true;
 try{
  document.documentElement.lang=language==='tw'?'zh-Hant':'zh-CN';
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
   if(!node.nodeValue.trim()||!node.parentElement||node.parentElement.closest('script,style,textarea,pre,code,[data-no-translate]'))continue;
   if(!originals.has(node))originals.set(node,node.nodeValue);
   const orig=originals.get(node),current=node.nodeValue;
   if(current!==orig&&current!==translate(orig))originals.set(node,current);
   const next=translate(originals.get(node));if(node.nodeValue!==next)node.nodeValue=next;
  }
  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
   if(!originalAttrs.has(el))originalAttrs.set(el,el.placeholder);
   const orig=originalAttrs.get(el);
   if(el.placeholder!==orig&&el.placeholder!==translate(orig))originalAttrs.set(el,el.placeholder);
   const next=translate(originalAttrs.get(el));if(el.placeholder!==next)el.placeholder=next;
  });
 }finally{working=false}
}
function init(){
 const old=document.getElementById('mcgLanguageSwitch');if(!old)return;
 const select=document.createElement('select');select.id=old.id;select.setAttribute('aria-label','选择语言');select.dataset.noTranslate='';
 for(const [key,label] of Object.entries(languages)){const o=document.createElement('option');o.value=key;o.textContent=label;select.append(o)}
 old.replaceWith(select);
 try{const v=localStorage.getItem('ccg-language');if(languages[v])language=v}catch(e){}
 select.value=language;
 select.onchange=()=>{language=select.value;try{localStorage.setItem('ccg-language',language)}catch(e){}apply()};
 apply();
 const observer=new MutationObserver(()=>{if(!working)apply()});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
