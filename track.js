/* MeuFluxo · Fase 4 — track.js (rastreamento próprio, sem dependências)
   O que faz: cookie de visitante (1 ano) + cookie de sessão (30 min), captura de UTMs/origem (primeiro toque guardado 30 dias),
   eventos padronizados → dataLayer (GTM) · GA4 (se MF_CONFIG.tracking.ga4) · Meta Pixel (se metaPixel) · /api/track (planilha) · localStorage (painel).
   Não guarda nome, e-mail ou telefone. IDs são aleatórios. Ver painel.html para o funil. */
(function(){
'use strict';
const CFG=Object.assign({},(window.MF_CONFIG||{}).tracking||{});
const KEYS=(window.MF_CONFIG||{}).paramsRepassados||['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
const q=new URLSearchParams(location.search);
const PAGE_ALIAS={black26:'index'}; // endereços de campanha que mostram o quiz (vercel.json) contam como 'index'; o caminho real fica em path
const page=(r=>PAGE_ALIAS[r]||r)((location.pathname.split('/').pop()||'index.html').replace('.html','')||'index');
const lang=q.get('lang')==='en'?'en':'pt';
/* Explicit test/staff sessions stay local. No automatic classification of customers. */
const store=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k)||'';if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return ''}};
const label=v=>String(v||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,40);
const flags={test:store('mf_test'),internal:store('mf_internal')};
for(const [param,key] of [['mf_test','test'],['mf_internal','internal']]){
 if(q.has(param)){const raw=q.get(param);flags[key]=raw==='off'?'':(label(raw)||'1');store(param,flags[key]||null)}
}
if(['painel','overview'].includes(page)){flags.internal='staff';store('mf_internal','staff')}
const excluded=!!(flags.test||flags.internal);
if(excluded){CFG.gtm='';CFG.ga4='';CFG.metaPixel=''}
/* ---- ids ---- */
const uid=()=>{try{return crypto.randomUUID().replace(/-/g,'').slice(0,20)}catch(e){return Date.now().toString(36)+Math.random().toString(36).slice(2,10)}};
const getC=n=>{const m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):''};
const setC=(n,v,sec)=>{document.cookie=n+'='+encodeURIComponent(v)+';path=/;max-age='+sec+';SameSite=Lax'+(location.protocol==='https:'?';Secure':'')};
let vid=getC('mf_vid');const newVisitor=!vid;if(!vid){vid=uid();}setC('mf_vid',vid,365*86400);
let sid=getC('mf_sid');const newSession=!sid;if(!sid){sid=uid();}setC('mf_sid',sid,30*60);
/* ---- origem (utm) ---- */
const utm={};KEYS.forEach(k=>{if(q.get(k))utm[k]=q.get(k).slice(0,120)});
let first=null;try{first=JSON.parse(localStorage.getItem('mf_first')||'null')}catch(e){}
if(first&&first.ts&&!first.first_ts){first.first_ts=first.ts;delete first.ts;try{localStorage.setItem('mf_first',JSON.stringify(first))}catch(e){}}
if(!first||!first.first_ts||(Date.now()-first.first_ts)>30*86400000){first={first_ts:Date.now(),ref:(document.referrer||'').slice(0,200),landing:page,...utm};try{localStorage.setItem('mf_first',JSON.stringify(first))}catch(e){}}
const origin=Object.assign({},first,utm);delete origin.ts; // último toque sobrescreve o primeiro, só para os utm_*
/* ---- carregadores opcionais (IDs vêm do config.js; vazios = nada carrega) ---- */
window.dataLayer=window.dataLayer||[];
function loadScript(src){const s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s)}
if(CFG.gtm){window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});loadScript('https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(CFG.gtm))}
else if(CFG.ga4){loadScript('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(CFG.ga4));window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',CFG.ga4,{send_page_view:false})}
if(CFG.metaPixel&&!window.fbq){(function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');window.fbq('init',CFG.metaPixel)}
const META={letter_view:'ViewContent',offer_view:'ViewContent',checkout_click:'InitiateCheckout',quiz_done:'CompleteRegistration',quiz_start:'Lead'};
/* ---- envio ---- */
function local(rec){try{const a=JSON.parse(localStorage.getItem('mf_events')||'[]');a.push(rec);if(a.length>400)a.splice(0,a.length-400);localStorage.setItem('mf_events',JSON.stringify(a))}catch(e){}}
function beacon(rec){if(excluded||!CFG.endpoint)return;try{const body=JSON.stringify(rec);if(navigator.sendBeacon)navigator.sendBeacon(CFG.endpoint,new Blob([body],{type:'application/json'}));else fetch(CFG.endpoint,{method:'POST',body,keepalive:true,headers:{'Content-Type':'application/json'}})}catch(e){}}
const AB=window.MF_CARTA?{carta:window.MF_CARTA.variant,carta_forcada:window.MF_CARTA.forced?1:0}:{};
function send(ev,p){p=p||{};const rec=Object.assign({},origin,AB,p,{ev,ts:Date.now(),vid,sid,page,lang,path:location.pathname,test:flags.test,internal:flags.internal});
 try{if(!excluded)window.dataLayer.push(Object.assign({event:'mf_'+ev},rec))}catch(e){}
 try{if(window.gtag&&CFG.ga4)window.gtag('event',ev,Object.assign({page,lang},AB,p))}catch(e){}
 try{if(window.fbq&&CFG.metaPixel){const fp=Object.assign({},AB,p);if(META[ev])window.fbq('track',META[ev],fp);else window.fbq('trackCustom','mf_'+ev,fp)}}catch(e){}
 local(rec);beacon(rec);return rec}
send.ids={vid,sid,first,utm,newVisitor,newSession};send.flags=flags;send.excluded=excluded;
window.MF_TRACK=send;
/* ---- automáticos: page_view, profundidade de rolagem, saída ---- */
send('page_view',{new_visitor:newVisitor?1:0,new_session:newSession?1:0,ref:(document.referrer||'').slice(0,200),w:window.innerWidth,h:window.innerHeight});
let maxDepth=0;const marks={25:0,50:0,75:0,100:0};const t0=Date.now();
function depth(){if(window.MF_RENDER_PENDING)return; /* carta do teste A/B ainda carregando: página vazia não conta como 100% */const d=document.documentElement;const total=d.scrollHeight-d.clientHeight;const pct=total<=0?100:Math.min(100,Math.round((d.scrollTop/total)*100));if(pct>maxDepth)maxDepth=pct;[25,50,75,100].forEach(m=>{if(!marks[m]&&pct>=m){marks[m]=1;send('scroll',{depth:m})}})}
window.addEventListener('scroll',depth,{passive:true});setTimeout(depth,1500);
let left=false;function leave(){if(left)return;left=true;send('leave',{depth:maxDepth,secs:Math.round((Date.now()-t0)/1000)})}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')leave()});window.addEventListener('pagehide',leave);
/* cliques externos (checkout/Payt) marcados com data-track nas páginas; aqui só o genérico para links externos */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="http"]');if(!a||a.dataset.track)return;try{if(new URL(a.href).host!==location.host)send('outbound',{href:a.href.slice(0,200)})}catch(x){}},true);
})();
