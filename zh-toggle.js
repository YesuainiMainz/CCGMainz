(function(){
'use strict';
const traditional={"爱":"愛","书":"書","图":"圖","馆":"館","发":"發","台":"臺","们":"們","这":"這","个":"個","为":"為","与":"與","关":"關","闭":"閉","开":"開","页":"頁","录":"錄","册":"冊","号":"號","码":"碼","阅":"閱","請":"請","认":"認","确":"確","审":"審","过":"過","会":"會","員":"員","进":"進","门":"門","间":"間","时":"時","对":"對","话":"話","单":"單","选":"選","择":"擇","转":"轉","换":"換","语":"語","简":"簡","体":"體","传":"傳","递":"遞","帮":"幫","查":"查","库":"庫","线":"線","览":"覽","联":"聯","络":"絡","显":"顯","经":"經","圣":"聖","场":"場","张":"張","马":"馬","陈":"陳","丽":"麗","灵":"靈","旧":"舊","区":"區","种":"種","类":"類","项":"項","记":"記","说":"說","标":"標","题":"題","数":"數","归":"歸","还":"還","冻":"凍","结":"結","优":"優","检":"檢","处":"處","权":"權","状":"狀","态":"態","变":"變","编":"編","辑":"輯","报":"報","贴":"貼","达":"達","邮":"郵","电":"電","历":"歷","条":"條","礼":"禮","贡":"貢","献":"獻","众":"眾","户":"戶","备":"備","注":"註","证":"證","专":"專","业":"業","丢":"丟","两":"兩","临":"臨","乐":"樂","习":"習","云":"雲","产":"產","仅":"僅","从":"從","余":"餘","储":"儲","儿":"兒","兴":"興","内":"內","写":"寫","决":"決","况":"況","准":"準","减":"減","击":"擊","则":"則","刚":"剛","创":"創","删":"刪","别":"別","务":"務","动":"動","协":"協","占":"佔","压":"壓","参":"參","双":"雙","后":"後","吗":"嗎","听":"聽","启":"啟","员":"員","响":"響","围":"圍","块":"塊","复":"復","够":"夠","夹":"夾","学":"學","实":"實","寻":"尋","导":"導","将":"將","尝":"嘗","尽":"盡","属":"屬","幂":"冪","并":"並","应":"應","异":"異","弹":"彈","强":"強","当":"當","怀":"懷","总":"總","扫":"掃","护":"護","据":"據","无":"無","暂":"暫","机":"機","来":"來","档":"檔","横":"橫","欢":"歡","毁":"毀","沟":"溝","没":"沒","测":"測","浏":"瀏","滚":"滾","满":"滿","灯":"燈","点":"點","独":"獨","现":"現","画":"畫","监":"監","盖":"蓋","离":"離","称":"稱","稳":"穩","筛":"篩","红":"紅","约":"約","级":"級","纯":"純","纵":"縱","练":"練","组":"組","终":"終","绘":"繪","给":"給","绝":"絕","统":"統","继":"繼","续":"續","维":"維","绿":"綠","缓":"緩","缩":"縮","网":"網","范":"範","获":"獲","补":"補","见":"見","规":"規","视":"視","触":"觸","计":"計","订":"訂","让":"讓","议":"議","许":"許","设":"設","访":"訪","识":"識","试":"試","诗":"詩","询":"詢","该":"該","详":"詳","误":"誤","请":"請","读":"讀","负":"負","败":"敗","账":"賬","质":"質","资":"資","赖":"賴","赞":"贊","载":"載","较":"較","输":"輸","迁":"遷","运":"運","连":"連","逻":"邏","邻":"鄰","里":"裡","钮":"鈕","链":"鏈","销":"銷","错":"錯","键":"鍵","镜":"鏡","问":"問","闲":"閒","队":"隊","随":"隨","隐":"隱","须":"須","预":"預","领":"領","频":"頻","额":"額","饰":"飾","验":"驗","龙":"龍"};
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
