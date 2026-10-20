(function(){
'use strict';
const dictionary={"会员登录": {"en": "Member sign in", "de": "Mitgliederanmeldung"}, "注册新账号": {"en": "Create account", "de": "Neues Konto erstellen"}, "账号": {"en": "Account", "de": "Konto"}, "密码": {"en": "Password", "de": "Passwort"}, "登录": {"en": "Sign in", "de": "Anmelden"}, "注册": {"en": "Register", "de": "Registrieren"}, "确认注册": {"en": "Submit registration", "de": "Registrierung absenden"}, "返回登录": {"en": "Back to sign in", "de": "Zurück zur Anmeldung"}, "忘记密码": {"en": "Forgot password", "de": "Passwort vergessen"}, "真实姓名": {"en": "Full name", "de": "Vollständiger Name"}, "电子邮箱": {"en": "Email address", "de": "E-Mail-Adresse"}, "修改密码": {"en": "Change password", "de": "Passwort ändern"}, "退出登录": {"en": "Sign out", "de": "Abmelden"}, "已登录": {"en": "Signed in", "de": "Angemeldet"}, "确认修改": {"en": "Confirm change", "de": "Änderung bestätigen"}, "取消": {"en": "Cancel", "de": "Abbrechen"}, "我的消息": {"en": "My messages", "de": "Meine Nachrichten"}, "CCGMainz图书馆": {"en": "CCGMainz Library", "de": "CCGMainz Bibliothek"}, "CCGMainz爱心站": {"en": "CCGMainz Sharing Station", "de": "CCGMainz Tauschbörse"}, "CCGMainz幸福家人数字平台": {"en": "CCGMainz Family Platform", "de": "CCGMainz Familienplattform"}, "分享知识 · 传递爱心 · 彼此帮助": {"en": "Share knowledge · Share kindness · Help each other", "de": "Wissen teilen · Liebe weitergeben · Einander helfen"}, "进入图书馆 →": {"en": "Open library →", "de": "Bibliothek öffnen →"}, "进入爱心站 →": {"en": "Open sharing station →", "de": "Tauschbörse öffnen →"}, "会员图书目录 · 登录后可借阅": {"en": "Member book catalog · Sign in to borrow", "de": "Bücherkatalog · Zum Ausleihen anmelden"}, "借书申请": {"en": "Book loan request", "de": "Buchausleihanfrage"}, "我想借": {"en": "Borrow this book", "de": "Buch ausleihen"}, "提交申请": {"en": "Submit request", "de": "Anfrage senden"}, "申请记录": {"en": "Request history", "de": "Anfrageverlauf"}, "搜索": {"en": "Search", "de": "Suchen"}, "图书名称": {"en": "Book title", "de": "Buchtitel"}, "数量": {"en": "Quantity", "de": "Menge"}, "分类": {"en": "Category", "de": "Kategorie"}, "已借出": {"en": "On loan", "de": "Ausgeliehen"}, "可借阅": {"en": "Available", "de": "Verfügbar"}, "返回": {"en": "Back", "de": "Zurück"}, "首页": {"en": "Home", "de": "Startseite"}, "我的帖子": {"en": "My posts", "de": "Meine Beiträge"}, "发布闲置物品": {"en": "Post an item", "de": "Artikel anbieten"}, "访问我发布的帖子": {"en": "Manage my posts", "de": "Meine Beiträge verwalten"}, "我有需要": {"en": "I need this", "de": "Ich benötige das"}, "发布": {"en": "Publish", "de": "Veröffentlichen"}, "修改": {"en": "Edit", "de": "Bearbeiten"}, "删除": {"en": "Delete", "de": "Löschen"}, "图片": {"en": "Image", "de": "Bild"}, "选择图片": {"en": "Choose image", "de": "Bild auswählen"}, "需求申请": {"en": "Item request", "de": "Artikelanfrage"}, "消息": {"en": "Messages", "de": "Nachrichten"}, "通知": {"en": "Notification", "de": "Mitteilung"}, "公告": {"en": "Announcement", "de": "Bekanntmachung"}, "我已阅读": {"en": "I have read this", "de": "Ich habe es gelesen"}, "请先登录": {"en": "Please sign in first", "de": "Bitte zuerst anmelden"}, "正在加载": {"en": "Loading", "de": "Wird geladen"}, "发送": {"en": "Send", "de": "Senden"}, "保存": {"en": "Save", "de": "Speichern"}, "确认": {"en": "Confirm", "de": "Bestätigen"}, "姓名": {"en": "Name", "de": "Name"}, "邮箱": {"en": "Email", "de": "E-Mail"}, "密码（至少6位）": {"en": "Password (at least 6 characters)", "de": "Passwort (mindestens 6 Zeichen)"}, "注册时需要填写真实姓名、电子邮箱和密码。爱心站将公开显示姓名。": {"en": "Enter your real name, email and password. Your name will be visible on the sharing station.", "de": "Geben Sie Ihren echten Namen, Ihre E-Mail und Ihr Passwort ein. Ihr Name wird in der Tauschbörse angezeigt."}, "使用注册邮箱作为账号登录，浏览器密码管理器可保存登录信息。": {"en": "Sign in with your registered email. Your browser can save your credentials.", "de": "Melden Sie sich mit Ihrer registrierten E-Mail an. Ihr Browser kann die Zugangsdaten speichern."}, "登录后仍需等待管理员批准，批准后才可进入图书馆、爱心站及查看消息。需要切换账号时，请点击退出登录。": {"en": "Administrator approval is required before you can access the library, sharing station and messages. Sign out to switch accounts.", "de": "Für den Zugang zu Bibliothek, Tauschbörse und Nachrichten ist die Freigabe durch den Administrator erforderlich. Zum Kontowechsel bitte abmelden."}, "图书借阅进度和爱心站需求通知，仅本人可见。点击任意消息可展开详情。": {"en": "Book loan updates and sharing requests are private. Select a message for details.", "de": "Buchausleihen und Anfragen sind privat. Wählen Sie eine Nachricht für Details."}, "正在检查登录状态…": {"en": "Checking sign-in status…", "de": "Anmeldestatus wird geprüft…"}, "正在加载消息…": {"en": "Loading messages…", "de": "Nachrichten werden geladen…"}},traditional={"爱": "愛", "书": "書", "图": "圖", "馆": "館", "发": "發", "台": "臺", "们": "們", "这": "這", "个": "個", "为": "為", "与": "與", "关": "關", "闭": "閉", "开": "開", "页": "頁", "录": "錄", "册": "冊", "号": "號", "码": "碼", "阅": "读", "請": "請", "认": "認", "确": "確", "审": "審", "过": "過", "会": "會", "員": "員", "进": "進", "门": "門", "间": "間", "时": "時", "对": "對", "话": "話", "单": "單", "选": "選", "择": "擇", "转": "轉", "换": "換", "语": "語", "简": "簡", "体": "體", "传": "傳", "递": "遞", "帮": "幫", "查": "查", "库": "庫", "线": "線", "览": "覽", "联": "聯", "络": "絡", "显": "顯", "经": "經", "圣": "聖", "场": "場", "张": "張", "马": "馬", "陈": "陳", "丽": "麗", "灵": "靈", "旧": "舊", "区": "區", "种": "種", "类": "類", "项": "項", "记": "記", "说": "說", "标": "標", "题": "題", "数": "數", "归": "歸", "还": "還", "冻": "凍", "结": "結", "优": "優", "检": "檢", "处": "處", "权": "權", "状": "狀", "态": "態", "变": "變", "编": "編", "辑": "輯", "报": "報", "贴": "貼", "达": "達", "邮": "郵", "电": "電", "历": "歷", "条": "條", "礼": "禮", "贡": "貢", "献": "獻", "众": "眾", "户": "戶", "备": "備", "注": "註", "证": "證"};
const languages={zh:'简体中文',tw:'繁體中文',en:'English',de:'Deutsch'};
let language='zh',working=false;
const originals=new WeakMap(),originalAttrs=new WeakMap();
function translate(value){
 if(language==='zh')return value;
 if(language==='tw')return Array.from(value).map(c=>traditional[c]||c).join('');
 const trimmed=value.trim();
 if(dictionary[trimmed])return value.replace(trimmed,dictionary[trimmed][language]);
 let output=value;
 for(const phrase of Object.keys(dictionary).sort((a,b)=>b.length-a.length)){
  if(phrase.length<2)continue;
  output=output.split(phrase).join(dictionary[phrase][language]);
 }
 return output;
}
function apply(){
 if(working)return;working=true;
 try{
  document.documentElement.lang={zh:'zh-CN',tw:'zh-Hant',en:'en',de:'de'}[language];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
   if(!node.nodeValue.trim()||!node.parentElement||node.parentElement.closest('script,style,textarea,pre,code,[data-no-translate]'))continue;
   if(!originals.has(node))originals.set(node,node.nodeValue);
   const orig=originals.get(node),current=node.nodeValue;
   if(current!==orig && current!==translate(orig) && /[\u3400-\u9fff]/.test(current) && !current.includes(dictionary[orig]?.en||'__UNMATCHABLE__'))originals.set(node,current);
   const next=translate(originals.get(node));if(node.nodeValue!==next)node.nodeValue=next;
  }
  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
   if(!originalAttrs.has(el))originalAttrs.set(el,el.placeholder);
   const next=translate(originalAttrs.get(el));if(el.placeholder!==next)el.placeholder=next;
  });
 }finally{working=false}
}
function init(){
 const old=document.getElementById('mcgLanguageSwitch');if(!old)return;
 const select=document.createElement('select');select.id=old.id;select.setAttribute('aria-label','选择语言 / Select language');select.dataset.noTranslate='';
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