/* MeuFluxo · Fase 4 — teste A/B da carta (carregar ANTES de track.js).
   - MF_CONFIG.splitTeste.ativo=true: cada visitante recebe A ou B (50/50), guardado em cookie mf_carta (1 ano) + localStorage.
   - ?carta=A ou ?carta=B força a versão só nesta visita (revisão), sem gravar; funciona mesmo com o teste desligado.
   - O texto de cada versão fica em cartas/carta-a.html e cartas/carta-b.html. Arquivo vazio = carta atual (fallback).
     Uma linha com o comentário HTML OFERTA (menor-que, exclamação, dois hífens, OFERTA, dois hífens, maior-que) coloca o bloco da oferta naquele ponto do texto.
   - Expõe window.MF_CARTA = {variant, forced}. track.js anexa a versão a todos os eventos; carta.js leva ?carta= ao checkout. */
(function(){
'use strict';
var C=(window.MF_CONFIG||{}).splitTeste||{};
var V=(C.variantes&&C.variantes.length?C.variantes:['A','B']).map(function(v){return String(v).toUpperCase()});
var q=new URLSearchParams(location.search);
var forced=String(q.get('carta')||'').toUpperCase();
window.MF_CARTA=null;
if(V.indexOf(forced)>=0){window.MF_CARTA={variant:forced,forced:true};return}
if(!C.ativo)return;
function getC(n){var m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):''}
function setC(n,v,sec){document.cookie=n+'='+encodeURIComponent(v)+';path=/;max-age='+sec+';SameSite=Lax'+(location.protocol==='https:'?';Secure':'')}
var saved='';try{saved=localStorage.getItem('mf_carta')||''}catch(e){}
if(V.indexOf(saved)<0)saved=getC('mf_carta');
var v=V.indexOf(saved)>=0?saved:null;
if(!v){var r;try{r=crypto.getRandomValues(new Uint32Array(1))[0]/4294967296}catch(e){r=Math.random()}v=V[Math.floor(r*V.length)]}
setC('mf_carta',v,365*86400);try{localStorage.setItem('mf_carta',v)}catch(e){}
window.MF_CARTA={variant:v,forced:false};
})();
