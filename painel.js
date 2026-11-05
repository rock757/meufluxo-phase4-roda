/* MeuFluxo · Fase 4 — painel.js: funil de visitantes → roda → carta → oferta → checkout.
   Fonte real: GET /api/stats (planilha "eventos"). Sem planilha configurada, mostra DEMO (marcado). O rastro desta janela vem do localStorage (track.js). */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>new Intl.NumberFormat('pt-BR').format(Math.round(v||0));
const pct=(a,b)=>b?Math.round(a/b*100)+'%':'—';
const DEMO={configured:false,demo:true,visitors:980,sessions:1130,rows:9870,
 pages:{index:1240,carta:372,obrigado:58},
 sources:{instagram:520,email:390,whatsapp:210,'(direto)':120},
 events:{page_view:1670,quiz_start:610,answer:4100,quiz_done:455,priority_pick:430,cta_letter:390,letter_view:372,offer_view:298,checkout_click:61,faq_open:140,proof_open:77,scroll:900},
 unique:{page_view:980,quiz_start:590,quiz_done:440,priority_pick:418,cta_letter:380,letter_view:362,offer_view:290,checkout_click:58},
 depth:{'carta:25':372,'carta:50':300,'carta:75':210,'carta:100':120,'index:25':900,'index:50':700,'index:75':520,'index:100':300},
 days:{'2026-11-10':120,'2026-11-11':210,'2026-11-12':260,'2026-11-13':300,'2026-11-14':350,'2026-11-15':430}};
const FUNNEL={pt:[['page_view','Chegaram ao site'],['quiz_start','Começaram a Roda'],['quiz_done','Terminaram a Roda'],['priority_pick','Escolheram a área'],['cta_letter','Clicaram para a carta'],['letter_view','Abriram a carta'],['offer_view','Chegaram à oferta'],['checkout_click','Clicaram para o checkout']],
 en:[['page_view','Landed on the site'],['quiz_start','Started the Wheel'],['quiz_done','Finished the Wheel'],['priority_pick','Picked an area'],['cta_letter','Clicked to the letter'],['letter_view','Opened the letter'],['offer_view','Reached the offer'],['checkout_click','Clicked to checkout']]};
const T={pt:{demo:'SIMULAÇÃO · números fictícios, só para ver o formato',live:'REAL · planilha',locked:'BLOQUEADO · dados reais exigem a chave do painel (?k=)',mineTag:'REAL · este navegador, só você',visitors:'Visitantes únicos',views:'Visitas (páginas)',sessions:'Sessões',rows:'eventos registrados',funnel:'Funil',uniq:'únicos',ofPrev:'da etapa anterior',clicks:'Onde clicam',depth:'Até onde chegam na carta',sources:'De onde vêm',mine:'O seu rastro nesta janela (ao vivo)',none:'Nenhum evento ainda · navegue pelo site com este navegador',days:'Visitas por dia',
  EV:{page_view:'visita',quiz_start:'começou a roda',answer:'resposta',quiz_done:'terminou a roda',priority_pick:'escolheu área',cta_letter:'→ carta',letter_view:'abriu a carta',offer_view:'viu a oferta',checkout_click:'→ checkout',cta_offer_top:'botão topo',cta_offer_hero:'botão abertura',cta_offer_letter:'botão carta',cta_offer_sticky:'botão fixo',faq_open:'abriu dúvida',proof_open:'ampliou prova',scroll:'rolagem',leave:'saiu',outbound:'link externo',downsell_click:'→ opção avulsa'}},
 en:{demo:'SIMULATION · fictitious numbers, format only',live:'REAL · sheet',locked:'LOCKED · real data needs the dashboard key (?k=)',mineTag:'REAL · this browser, only you',visitors:'Unique visitors',views:'Visits (pages)',sessions:'Sessions',rows:'events recorded',funnel:'Funnel',uniq:'unique',ofPrev:'of previous step',clicks:'Where they click',depth:'How far they get in the letter',sources:'Where they come from',mine:'Your own trail in this window (live)',none:'No events yet · browse the site in this browser',days:'Visits per day',
  EV:{page_view:'visit',quiz_start:'started wheel',answer:'answer',quiz_done:'finished wheel',priority_pick:'picked area',cta_letter:'→ letter',letter_view:'opened letter',offer_view:'saw offer',offer_view2:'saw offer',checkout_click:'→ checkout',cta_offer_top:'top button',cta_offer_hero:'hero button',cta_offer_letter:'letter button',cta_offer_sticky:'sticky button',faq_open:'opened faq',proof_open:'enlarged proof',scroll:'scroll',leave:'left',outbound:'outbound link',downsell_click:'→ single option'}}};
function localEvents(){try{return JSON.parse(localStorage.getItem('mf_events')||'[]')}catch(e){return[]}}
function key(){const q=new URLSearchParams(location.search).get('k');if(q){try{sessionStorage.setItem('mf_painel_k',q)}catch(e){}return q}try{return sessionStorage.getItem('mf_painel_k')||''}catch(e){return ''}}
async function load(){try{const r=await fetch('/api/stats'+(key()?'?k='+encodeURIComponent(key()):''),{cache:'no-store'});const j=await r.json();if(j&&j.configured&&!j.error&&!j.locked)return j;if(j&&j.locked)return Object.assign({},DEMO,{locked:true,reason:j.reason})}catch(e){}return DEMO}
function bars(obj,top,color){const en=Object.entries(obj||{}).sort((a,b)=>b[1]-a[1]).slice(0,top||6);const max=en[0]?en[0][1]:1;return en.map(([k,v])=>`<div class="pb"><span class="pk">${esc(k)}</span><span class="pbar"><i style="width:${Math.max(2,v/max*100)}%;background:${color||'var(--purple)'}"></i></span><b>${num(v)}</b></div>`).join('')}
function render(el,d,L){L=L||'pt';el.classList.toggle('pn-demo',!!d.demo);const s=T[L];const F=FUNNEL[L];const ev=d.events||{},u=d.unique||{};
 const views=Object.values(d.pages||{}).reduce((a,b)=>a+b,0)||ev.page_view||0;
 let prev=null;const funnel=F.map(([k,label])=>{const v=u[k]!=null?u[k]:(ev[k]||0);const max=u.page_view||ev.page_view||1;const row=`<div class="fr"><div class="fl"><b>${esc(label)}</b><small>${esc(k)}</small></div><div class="fb"><i style="width:${Math.max(1.5,v/max*100)}%"></i></div><div class="fv"><b>${num(v)}</b><small>${prev==null?'100%':pct(v,prev)} ${prev==null?'':esc(s.ofPrev)}</small></div></div>`;prev=v;return row}).join('');
 const clicks={};Object.entries(ev).forEach(([k,v])=>{if(/^cta_|_click$|faq_open|proof_open|cta_letter/.test(k))clicks[(s.EV[k]||k)]=v});
 const depth={};[25,50,75,100].forEach(p=>{depth[p+'%']=(d.depth||{})['carta:'+p]||0});
 const mine=localEvents();const mineCounts={};mine.forEach(e=>{mineCounts[s.EV[e.ev]||e.ev]=(mineCounts[s.EV[e.ev]||e.ev]||0)+1});
 const days=Object.entries(d.days||{}).sort().slice(-14);const dmax=Math.max(1,...days.map(x=>x[1]));
 el.innerHTML=`<div class="pn-head"><span class="pn-tag ${d.demo?'demo':'live'}">${esc(d.locked?s.locked:d.demo?s.demo:s.live)}</span><span class="pn-sub">${num(d.rows||0)} ${esc(s.rows)}</span></div>
 <div class="pn-kpis"><div><div class="v">${num(d.visitors)}</div><div class="l">${esc(s.visitors)}</div></div><div><div class="v">${num(views)}</div><div class="l">${esc(s.views)}</div></div><div><div class="v">${num(d.sessions)}</div><div class="l">${esc(s.sessions)}</div></div><div><div class="v">${num(u.checkout_click!=null?u.checkout_click:ev.checkout_click)}</div><div class="l">${esc(F[7][1])}</div></div></div>
 <div class="pn-grid"><div class="pn-card wide"><div class="pn-lbl">${esc(s.funnel)} · ${esc(s.uniq)}</div>${funnel}</div>
 <div class="pn-card"><div class="pn-lbl">${esc(s.clicks)}</div>${bars(clicks,7)}</div>
 <div class="pn-card"><div class="pn-lbl">${esc(s.depth)}</div>${bars(depth,4,'var(--gold)')}</div>
 <div class="pn-card"><div class="pn-lbl">${esc(s.sources)}</div>${bars(d.sources,6,'var(--green)')}</div>
 <div class="pn-card"><div class="pn-lbl">${esc(s.days)}</div><div class="pn-days">${days.map(([k,v])=>`<div title="${esc(k)} · ${num(v)}"><i style="height:${Math.max(3,v/dmax*100)}%"></i><span>${esc(k.slice(8))}</span></div>`).join('')||'<small>—</small>'}</div></div>
 <div class="pn-card wide mine"><div class="pn-lbl">${esc(s.mine)} <span class="pn-tag live" style="margin-left:8px">${esc(s.mineTag)}</span></div>${mine.length?bars(mineCounts,8,'var(--purple-2)'):`<small>${esc(s.none)}</small>`}</div></div>`}
const CSS=`.pn-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:12px;color:var(--muted)}
.pn-tag{font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;border-radius:99px;padding:4px 10px}.pn-tag.demo{background:#fff3cd;color:#7a5a00}.pn-tag.live{background:#dff5e8;color:#1f5f43}
.pn-demo .pn-kpis,.pn-demo .pn-card:not(.mine){opacity:.72;background-image:repeating-linear-gradient(135deg,transparent 0 18px,rgba(122,90,0,.05) 18px 20px)}
.pn-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px}.pn-kpis>div{background:var(--deep,#2d2047);color:#fff;border-radius:12px;padding:10px 12px}.pn-kpis .v{font-size:22px;font-weight:800;letter-spacing:-.02em;line-height:1}.pn-kpis .l{font-size:10.5px;letter-spacing:.5px;text-transform:uppercase;color:#cdbff0;margin-top:5px}
.pn-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pn-card{background:var(--paper,#fff);border:1px solid var(--line,#e6e0d6);border-radius:12px;padding:12px 14px}.pn-card.wide{grid-column:1/-1}
.pn-lbl{font-size:10.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted,#7b748c);margin-bottom:8px}
.fr{display:grid;grid-template-columns:150px 1fr 150px;gap:10px;align-items:center;padding:2px 0}.fl b{display:block;font-size:12.5px;line-height:1.15}.fl small{color:var(--muted);font-size:10px}
.fb{height:10px;background:var(--lilac,#ebe4f8);border-radius:4px;overflow:hidden}.fb i{display:block;height:100%;background:linear-gradient(90deg,var(--purple,#5a3fb4),var(--purple-2,#8a6fd3))}
.fv{text-align:right;white-space:nowrap}.fv b{font-size:13px}.fv small{font-size:10px;color:var(--muted);margin-left:5px}
.pb{display:grid;grid-template-columns:110px 1fr 46px;gap:8px;align-items:center;padding:3px 0;font-size:12px}.pk{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pbar{height:9px;background:var(--lilac,#ebe4f8);border-radius:4px;overflow:hidden}.pbar i{display:block;height:100%}.pb b{text-align:right;font-size:12px}
.pn-days{display:flex;gap:4px;align-items:flex-end;height:70px}.pn-days div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}.pn-days i{display:block;width:100%;background:var(--purple-2,#8a6fd3);border-radius:3px 3px 0 0}.pn-days span{font-size:9px;color:var(--muted);margin-top:3px}
@media(max-width:900px){.pn-kpis{grid-template-columns:1fr 1fr}.pn-grid{grid-template-columns:1fr}.fr{grid-template-columns:110px 1fr 110px}}`;
if(!document.getElementById('pn-css')){const st=document.createElement('style');st.id='pn-css';st.textContent=CSS;document.head.appendChild(st)}
window.MF_PAINEL={load,render,DEMO,localEvents};
})();
