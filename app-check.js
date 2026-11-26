/* v12.4 Firebase App Check（reCAPTCHA Enterprise，按分数验证，用户无感知）
   必须在 firebase-config.js 之后、页面初始化 Firebase 之前加载。
   本文件只为每个 Firebase App（包括管理端、扫码页、Q分享页的独立 App）启用 App Check，
   不修改 Firebase 项目配置。若 App Check SDK 未能加载，页面照常运行（未强制执行前不影响使用）。 */
(function(){
 'use strict';
 var SITE_KEY='6LeLSTQuAAAAAFrXhBi4quz3gZb3uopyTG0FQ7B-';
 var fb=window.firebase;
 if(!fb||typeof fb.initializeApp!=='function')return;
 if(typeof fb.appCheck!=='function'||!fb.appCheck.ReCaptchaEnterpriseProvider){console.warn('App Check SDK 未加载，跳过 App Check');return}
 var activated=new Set();
 function activate(app){
  try{
   if(!app||activated.has(app.name))return;
   activated.add(app.name);
   fb.appCheck(app).activate(new fb.appCheck.ReCaptchaEnterpriseProvider(SITE_KEY),true);
  }catch(e){console.warn('App Check 启用失败（'+(app&&app.name)+'）',e)}
 }
 var original=fb.initializeApp.bind(fb);
 fb.initializeApp=function(){var app=original.apply(null,arguments);activate(app);return app};
 (fb.apps||[]).forEach(activate);
})();
