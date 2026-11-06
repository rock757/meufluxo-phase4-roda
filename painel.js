/* MeuFluxo · Fase 4 — painel.js (Batch 1, 2026-11-06)
   Padrão: COORTE ELEGÍVEL (visitou e interagiu, sem evidência de teste, equipe ou robô). Desconhecidos e excluídos aparecem ao lado da taxa.
   O BRUTO (tudo, inclusive testes, equipe e robôs) fica num botão à parte, rotulado. Fonte: GET /api/stats (Neon). Sem chave: SIMULAÇÃO. */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>new Intl.NumberFormat('pt-BR').format(Math.round(v||0));
const pc=r=>r==null?'—':(r*100).toLocaleString('pt-BR',{maximumFractionDigits:r<0.01?2:1})+'%';
const brl=v=>'R$'+num(v);
/* SIMULAÇÃO: números fictícios, só para mostrar o formato. Nunca misturar com resultado. */
const DEMO={configured:false,demo:true,rule_version:'v1-2026-11-06',window:{from:'2026-11-11',to:'2026-11-15',tz:'America/Sao_Paulo'},clean_start:'2026-11-11 09:00',historical_rows_total:0,
 cohorts:{eligible:640,unknown:210,bot:180,internal:9,test:42,historical:0,no_pageview:4},excluded:231,
 reasons:[{cohort:'bot',reason:'robô: ua:headless',n:120},{cohort:'bot',reason:'robô: ua:facebookexternalhit',n:60},{cohort:'test',reason:'teste: dani',n:30},{cohort:'test',reason:'teste: utm_source=teste',n:12},{cohort:'internal',reason:'equipe: browser:painel',n:9}],
 funnel:{steps:[640,470,390,300,240,70,32],direct_letter:55},
 sales:{verified:38,refunded:2,duplicates_ignored:3,by_attribution:{eligible:32,unknown:3,unmatched:2,excluded:1},buyers_eligible:32,buyers_unknown:3,gross:39886,net:37886,sources:{payt:40,fixture:0,total:40}},
 conversion:{definition:'identidades compradoras ÷ identidades elegíveis (mesmo período, dias BRT)',eligible:{num:32,den:640,rate:0.05},if_unknown_are_people:{num:35,den:850,rate:0.0412},raw:{num:38,den:1081,rate:0.0352},reliable:true,flags:[]},
 raw:{rows:9800,identities:1085,pv_identities:1081,sessions:1300,page_views:2100},
 sources:[{s:'email',n:300},{s:'whatsapp',n:190},{s:'instagram',n:110},{s:'(direto)',n:40}],
 days:[['2026-11-11',120,190],['2026-11-12',140,230],['2026-11-13',130,220],['2026-11-14',150,240],['2026-11-15',100,200]].flatMap(([d,e,r])=>[{d,cohort:'eligible',n:e},{d,cohort:'bot',n:r-e}]),
 depth:{'25':520,'50':400,'75':300,'100':210}};
const CL={pt:{eligible:'Elegíveis',unknown:'Desconhecidos',bot:'Robôs',internal:'Equipe',test:'Testes',historical:'Histórico (antes da medição limpa)',no_pageview:'Sem visita no período'},
 en:{eligible:'Eligible',unknown:'Unknown',bot:'Bots',internal:'Staff',test:'Tests',historical:'Historical (before clean measurement)',no_pageview:'No visit in window'}};
const COL={eligible:'var(--green)',unknown:'var(--gold)',bot:'#b4485e',internal:'var(--purple-2)',test:'var(--purple)',historical:'var(--muted)',no_pageview:'var(--line)'};
const FLAG={pt:{no_clean_data:'ainda não há dados com a medição nova',payt_not_connected:'vendas: Payt ainda não conectado',sales_are_fixture:'vendas de TESTE (fixture), não reais',small_sample:'amostra pequena (menos de 30 elegíveis)',unknown_high:'mais desconhecidos que elegíveis',historical_in_window:'período inclui histórico sem classificação'},
 en:{no_clean_data:'no data with the new measurement yet',payt_not_connected:'sales: Payt not connected yet',sales_are_fixture:'TEST (fixture) sales, not real',small_sample:'small sample (under 30 eligible)',unknown_high:'more unknown than eligible',historical_in_window:'window includes unclassified history'}};
const T={pt:{sim:'SIMULAÇÃO · números fictícios, só para ver o formato',live:'REAL · banco de dados',locked:'BLOQUEADO · dados reais exigem a chave do painel (?k=)',mig:'MIGRAÇÃO PENDENTE · o código novo está publicado, o banco ainda não',
  cohort:'Público elegível',raw:'Bruto (tudo)',from:'de',to:'até',clean:'Medição limpa desde',noclean:'Medição limpa: ainda sem dados',hist:'linhas históricas guardadas sem classificação',
  rate:'Taxa de conversão',rateNo:'Taxa ainda não confiável',rateDef:'identidades compradoras ÷ identidades elegíveis',calc:'cálculo atual',ifUnknown:'Se todos os desconhecidos forem pessoas',rawRate:'Taxa bruta (inclui testes, equipe e robôs)',rawDef:'pedidos verificados ÷ todas as identidades com visita',
  kEl:'Visitantes elegíveis',kUn:'Desconhecidos',kEx:'Excluídos',kExS:'testes · equipe · robôs',kSa:'Vendas verificadas',kSaS:'Payt, um por pedido',kRows:'Eventos brutos',kIds:'Identidades brutas',kSes:'Sessões',kPv:'Visitas (páginas)',
  classes:'Quem é quem no período',why:'Por quê',sales:'Vendas no período',sEl:'de elegíveis',sUn:'de desconhecidos',sEx:'de testes/equipe/robôs',sUm:'sem visita ligada (não atribuídas)',sNv:'de quem não visitou no período',sRf:'reembolsadas (fora das verificadas)',sDu:'avisos duplicados ignorados',gross:'bruto',net:'líquido',
  funnel:'Funil sequencial · só elegíveis',fSteps:['Chegaram','Começaram a Roda','Terminaram a Roda','Abriram a carta','Viram a oferta','Clicaram no checkout','Compraram (Payt)'],direct:'entraram direto na carta (fora do funil)',
  srcs:'De onde vêm · elegíveis',days:'Visitas por dia (BRT)',dEl:'elegíveis',dAll:'todas',depth:'Até onde leem a carta · elegíveis',mine:'O seu rastro nesta janela',mineTag:'REAL · este navegador, só você',none:'Nenhum evento ainda neste navegador',
  obs:'Identidade = navegador, não pessoa. Venda só conta com confirmação do Payt. Regras',ofPrev:'da etapa anterior'},
 en:{sim:'SIMULATION · fictitious numbers, format only',live:'REAL · database',locked:'LOCKED · real data needs the dashboard key (?k=)',mig:'MIGRATION PENDING · new code is live, database not yet',
  cohort:'Eligible audience',raw:'Raw (everything)',from:'from',to:'to',clean:'Clean measurement since',noclean:'Clean measurement: no data yet',hist:'historical rows kept, unclassified',
  rate:'Conversion rate',rateNo:'Rate not reliable yet',rateDef:'purchasing identities ÷ eligible identities',calc:'current calculation',ifUnknown:'If every unknown is a person',rawRate:'Raw rate (includes tests, staff and bots)',rawDef:'verified orders ÷ all identities with a visit',
  kEl:'Eligible visitors',kUn:'Unknown',kEx:'Excluded',kExS:'tests · staff · bots',kSa:'Verified sales',kSaS:'Payt, one per order',kRows:'Raw events',kIds:'Raw identities',kSes:'Sessions',kPv:'Visits (pages)',
  classes:'Who is who in the window',why:'Why',sales:'Sales in the window',sEl:'from eligible',sUn:'from unknown',sEx:'from tests/staff/bots',sUm:'no linked visit (unattributed)',sNv:'from identities with no visit in window',sRf:'refunded (not in verified)',sDu:'duplicate notices ignored',gross:'gross',net:'net',
  funnel:'Sequential funnel · eligible only',fSteps:['Arrived','Started the Wheel','Finished the Wheel','Opened the letter','Saw the offer','Clicked checkout','Bought (Payt)'],direct:'went straight to the letter (outside the funnel)',
  srcs:'Where they come from · eligible',days:'Visits per day (BRT)',dEl:'eligible',dAll:'all',depth:'How far they read the letter · eligible',mine:'Your own trail in this window',mineTag:'REAL · this browser, only you',none:'No events in this browser yet',
  obs:'Identity = browser, not person. A sale counts only with Payt confirmation. Rules',ofPrev:'of previous step'}};
function localEvents(){try{return JSON.parse(localStorage.getItem('mf_events')||'[]')}catch(e){return[]}}
function key(){const q=new URLSearchParams(location.search).get('k');if(q){try{sessionStorage.setItem('mf_painel_k',q)}catch(e){}return q}try{return sessionStorage.getItem('mf_painel_k')||''}catch(e){return ''}}
async function load(from,to){const p=new URLSearchParams();if(key())p.set('k',key());if(from)p.set('from',from);if(to)p.set('to',to);
 try{const r=await fetch('/api/stats'+(p.toString()?'?'+p:''),{cache:'no-store'});const j=await r.json();
  if(j&&j.configured&&j.needs_migration)return Object.assign({},DEMO,{demo:true,needs_migration:true});
  if(j&&j.configured&&!j.error&&!j.locked&&j.cohorts)return j;
  if(j&&j.locked)return Object.assign({},DEMO,{locked:true,reason:j.reason})}catch(e){}return DEMO}
function bars(rows,color){const max=Math.max(1,...rows.map(r=>r[1]));return rows.map(([k,v,c])=>`<div class="pb"><span class="pk" title="${esc(k)}">${esc(k)}</span><span class="pbar"><i style="width:${Math.max(2,v/max*100)}%;background:${c||color||'var(--purple)'}"></i></span><b>${num(v)}</b></div>`).join('')}
let VIEW='cohort';
function render(el,d,L){L=L||'pt';const s=T[L];const cl=CL[L];el.classList.toggle('pn-demo',!!d.demo);const C=d.cohorts,cv=d.conversion,sa=d.sales;
 const tag=d.needs_migration?['demo',s.mig]:d.locked?['demo',s.locked]:d.demo?['demo',s.sim]:['live',s.live];
 const raw=VIEW==='raw';
 const flags=(cv.flags||[]).map(f=>`<span class="pn-flag">${esc((FLAG[L]||{})[f]||f)}</span>`).join('');
 const rateBox=raw?`<div class="pn-rate raw"><div class="pn-lbl">${esc(s.rawRate)}</div><div class="big">${pc(cv.raw.rate)}</div><div class="def">${esc(s.rawDef)} · ${num(cv.raw.num)} ÷ ${num(cv.raw.den)}</div></div>`
  :`<div class="pn-rate"><div class="pn-lbl">${esc(cv.reliable?s.rate:s.rateNo)}</div><div class="big ${cv.reliable?'':'dim'}">${pc(cv.eligible.rate)}</div><div class="def">${cv.reliable?'':esc(s.calc)+': '}${esc(s.rateDef)} · ${num(cv.eligible.num)} ÷ ${num(cv.eligible.den)}</div>
   <div class="alt">${esc(s.ifUnknown)}: <b>${pc(cv.if_unknown_are_people.rate)}</b> (${num(cv.if_unknown_are_people.num)} ÷ ${num(cv.if_unknown_are_people.den)}) · ${esc(s.rawRate)}: <b>${pc(cv.raw.rate)}</b></div>${flags?`<div class="flags">${flags}</div>`:''}</div>`;
 const kpis=raw?[[s.kRows,d.raw.rows],[s.kIds,d.raw.pv_identities],[s.kSes,d.raw.sessions],[s.kPv,d.raw.page_views]].map(([l,v])=>`<div><div class="v">${num(v)}</div><div class="l">${esc(l)}</div></div>`).join('')
  :[[s.kEl,C.eligible,'','eligible'],[s.kUn,C.unknown,'','unknown'],[s.kEx,d.excluded,s.kExS,'bot'],[s.kSa,sa.verified,s.kSaS,'sale']].map(([l,v,sub,k])=>`<div class="k-${k}"><div class="v">${num(v)}</div><div class="l">${esc(l)}${sub?`<small>${esc(sub)}</small>`:''}</div></div>`).join('');
 const classRows=['eligible','unknown','test','internal','bot','historical','no_pageview'].filter(k=>C[k]>0||k==='eligible'||k==='unknown').map(k=>[cl[k],C[k],COL[k]]);
 const reasons=(d.reasons||[]).slice(0,8).map(r=>`<li><span class="dot" style="background:${COL[r.cohort]}"></span>${esc(r.reason)} <b>${num(r.n)}</b></li>`).join('');
 const by=sa.by_attribution||{};const saleRows=[[s.sEl,by.eligible||0,COL.eligible],[s.sUn,by.unknown||0,COL.unknown],[s.sEx,by.excluded||0,COL.bot],[s.sUm,by.unmatched||0,'var(--ink-2)'],[s.sNv,by.no_visit_in_window||0,'var(--muted)']].filter((r,i)=>i<4||r[1]>0);
 const st=d.funnel.steps;const fun=s.fSteps.map((lab,i)=>{const v=st[i]||0,prev=i?st[i-1]:null;return `<div class="fr"><div class="fl"><b>${esc(lab)}</b></div><div class="fb"><i style="width:${Math.max(1.5,v/Math.max(1,st[0])*100)}%"></i></div><div class="fv"><b>${num(v)}</b><small>${prev==null?'':pc(prev?v/prev:null)+' '+esc(s.ofPrev)}</small></div></div>`}).join('');
 const dmap={};(d.days||[]).forEach(r=>{dmap[r.d]=dmap[r.d]||{e:0,a:0};dmap[r.d].a+=r.n;if(r.cohort==='eligible')dmap[r.d].e+=r.n});const dk=Object.keys(dmap).sort().slice(-14);const dmax=Math.max(1,...dk.map(k=>dmap[k].a));
 const daysHtml=dk.map(k=>`<div title="${esc(k)} · ${num(dmap[k].e)} ${esc(s.dEl)} / ${num(dmap[k].a)} ${esc(s.dAll)}"><span class="stack"><i class="a" style="height:${Math.max(3,dmap[k].a/dmax*100)}%"></i><i class="e" style="height:${Math.max(dmap[k].e?3:0,dmap[k].e/dmax*100)}%"></i></span><span>${esc(k.slice(8))}</span></div>`).join('')||'<small>—</small>';
 const mine=localEvents();const mc={};mine.forEach(e=>{mc[e.ev]=(mc[e.ev]||0)+1});
 el.innerHTML=`<div class="pn-head"><span class="pn-tag ${tag[0]}">${esc(tag[1])}</span>
  <span class="pn-ctl"><span class="seg"><button data-v="cohort" class="${raw?'':'on'}">${esc(s.cohort)}</button><button data-v="raw" class="${raw?'on':''}">${esc(s.raw)}</button></span>
  <label>${esc(s.from)} <input type="date" id="pn-from" value="${esc(d.window.from)}"></label><label>${esc(s.to)} <input type="date" id="pn-to" value="${esc(d.window.to)}"></label></span></div>
 <div class="pn-sub">${d.clean_start?esc(s.clean)+' '+esc(d.clean_start.split(' ').reverse().join(' · ').replace(/(\d{4})-(\d{2})-(\d{2})/,'$3/$2'))+' BRT':esc(s.noclean)}${d.historical_rows_total?` · ${num(d.historical_rows_total)} ${esc(s.hist)}`:''}</div>
 <div class="pn-top">${rateBox}<div class="pn-kpis">${kpis}</div></div>
 <div class="pn-grid">
  <div class="pn-card"><div class="pn-lbl">${esc(s.classes)}</div>${bars(classRows)}${reasons?`<div class="pn-lbl" style="margin-top:10px">${esc(s.why)}</div><ul class="why">${reasons}</ul>`:''}</div>
  <div class="pn-card"><div class="pn-lbl">${esc(s.sales)}</div>${bars(saleRows)}<div class="pn-mini">${esc(s.sRf)}: <b>${num(sa.refunded)}</b> · ${esc(s.sDu)}: <b>${num(sa.duplicates_ignored)}</b><br>${esc(s.gross)} <b>${brl(sa.gross)}</b> · ${esc(s.net)} <b>${brl(sa.net)}</b></div></div>
  <div class="pn-card wide"><div class="pn-lbl">${esc(s.funnel)}</div>${fun}<div class="pn-mini">${num(d.funnel.direct_letter)} ${esc(s.direct)}</div></div>
  <div class="pn-card"><div class="pn-lbl">${esc(s.srcs)}</div>${bars((d.sources||[]).map(r=>[r.s,r.n]),'var(--green)')||'<small>—</small>'}</div>
  <div class="pn-card"><div class="pn-lbl">${esc(s.days)} <span class="lg"><i class="e"></i>${esc(s.dEl)} <i class="a"></i>${esc(s.dAll)}</span></div><div class="pn-days">${daysHtml}</div></div>
  <div class="pn-card"><div class="pn-lbl">${esc(s.depth)}</div>${bars(['25','50','75','100'].map(k=>[k+'%',(d.depth||{})[k]||0]),'var(--gold)')}</div>
  <div class="pn-card mine"><div class="pn-lbl">${esc(s.mine)} <span class="pn-tag live" style="margin-left:6px">${esc(s.mineTag)}</span></div>${mine.length?bars(Object.entries(mc).sort((a,b)=>b[1]-a[1]).slice(0,8),'var(--purple-2)'):`<small>${esc(s.none)}</small>`}</div>
 </div>
 <div class="pn-obs">${esc(s.obs)} ${esc(d.rule_version||'')}.</div>`;
 el.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{VIEW=b.dataset.v;render(el,d,L)});
 const re=async()=>{const f=el.querySelector('#pn-from').value,t=el.querySelector('#pn-to').value;if(d.demo)return;const n=await load(f,t);render(el,n,L)};
 el.querySelector('#pn-from').onchange=re;el.querySelector('#pn-to').onchange=re}
const CSS=`.pn-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;font-size:12px;color:var(--muted)}
.pn-tag{font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;border-radius:99px;padding:4px 10px}.pn-tag.demo{background:#fff3cd;color:#7a5a00}.pn-tag.live{background:#dff5e8;color:#1f5f43}
.pn-ctl{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.pn-ctl input{font:inherit;font-size:12px;border:1px solid var(--line);border-radius:8px;padding:3px 6px;background:var(--paper)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:99px;overflow:hidden}.seg button{font:inherit;font-size:12px;font-weight:600;border:0;background:var(--paper);padding:5px 12px;cursor:pointer;color:var(--ink-2)}.seg button.on{background:var(--deep,#2d2047);color:#fff}
.pn-sub{font-size:12px;color:var(--muted);margin:0 0 10px}
.pn-top{display:grid;grid-template-columns:1.1fr 1fr;gap:10px;margin-bottom:10px}
.pn-rate{background:var(--deep,#2d2047);color:#fff;border-radius:14px;padding:14px 16px}.pn-rate .pn-lbl{color:#cdbff0}.pn-rate .big{font-size:44px;font-weight:800;letter-spacing:-.03em;line-height:1}.pn-rate .big.dim{opacity:.55}
.pn-rate .def{font-size:12px;color:#d9d1f0;margin-top:6px}.pn-rate .alt{font-size:12px;color:#d9d1f0;margin-top:8px;border-top:1px solid rgba(255,255,255,.15);padding-top:8px}.pn-rate.raw{background:#5b5468}
.flags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.pn-flag{font-size:11px;background:rgba(255,243,205,.15);color:#ffe7a3;border:1px solid rgba(255,231,163,.35);border-radius:99px;padding:2px 8px}
.pn-kpis{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pn-kpis>div{background:var(--paper,#fff);border:1px solid var(--line);border-radius:12px;padding:10px 12px}.pn-kpis .v{font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1}.pn-kpis .l{font-size:10.5px;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-top:5px}.pn-kpis .l small{display:block;text-transform:none;letter-spacing:0;font-size:10.5px}
.pn-kpis .k-eligible .v{color:var(--green)}.pn-kpis .k-unknown .v{color:#9a7a1f}.pn-kpis .k-bot .v{color:#b4485e}
.pn-demo .pn-top,.pn-demo .pn-card:not(.mine){opacity:.72;background-image:repeating-linear-gradient(135deg,transparent 0 18px,rgba(122,90,0,.05) 18px 20px)}
.pn-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pn-card{background:var(--paper,#fff);border:1px solid var(--line,#e6e0d6);border-radius:12px;padding:12px 14px}.pn-card.wide{grid-column:1/-1}
.pn-lbl{font-size:10.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted,#7b748c);margin-bottom:8px}
.fr{display:grid;grid-template-columns:170px 1fr 150px;gap:10px;align-items:center;padding:2px 0}.fl b{display:block;font-size:12.5px;line-height:1.15}
.fb{height:10px;background:var(--lilac,#ebe4f8);border-radius:4px;overflow:hidden}.fb i{display:block;height:100%;background:linear-gradient(90deg,var(--green,#2f7d5b),#5aa883)}
.fv{text-align:right;white-space:nowrap}.fv b{font-size:13px}.fv small{font-size:10px;color:var(--muted);margin-left:5px}
.pb{display:grid;grid-template-columns:150px 1fr 46px;gap:8px;align-items:center;padding:3px 0;font-size:12px}.pk{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pbar{height:9px;background:var(--lilac,#ebe4f8);border-radius:4px;overflow:hidden}.pbar i{display:block;height:100%}.pb b{text-align:right;font-size:12px}
.why{list-style:none;margin:0;padding:0;font-size:12px;color:var(--ink-2)}.why li{padding:2px 0}.why .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}.why b{float:right}
.pn-mini{font-size:12px;color:var(--ink-2);margin-top:8px;line-height:1.5}
.pn-days{display:flex;gap:4px;align-items:flex-end;height:76px}.pn-days>div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}.pn-days .stack{position:relative;width:100%;height:100%;display:block}.pn-days .stack i{position:absolute;bottom:0;left:0;right:0;border-radius:3px 3px 0 0}.pn-days i.a{background:var(--lilac,#ebe4f8)}.pn-days i.e{background:var(--green,#2f7d5b)}.pn-days span:last-child{font-size:9px;color:var(--muted);margin-top:3px}
.lg{font-weight:400;letter-spacing:0;text-transform:none;margin-left:8px}.lg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin:0 3px 0 6px;vertical-align:-1px}.lg i.e{background:var(--green)}.lg i.a{background:var(--lilac)}
.pn-obs{font-size:11.5px;color:var(--muted);margin-top:10px}
@media(max-width:900px){.pn-top,.pn-grid{grid-template-columns:1fr}.fr{grid-template-columns:110px 1fr 110px}.pb{grid-template-columns:110px 1fr 40px}}`;
if(!document.getElementById('pn-css')){const st=document.createElement('style');st.id='pn-css';st.textContent=CSS;document.head.appendChild(st)}
window.MF_PAINEL={load,render,DEMO,localEvents};
})();
