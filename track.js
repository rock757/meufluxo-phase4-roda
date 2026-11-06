/* MeuFluxo · Fase 4 — track.js (rastreamento próprio, sem dependências)
   O que faz: cookie de visitante (1 ano) + cookie de sessão (30 min), captura de UTMs/origem (primeiro toque guardado 30 dias),
   eventos padronizados → dataLayer (GTM) · GA4 (se MF_CONFIG.tracking.ga4) · Meta Pixel (se metaPixel) · /api/track (planilha) · localStorage (painel).
   Não guarda nome, e-mail ou telefone. IDs são aleatórios. Ver painel.html para o funil. */
(function(){
'use strict';
const CFG=Object.assign({},(window.MF_CONFIG||{}).tracking||{});
const CENTRAL=window.MF_CENTRAL||{on:false,id:()=>'',etapa:()=>{}};
if(CENTRAL.on){CFG.gtm='';CFG.ga4='';CFG.metaPixel=''} // 1 produtor por evento de pixel: com o central ligado, este arquivo não carrega GTM/GA4/Meta
const KEYS=(window.MF_CONFIG||{}).paramsRepassados||['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
const q=new URLSearchParams(location.search);
const page=(location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';
const lang=q.get('lang')==='en'?'en':'pt';
/* ---- ids ---- */
const uid=()=>{try{return crypto.randomUUID().replace(/-/g,'').slice(0,20)}catch(e){return Date.now().toString(36)+Math.random().toString(36).slice(2,10)}};
const getC=n=>{const m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):''};
const setC=(n,v,sec)=>{document.cookie=n+'='+encodeURIComponent(v)+';path=/;max-age='+sec+';SameSite=Lax'+(location.protocol==='https:'?';Secure':'')};
let vid=getC('mf_vid');const newVisitor=!vid;if(!vid){vid=uid();}setC('mf_vid',vid,365*86400);
let sid=getC('mf_sid');const newSession=!sid;if(!sid){sid=uid();}setC('mf_sid',sid,30*60);
/* ---- origem (utm) ---- */
const utm={};KEYS.forEach(k=>{if(q.get(k))utm[k]=q.get(k).slice(0,120)});
let first=null;try{first=JSON.parse(localStorage.getItem('mf_first')||'null')}catch(e){}
if(first&&first.ts&&!first.first_ts){first.first_ts=first.ts;delete first.ts;try{localStorage.setItem('mf_first',JSON.stringify(first))}catch(e){}} // Batch 1: a hora do primeiro toque vira first_ts (antes contaminava a hora de TODO evento)
if(!first||!first.first_ts||(Date.now()-first.first_ts)>30*86400000){first={first_ts:Date.now(),ref:(document.referrer||'').slice(0,200),landing:page,...utm};try{localStorage.setItem('mf_first',JSON.stringify(first))}catch(e){}}
const origin=Object.assign({},first,utm); delete origin.ts; // último toque sobrescreve o primeiro, só para os utm_*
/* ---- rótulos explícitos (Batch 1): ?mf_test=nome marca este navegador como teste; páginas privadas marcam como equipe ---- */
const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k)||'';if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return ''}};
const lab=v=>String(v||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,40);
if(q.has('mf_test')){const v=lab(q.get('mf_test'));ls('mf_test',(!v||v==='off')?null:v)}
if(q.get('mf_internal')==='off')ls('mf_internal',null);
const flags={test:ls('mf_test'),internal:ls('mf_internal'),wd:(navigator.webdriver?1:0)};
/* ---- carregadores opcionais (IDs vêm do config.js; vazios = nada carrega) ---- */
window.dataLayer=window.dataLayer||[];
function loadScript(src){const s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s)}
if(CFG.gtm){window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});loadScript('https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(CFG.gtm))}
else if(CFG.ga4){loadScript('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(CFG.ga4));window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',CFG.ga4,{send_page_view:false})}
if(CFG.metaPixel&&!window.fbq){(function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');window.fbq('init',CFG.metaPixel)}
const META={letter_view:'ViewContent',offer_view:'ViewContent',checkout_click:'InitiateCheckout',quiz_done:'CompleteRegistration',quiz_start:'Lead'};
/* marcos enviados ao central (/api/etapa, fora dos pixels). Chave e rótulo fixos: nunca respostas, prioridade ou dados pessoais. */
const ETAPA={quiz_start:['02-roda-inicio','Começou a Roda'],quiz_done:['03-roda-fim','Terminou a Roda'],letter_view:['04-carta','Abriu a carta'],offer_view:['05-oferta','Viu a oferta'],checkout_click:['06-checkout','Clicou no checkout']};
/* ---- envio ---- */
function local(rec){try{const a=JSON.parse(localStorage.getItem('mf_events')||'[]');a.push(rec);if(a.length>400)a.splice(0,a.length-400);localStorage.setItem('mf_events',JSON.stringify(a))}catch(e){}}
function beacon(rec){if(!CFG.endpoint)return;try{const body=JSON.stringify(rec);if(navigator.sendBeacon)navigator.sendBeacon(CFG.endpoint,new Blob([body],{type:'application/json'}));else fetch(CFG.endpoint,{method:'POST',body,keepalive:true,headers:{'Content-Type':'application/json'}})}catch(e){}}
const PROTECTED=new Set(['ev','ts','vid','sid','page','lang','path','first_ts','landing','test','internal','wd','trck',...KEYS]);
function safe(p){const o={};Object.keys(p||{}).forEach(k=>{if(PROTECTED.has(k))return;const v=p[k];if(v==null)return;o[k]=(typeof v==='number'||typeof v==='boolean')?v:String(v).slice(0,200)});return o}
function send(ev,p){p=safe(p);const rec=Object.assign({},origin,p,{ev,ts:Date.now(),vid,sid,page,lang,path:location.pathname},flags.test?{test:flags.test}:{},flags.internal?{internal:flags.internal}:{},{wd:flags.wd},(()=>{const t=CENTRAL.id();return t?{trck:String(t).slice(0,64)}:{}})()); // campos protegidos por último: o payload não sobrescreve hora nem identidade
 try{window.dataLayer.push(Object.assign({event:'mf_'+ev},rec))}catch(e){}
 try{if(window.gtag&&CFG.ga4)window.gtag('event',ev,Object.assign({page,lang},p))}catch(e){}
 try{if(window.fbq&&CFG.metaPixel){if(META[ev])window.fbq('track',META[ev],p);else window.fbq('trackCustom','mf_'+ev,p)}}catch(e){}
 try{if(ETAPA[ev])CENTRAL.etapa(ETAPA[ev][0],ETAPA[ev][1])}catch(e){}
 local(rec);beacon(rec);return rec}
send.ids={vid,sid,first,utm,newVisitor,newSession};send.flags=flags;
window.MF_TRACK=send;
/* ---- automáticos: page_view, profundidade de rolagem, saída ---- */
send('page_view',{new_visitor:newVisitor?1:0,new_session:newSession?1:0,cur_ref:(document.referrer||'').slice(0,200),w:window.innerWidth,h:window.innerHeight});
/* elo vid↔id central: o page_view de um visitante novo sai ANTES de o central responder o identify; quando o id chega, 1 evento por sessão liga os dois. */
if(CENTRAL.on){let tries=0;const link=()=>{const t=CENTRAL.id();if(t){if(ls('mf_trck_sid')!==sid+':'+t){ls('mf_trck_sid',sid+':'+t);send('central_id',{})}return}if(++tries<40)setTimeout(link,250)};setTimeout(link,250)}
let maxDepth=0;const marks={25:0,50:0,75:0,100:0};const t0=Date.now();
function depth(auto){const d=document.documentElement;const total=d.scrollHeight-d.clientHeight;const pct=total<=0?100:Math.min(100,Math.round((d.scrollTop/total)*100));if(pct>maxDepth)maxDepth=pct;[25,50,75,100].forEach(m=>{if(!marks[m]&&pct>=m){marks[m]=1;send('scroll',{depth:m,auto:auto===true?1:0})}})}
window.addEventListener('scroll',()=>depth(false),{passive:true});setTimeout(()=>depth(true),1500);
/* sinal de pessoa (Batch 1): primeiro toque, clique, tecla ou roda do mouse nesta página. Carregamento, rolagem automática e movimento do cursor não contam (o navegador gera mousemove sozinho). */
let interacted=false;const onInput=e=>{if(interacted||!e.isTrusted)return;interacted=true;send('interact',{type:e.type});['pointerdown','keydown','touchstart','wheel'].forEach(t=>window.removeEventListener(t,onInput,true))};
['pointerdown','keydown','touchstart','wheel'].forEach(t=>window.addEventListener(t,onInput,{capture:true,passive:true}));
let left=false;function leave(){if(left)return;left=true;send('leave',{depth:maxDepth,secs:Math.round((Date.now()-t0)/1000)})}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')leave()});window.addEventListener('pagehide',leave);
/* cliques externos (checkout/Payt) marcados com data-track nas páginas; aqui só o genérico para links externos */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="http"]');if(!a||a.dataset.track)return;try{if(new URL(a.href).host!==location.host)send('outbound',{href:a.href.slice(0,200)})}catch(x){}},true);
})();
