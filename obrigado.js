/* MeuFluxo · Fase 4 — página pós-compra (obrigado.html). Sem dependência de carta.js. */
(function(){
'use strict';
const MF=window.MF_CONFIG||{};const A=((MF.oferta||{}).A)||{};const P=MF.programas||[];const TR=window.MF_TRILHA;
const q=new URLSearchParams(location.search);const L=q.get('lang')==='en'?'en':'pt';
const REV=!!MF.revisao||q.get('revisao')==='1';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let prio=P.findIndex(p=>p.slug===q.get('prioridade'));if(prio<0)prio=null;
const T={pt:{eb:'OBRIGADO',h1:'Bem-vindo à sua jornada.',lead:'Obrigado pela sua compra. Quando o pagamento for aprovado, siga as instruções de acesso informadas na página de pagamento.',
  entrega:'Acesso: ',suporte:'Qualquer dúvida: ',seqH:'A sua sequência sugerida',seqP:'Baseada na área que você escolheu na Roda da Vida. Comece por onde quiser.',seqP0:'Uma sequência para começar. Você pode seguir a ordem que preferir.',
  save:'Guarde esta página ou tire um print.',sig:'Até já,',team:'Equipe MeuFluxo',rev:'Revisão: o destino de sucesso do Payt ainda não foi confirmado. Esta página só recebe a área escolhida se o Payt repassar ?prioridade=. Prazo de entrega e suporte aparecem quando preenchidos em config.js.',foot:'Versão privada para revisão.'},
 en:{eb:'THANK YOU',h1:'Welcome to your journey.',lead:'Thank you for your purchase. Once the payment is approved, follow the access instructions given on the payment page.',
  entrega:'Access: ',suporte:'Any questions: ',seqH:'Your suggested sequence',seqP:'Based on the area you chose in the Wheel of Life. Start wherever you like.',seqP0:'A sequence to get started. Follow whichever order you prefer.',
  save:'Save this page or take a screenshot.',sig:'See you soon,',team:'The MeuFluxo team',rev:'Review: the Payt success destination is not confirmed yet. This page only gets the chosen area if Payt passes ?prioridade=. Delivery time and support appear once filled in config.js.',foot:'Private review version.'}}[L];
const order=TR&&TR.order?TR.order(null,prio):P.map((_,i)=>i);
const steps=order.map((i,k)=>{const p=(TR&&TR.resolve?TR.resolve(i,{}):P[i])||{};return p.programa?`<li><b>${k+1}. ${esc(p.programa)}</b>${p.especialista?' · '+esc(p.especialista):''}${p.area?` <span class="muted">(${esc(p.area)})</span>`:''}</li>`:''}).join('');
document.getElementById('app').innerHTML=`${REV?`<div class="review">${esc(T.rev)}</div>`:''}<span class="eyebrow">${esc(T.eb)}</span><h1>${esc(T.h1)}</h1><p class="lead">${esc(T.lead)}</p>
${A.entrega?`<p>${esc(T.entrega)}${esc(A.entrega)}</p>`:''}
${steps?`<h2>${esc(T.seqH)}</h2><p class="muted">${esc(prio!==null?T.seqP:T.seqP0)}</p><ol class="seq" style="padding-left:0;list-style:none">${steps}</ol>`:''}
<p>${esc(T.save)}</p>${A.suporte?`<p>${esc(T.suporte)}${esc(A.suporte)}</p>`:''}<p>${esc(T.sig)}<br>${esc(T.team)}</p>`;
if(REV){document.getElementById('tag').hidden=false;document.getElementById('foot').textContent=T.foot}
try{window.MF_TRACK&&window.MF_TRACK('thankyou_view',{prioridade:prio!==null?P[prio].slug:''})}catch(e){}
})();
