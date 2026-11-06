/* MeuFluxo · Fase 4 — central.js: liga o rastreador CENTRAL (t.js do tracking-meufluxo) nas páginas de cliente.
   Regras: 1 produtor por evento de pixel (o central); nada carrega se MF_CONFIG.central.ativo=false, se a página é privada
   (painel/overview/decidir) ou se este navegador está marcado como equipe (mf_internal). Nunca envia respostas da roda. */
(function(){
'use strict';
const C=(window.MF_CONFIG||{}).central||{};
const page=(location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';
const PRIVATE=['painel','overview','decidir'];
let internal='';try{internal=localStorage.getItem('mf_internal')||''}catch(e){}
/* Privacidade: prioridade/ordem/g/r (vêm da Roda = autoavaliação) saem da URL AQUI, no <head>, antes de qualquer rastreador existir.
   Ficam em sessionStorage 'mf_carta'; carta.js e obrigado lêem de lá. utm_* e mf_test continuam na URL. */
(function scrub(){try{const u=new URL(location.href),q=u.searchParams,PRIV=['prioridade','ordem','g','r'];let st={};try{st=JSON.parse(sessionStorage.getItem('mf_carta')||'{}')}catch(e){}
 let has=false;PRIV.forEach(k=>{if(q.has(k)){st[k]=q.get(k);has=true}});
 if(has){sessionStorage.setItem('mf_carta',JSON.stringify(st));PRIV.forEach(k=>q.delete(k));history.replaceState(history.state,'',u.pathname+(q.toString()?'?'+q:'')+u.hash)}}catch(e){}})();
const on=!!(C.ativo&&C.script&&C.funil&&PRIVATE.indexOf(page)<0&&!internal);
if(on&&!document.querySelector('script[src$="/t.js"]')){const s=document.createElement('script');s.async=true;s.src=C.script;s.setAttribute('data-funil',C.funil);document.head.appendChild(s)}
const id=()=>{try{return localStorage.getItem('trck_user_id')||''}catch(e){return ''}};
window.MF_CENTRAL={
 on, funil:on?C.funil:'',
 id,
 /* decora um link de checkout com o id central (trck/sck/xcod). Sem t.js ou sem id: devolve a URL intacta (nunca bloqueia a compra). */
 decorate:u=>{try{return (on&&window.trck&&window.trck.decorate)?window.trck.decorate(u):u}catch(e){return u}},
 /* marco do funil (só vai para /api/etapa do central, não para pixels). Rótulos fixos e neutros: nunca respostas nem prioridade. */
 etapa:(k,l)=>{try{if(on&&C.etapas!==false&&window.trck&&window.trck.etapa)window.trck.etapa(k,l)}catch(e){}}
};
})();
