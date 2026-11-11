/* MeuFluxo · Fase 4 — teste A/B da carta (carregar ANTES de track.js).
   - MF_CONFIG.splitTeste.ativo=true: cada visitante recebe A ou B (50/50), guardado em cookie mf_carta (1 ano) + localStorage.
   - ?carta=A ou ?carta=B força a versão só nesta visita (revisão), sem gravar; funciona mesmo com o teste desligado.
   - O texto de cada versão fica em cartas/carta-a.html e cartas/carta-b.html. Arquivo vazio = carta atual (fallback).
     Uma linha com o comentário HTML OFERTA (menor-que, exclamação, dois hífens, OFERTA, dois hífens, maior-que) coloca o bloco da oferta naquele ponto do texto.
   - Expõe window.MF_CARTA = {variant, forced}. track.js anexa a versão a todos os eventos; carta.js leva ?carta= ao checkout. */
(function(){
'use strict';
/* Payt guarda no pedido só src e utm_source/medium/campaign/term/content (help.payt.com.br/article/75); carta=A sozinho não fica na venda.
   MF_CARTA_PAYT(p) devolve os parâmetros do checkout com a versão da carta também em utm_term e src, sem sobrescrever valores que já vieram
   no link (ex.: src de um link do ManyChat). Revisão forçada (?carta=) e sessão de teste (mf_test) ganham sufixo para não contar como venda do teste. */
window.MF_CARTA_PAYT=function(p){p=Object.assign({},p||{});var ab=window.MF_CARTA;if(!ab||!ab.variant)return p;var v=ab.variant;
 var tr=window.MF_TRACK,suf=(ab.forced?'-rev':'')+(tr&&tr.flags&&tr.flags.test?'-teste':'');
 p.carta=v;if(!p.utm_term)p.utm_term='carta-'+v+suf;
 if(!p.src)p.src=(String(p.utm_source||'direto').replace(/[^\w-]/g,'').slice(0,30)||'direto')+'-carta'+v+suf;
 return p};
var C=(window.MF_CONFIG||{}).splitTeste||{};
var V=(C.variantes&&C.variantes.length?C.variantes:['A','B']).map(function(v){return String(v).toUpperCase()});
var q=new URLSearchParams(location.search);
var forced=String(q.get('carta')||'').toUpperCase();
window.MF_CARTA=null;
if(V.indexOf(forced)>=0){window.MF_CARTA={variant:forced,forced:true};window.MF_RENDER_PENDING=true;return}
if(!C.ativo)return;
function getC(n){var m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):''}
function setC(n,v,sec){document.cookie=n+'='+encodeURIComponent(v)+';path=/;max-age='+sec+';SameSite=Lax'+(location.protocol==='https:'?';Secure':'')}
var saved='';try{saved=localStorage.getItem('mf_carta')||''}catch(e){}
if(V.indexOf(saved)<0)saved=getC('mf_carta');
var v=V.indexOf(saved)>=0?saved:null;
if(!v){var r;try{r=crypto.getRandomValues(new Uint32Array(1))[0]/4294967296}catch(e){r=Math.random()}v=V[Math.floor(r*V.length)]}
setC('mf_carta',v,365*86400);try{localStorage.setItem('mf_carta',v)}catch(e){}
window.MF_CARTA={variant:v,forced:false};window.MF_RENDER_PENDING=true; // track.js não mede rolagem até carta.js desenhar a carta
})();
