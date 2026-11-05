/* MeuFluxo · Roda da Vida — experience v4 (quiz · reveal · spiral · specialists). Vanilla JS, no deps. */
(function(){
'use strict';
const MF=window.MF_CONFIG||{}, TR=window.MF_TRILHA;
const track=(ev,p)=>{try{window.MF_TRACK&&window.MF_TRACK(ev,p)}catch(e){}};
const C=MF.campanha||{};const deadline=C.prazoISO?new Date(C.prazoISO):null;const daysLeft=()=>deadline?Math.max(0,Math.ceil((deadline-Date.now())/86400000)):null;
const Q=new URLSearchParams(location.search);
const L=Q.get('lang')==='en'?'en':'pt';
const t=o=>o[L]||o.pt;

/* ---------- strings ---------- */
const S={
 pt:{start:'Fazer minha Roda da Vida',how:'Como funciona',min:'2 minutos · sem cadastro',
  eyebrowHero:'Sua Roda da Vida',h1:'Um olhar para a sua vida, hoje.',lead:'Responda a oito perguntas sobre a sua última semana. Veja como cada área esteve presente e escolha o que você quer cuidar agora.',
  trust1:'Mais de 15 especialistas',trust2:'Mais de 30 programas',trust3:'Sem cadastro, sem e-mail',
  qof:(i)=>`Pergunta ${i} de 8`,choose:'Escolha uma opção para continuar.',chosen:(v)=>`Você escolheu: ${v}.`,days:(n)=>n===1?'1 dia':`${n} dias`,unknown:'Não sei dizer',unknownShort:'Não soube dizer',
  back:'Voltar',next:'Continuar',see:'Ver minha Roda da Vida',save:'Salvar alteração',
  weekHint:'Pense nos últimos 7 dias. Cada área tem seu próprio ritmo: sete não é meta.',
  legend:'Sua roda vai se formando a cada resposta.',
  optG:'Se quiser, responda para personalizar a sugestão:',g_m:'Sou mulher',g_h:'Sou homem',g_x:'Prefiro não responder',
  optR:'Se quiser, conte qual relação você gostaria de cuidar agora:',r_f:'Meus filhos',r_p:'Meu parceiro ou minha parceira, ou outras pessoas da minha idade',r_x:'Prefiro não responder',
  revEyebrow:'Sua Roda da Vida',revH:'Um retrato da sua última semana.',revLead:'Veja como cada área esteve presente na sua semana e escolha o que você quer cuidar agora.',
  listH:'Suas respostas',edit:'Rever resposta',unknownNote:'Áreas em “Não sei dizer” ficam vazias no desenho.',
  prioEyebrow:'O próximo passo',prioH:'De qual área você gostaria de cuidar agora?',prioLead:'Escolha uma área à qual você quer dedicar mais atenção ou continuar cuidando.',
  pathEyebrow:'Sua espiral',pathH:'Comece pela área que você escolheu. Continue no seu ritmo.',pathLead:'A sua Roda da Vida já está feita: ela é o ponto de partida e vai junto no acesso. A sequência começa pela área que você escolheu e dá a volta pelas outras sete. Você decide a ordem.',seed:'Feita ✓ · incluída',step:(n)=>`Passo ${n}`,
  spEyebrow:'Conheça os temas',spH:'Como as áreas se conectam',spLead:'A roda mostra oito áreas da vida. A espiral reúne essas áreas em seis níveis, do centro para fora. Selecione um nível para conhecer os programas e especialistas.',spOpen:'Conhecer a espiral',
  inThisLevel:'Neste nível',areasIn:'Áreas da roda',
  specEyebrow:'Conheça os especialistas',specH:'Especialistas para cuidar das diferentes áreas da sua vida.',specLead:'Conheça os médicos, nutricionistas, terapeutas e educadores do MeuFluxo. Selecione um nome para saber mais sobre seu trabalho e seus programas.',tapMore:'Toque para ver',
  howEyebrow:'Como funciona',howH:'Como começar',
  how1h:'Escolha por onde começar',how1:'Conheça um programa da área que você escolheu. Com o acesso, você pode começar pela primeira aula.',
  how2h:'Continue quando fizer sentido',how2:'Volte ao mesmo programa ou explore outro conteúdo incluído no seu acesso. Você escolhe a ordem.',
  how3h:'Aprenda no seu ritmo',how3:'Assista às aulas gravadas no celular ou no computador e reveja os conteúdos durante os seus cinco anos de acesso.',
  ctaEyebrow:'Oferta especial Black November · só para quem fez a Roda',ctaH:'Programas de todos os especialistas, em um só lugar. Por tempo limitado.',ctaP:'O Nicolas escreveu uma carta para você: o seu primeiro passo, o que está incluído, o valor do Black November, o prazo e a garantia.',ctaBtn:'Ler a carta do Nicolas',redo:'Refazer minha roda',
  depoEyebrow:'Quem já está na jornada',depoH:'Histórias de quem já participa',depoLead:'Relatos de alunos do MeuFluxo, com suas próprias palavras. Cada pessoa tem sua experiência, e os resultados podem variar.',depoCheck:'Em verificação · não publicar sem autorização',depoOn:'Depoimento do programa',
  howAlone:'Ver como funciona, sem fazer a roda',
  foot:'Esta roda é um convite à reflexão pessoal e não substitui uma avaliação clínica. Suas respostas são registradas de forma anônima (sem nome, sem e-mail) para preparar a sua sugestão e melhorar a Roda. Para responder, você não precisa se cadastrar nem comprar.',
  review:'Prévia de conceito · Black November',bn:(n)=>n===null?'Black November':`Black November · faltam ${n} dias`},
 en:{start:'Build my Wheel of Life',how:'How it works',min:'2 minutes · no sign-up',
  eyebrowHero:'Your Wheel of Life',h1:'A look at your life, today.',lead:'Answer eight questions about your last week. See how present each area was and choose what you want to take care of now.',
  trust1:'15+ specialists',trust2:'30+ programs',trust3:'No sign-up, no e-mail',
  qof:(i)=>`Question ${i} of 8`,choose:'Pick an option to continue.',chosen:(v)=>`You chose: ${v}.`,days:(n)=>n===1?'1 day':`${n} days`,unknown:"I can't say",unknownShort:"Couldn't say",
  back:'Back',next:'Continue',see:'See my Wheel of Life',save:'Save change',
  weekHint:'Think about the last 7 days. Each area has its own rhythm: seven is not a target.',
  legend:'Your wheel takes shape with every answer.',
  optG:'Optional, to personalize the suggestion:',g_m:"I'm a woman",g_h:"I'm a man",g_x:"Rather not say",
  optR:'Optional: the relationship that needs attention most today is with…',r_f:'my kids',r_p:'partner or people my age',r_x:'rather not say',
  revEyebrow:'Your Wheel of Life',revH:'A portrait of your last week.',revLead:"Not a grade. A seven-day portrait. Look where there was room, and where it got small.",
  listH:'Your answers',edit:'Change',unknownNote:'Areas marked “can’t say” stay empty in the drawing.',
  prioEyebrow:'The next step',prioH:'What would you like to take care of now?',prioLead:'Pick one area. It can be the one that got small, or one you want to cultivate. Your call.',
  pathEyebrow:'Your spiral',pathH:'Start with the area you chose. Continue at your pace.',pathLead:'Your Wheel of Life is already done: it is the starting point and comes with your access. The sequence starts with the area you chose and goes round the other seven. The order is yours.',seed:'Done ✓ · included',step:(n)=>`Step ${n}`,
  spEyebrow:'Meet the themes',spH:'How the areas connect',spLead:'The wheel has eight areas. The spiral groups related areas into six levels, from the centre outward. Tap a level to see who takes care of it.',spOpen:'Explore the spiral',
  inThisLevel:'At this level',areasIn:'Wheel areas',
  specEyebrow:'Who is behind it',specH:'Hand-picked. One for every piece of your life.',specLead:'Doctors, nutritionists, therapists, educators. Tap a specialist to see their method.',tapMore:'Tap to see',
  howEyebrow:'How it works',howH:'How to start',
  how1h:'Choose where to start',how1:'See a program related to the area you chose and watch the first class.',
  how2h:'Continue when it makes sense',how2:'Go back to the same program or explore other content included in your access. The spiral suggests the order; you decide.',
  how3h:'Learn at your pace',how3:'Classes are recorded. On your phone or computer, come back to the included content throughout your five years of access.',
  ctaEyebrow:'Special Black November offer · only for people who did the Wheel',ctaH:'Programs from every specialist, in one place. For a limited time.',ctaP:'Nicolas wrote you a letter: your first step, what is included, the Black November price, the deadline and the guarantee.',ctaBtn:'Read Nicolas’s letter',redo:'Redo my wheel',
  depoEyebrow:'Already on the journey',depoH:'Stories from people already taking part',depoLead:'Personal accounts from MeuFluxo students, translated here for review (originals in Portuguese). Every story is one person’s: results vary.',depoCheck:'Under verification · do not publish without authorization',depoOn:'Program testimonial',
  howAlone:'See how it works, without the wheel',
  foot:'A personal reflection, not a clinical assessment. Your answers are recorded anonymously (no name, no e-mail) to prepare your suggestion and improve the Wheel. No form, sign-up or purchase.',
  review:'Concept preview · English review copy',bn:(n)=>n===null?'Black November':`Black November · ${n} days left`}
}[L];

/* ---------- data (data.js) ---------- */
const {AREAS,LEVELS,SPECS,DEPOS,PROGS,PROOFS}=window.MF_DATA;




const lab=i=>`${i+1} — ${t(AREAS[i].full)}`;
const byName=n=>SPECS.find(s=>s.name.replace('Dr. ','')===String(n||'').replace('Dr. ',''))||null;
const photo=s=>`img/approved/${s.slug}.jpg`, photoSq=s=>`img/approved/${s.slug}-sq.jpg`;

/* ---------- state ---------- */
let values=Array(8).fill(null), step=-1, editing=false, priority=null, extras={g:null,r:null};
const app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dayLabel=v=>v==='unknown'?S.unknownShort:S.days(v);

/* params chain */
const KEYS=MF.paramsRepassados||[];
(function cap(){try{const kept={};KEYS.forEach(k=>{if(Q.get(k))kept[k]=Q.get(k)});if(Object.keys(kept).length)sessionStorage.setItem('mf_params',JSON.stringify(kept))}catch(e){}})();
function stored(){try{return JSON.parse(sessionStorage.getItem('mf_params')||'{}')}catch(e){return{}}}
function cartaHref(){const p=new URLSearchParams(stored());if(priority!==null){p.set('prioridade',AREAS[priority].slug);if(TR)p.set('ordem',TR.encode(TR.order(values,priority)))}if(extras.g)p.set('g',extras.g);if(extras.r)p.set('r',extras.r);if(L==='en')p.set('lang','en');const s2=p.toString();return 'carta.html'+(s2?'?'+s2:'')}
function selfHref(extra){const p=new URLSearchParams(stored());if(L==='en')p.set('lang','en');Object.entries(extra||{}).forEach(([k,v])=>p.set(k,v));const s=p.toString();return 'index.html'+(s?'?'+s:'')}

/* ---------- wheel svg ---------- */
function wheel(vals,opt){opt=opt||{};const cx=240,cy=240,R=opt.R||168;const ang=i=>(-90+i*45)*Math.PI/180;
 const P=(i,r)=>[cx+Math.cos(ang(i))*r,cy+Math.sin(ang(i))*r];
 let h=`<svg class="wheel" viewBox="0 0 480 480" role="img" aria-label="${esc(S.revEyebrow)}">`;
 for(let k=1;k<=7;k++){h+=`<polygon class="grid${k===7?' outer':''}" points="${[...Array(8)].map((_,i)=>P(i,R*k/7).join(',')).join(' ')}"/>`}
 for(let i=0;i<8;i++){const e=P(i,R);h+=`<line class="spoke" x1="${cx}" y1="${cy}" x2="${e[0]}" y2="${e[1]}"/>`}
 vals.forEach((v,i)=>{if(typeof v!=='number'||v===0)return;const r=R*v/7;const a=P(i,r),b=P(i+1,r);
  h+=`<polygon class="wedge${opt.hi===i?' hi':(opt.hi!=null?' dim':'')}" data-i="${i}" style="fill:${AREAS[i].hex};transition-delay:${opt.anim?i*90:0}ms" points="${cx},${cy} ${a.join(',')} ${b.join(',')}"/>`});
 if(opt.labels!==false){AREAS.forEach((a,i)=>{const m=(ang(i)+ang(i+1))/2;const x=cx+Math.cos(m)*(R+30),y=cy+Math.sin(m)*(R+30);h+=`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${esc(t(a.n))}</text>`});
  vals.forEach((v,i)=>{if(typeof v!=='number'||v<2)return;const m=(ang(i)+ang(i+1))/2;const r=R*v/7*0.62;h+=`<text class="val" x="${cx+Math.cos(m)*r}" y="${cy+Math.sin(m)*r}" text-anchor="middle" dominant-baseline="middle">${v}</text>`})}
 h+=`<circle class="ctr" cx="${cx}" cy="${cy}" r="9"/>`;return h+'</svg>'}
function animateWheel(root){requestAnimationFrame(()=>requestAnimationFrame(()=>root.querySelectorAll('.wedge').forEach(w=>w.classList.add('in'))))}
function heroArt(){const cx=240,cy=240,R=170;const ang=i=>(-90+i*45)*Math.PI/180;const P=(i,r)=>[cx+Math.cos(ang(i))*r,cy+Math.sin(ang(i))*r];
 const demo=[5,4,6,3,5,6,4,5];let h=`<svg viewBox="0 0 480 480" aria-hidden="true"><defs><linearGradient id="gg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f1dca0"/><stop offset="1" stop-color="#d9b86a"/></linearGradient><radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#dcc6f5" stop-opacity="0"/></radialGradient></defs>`;
 h+=`<circle cx="${cx}" cy="${cy}" r="230" fill="url(#glow)"/><g class="breathe">`;
 for(let k=1;k<=7;k++)h+=`<polygon points="${[...Array(8)].map((_,i)=>P(i,R*k/7).join(',')).join(' ')}" fill="none" stroke="${k===7?'url(#gg)':'rgba(75,50,199,.10)'}" stroke-width="${k===7?2:1}"/>`;
 for(let i=0;i<8;i++){const e=P(i,R);h+=`<line x1="${cx}" y1="${cy}" x2="${e[0]}" y2="${e[1]}" stroke="rgba(75,50,199,.12)"/>`}
 demo.forEach((v,i)=>{const r=R*v/7;const a=P(i,r),b=P(i+1,r);h+=`<polygon points="${cx},${cy} ${a.join(',')} ${b.join(',')}" fill="${AREAS[i].hex}" opacity=".9" stroke="#fff" stroke-width="1.5"/>`});
 h+=`<circle cx="${cx}" cy="${cy}" r="30" fill="#fff" stroke="url(#gg)" stroke-width="2"/><path d="M225 250 v-13 a7 7 0 0 1 14 0 v13 M240 250 v-13 a7 7 0 0 1 14 0 v13" fill="none" stroke="#4b32c7" stroke-width="3" stroke-linecap="round"/></g></svg>`;return h}

/* ---------- spiral svg ---------- */
const ARCS=[ /* centre → outward, clockwise. square x,y,size · quarter-arc path · level index (0=centro..6=VI) */
 {lv:0,sq:[144,267,21],d:'M165,288 A21,21 0 0 1 144,267'},
 {lv:1,sq:[144,233,34],d:'M144,267 A34,34 0 0 1 178,233'},
 {lv:2,sq:[178,233,55],d:'M178,233 A55,55 0 0 1 233,288'},
 {lv:3,sq:[144,288,89],d:'M233,288 A89,89 0 0 1 144,377'},
 {lv:4,sq:[0,233,144],d:'M144,377 A144,144 0 0 1 0,233'},
 {lv:5,sq:[0,0,233],d:'M0,233 A233,233 0 0 1 233,0'},
 {lv:6,sq:[233,0,377],d:'M233,0 A377,377 0 0 1 610,377'}];
function arcInfo(a){const [x,y,sz]=a.sq;const m=a.d.match(/M([\d.]+),([\d.]+) A[\d.]+,[\d.]+ 0 0 1 ([\d.]+),([\d.]+)/).slice(1).map(Number);const P=[[x,y],[x+sz,y],[x,y+sz],[x+sz,y+sz]];const d=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);const c=P.find(p=>Math.abs(d(p,[m[0],m[1]])-sz)<1&&Math.abs(d(p,[m[2],m[3]])-sz)<1)||P[0];let a1=Math.atan2(m[1]-c[1],m[0]-c[0]),a2=Math.atan2(m[3]-c[1],m[2]-c[0]);while(a2<a1)a2+=Math.PI*2;const mid=(a1+a2)/2;return {c,mid,r:sz}}
function ghostWheel(vals,cx,cy,R,op){const ang=i=>(-90+i*45)*Math.PI/180;const P=(i,r)=>[cx+Math.cos(ang(i))*r,cy+Math.sin(ang(i))*r];let h=`<g class="ghost" opacity="${op}">`;
 for(let k=1;k<=7;k++)h+=`<polygon points="${[...Array(8)].map((_,i)=>P(i,R*k/7).join(',')).join(' ')}" fill="none" stroke="#5a3fb4" stroke-width="${k===7?1.5:.6}" opacity="${k===7?.5:.25}"/>`;
 for(let i=0;i<8;i++){const e=P(i,R);h+=`<line x1="${cx}" y1="${cy}" x2="${e[0]}" y2="${e[1]}" stroke="#5a3fb4" stroke-width=".6" opacity=".25"/>`}
 vals.forEach((v,i)=>{if(typeof v!=='number'||v===0)return;const r=R*v/7;const a=P(i,r),b=P(i+1,r);h+=`<polygon points="${cx},${cy} ${a.join(',')} ${b.join(',')}" fill="${AREAS[i].hex}" opacity=".55" stroke="#fff" stroke-width="1"/>`});
 return h+`<circle cx="${cx}" cy="${cy}" r="14" fill="#fff" opacity=".9"/><text x="${cx}" y="${cy+1}" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="#5a3fb4" opacity=".7" style="font-family:var(--sans)">m</text></g>`}
function spiral(hi){const gv=values.every(v=>v===null)?[5,4,6,3,5,6,4,5]:values;let h=`<svg viewBox="-20 -20 650 417" aria-hidden="true"><defs><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>`;
 ARCS.forEach(a=>{const [x,y,sz]=a.sq;h+=`<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="${LEVELS[a.lv].mid}" opacity=".28"/><rect class="gold" x="${x}" y="${y}" width="${sz}" height="${sz}" fill="none" stroke="#d9b86a" stroke-width="1.2" opacity=".7"/>`});
 ARCS.forEach((a,k)=>{const on=hi!=null&&hi===a.lv;h+=`${on?`<path d="${a.d}" fill="none" stroke="#f1dca0" stroke-width="44" opacity=".9" filter="url(#soft)"/>`:''}<path class="arc${on?' hi':''}" data-lv="${a.lv}" d="${a.d}" stroke="${LEVELS[a.lv].deep}" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.1s ${k*.18}s cubic-bezier(.2,.7,.2,1) forwards"/>`});
 ARCS.forEach((a,k)=>{if(a.lv<3)return;const i=arcInfo(a);const rr=i.r-36;const x=i.c[0]+Math.cos(i.mid)*rr,y=i.c[1]+Math.sin(i.mid)*rr;h+=`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${a.lv>=5?26:18}" font-weight="700" fill="${LEVELS[a.lv].deep}" style="font-family:var(--sans);opacity:0;animation:fadein .6s ${1.1+k*.18}s forwards">${LEVELS[a.lv].num}</text>`});
 h+=`<circle cx="165" cy="267" r="124" fill="#fff" opacity=".45"/>`+ghostWheel(gv,165,267,110,.75);
 h+=`<circle cx="165" cy="267" r="5" fill="#d9b86a"><animate attributeName="r" values="4;7;4" dur="2.4s" repeatCount="indefinite"/></circle>`;
 return h+'</svg>'}
if(!document.getElementById('kf')){const st=document.createElement('style');st.id='kf';st.textContent='@keyframes draw{to{stroke-dashoffset:0}}@keyframes fadein{to{opacity:1}}';document.head.appendChild(st)}

/* ---------- views ---------- */
function header(){return `<div class="wrap top"><a href="${selfHref()}"><img src="img/meufluxo-logo.svg" alt="MeuFluxo"></a><div style="display:flex;gap:12px;align-items:center"><span class="pill" style="font-size:12px">${esc(MF.revisao?S.review:S.bn(daysLeft()))}</span><div class="lang" role="group" aria-label="Language"><button ${L==='pt'?'class="on"':''} data-lang="pt">PT</button><button ${L==='en'?'class="on"':''} data-lang="en">EN</button></div></div></div>`}
function footer(){return `<div class="wrap foot">${esc(S.foot)}</div>`}

function vHero(){app.innerHTML=header()+`<div class="wrap screen"><div class="hero"><div class="copy"><span class="eyebrow">${esc(S.eyebrowHero)}</span><h1>${esc(S.h1)}</h1><p class="lead">${esc(S.lead)}</p>
 <div class="nav"><button class="btn primary" id="start">${esc(S.start)} →</button><button class="btn ghost" id="how">${esc(S.how)}</button></div>
 <p class="muted" style="font-size:14px">${esc(S.min)}</p>
 <div class="trust"><span class="pill"><i class="dotc" style="background:var(--a8)"></i>${esc(S.trust1)}</span><span class="pill"><i class="dotc" style="background:var(--a5)"></i>${esc(S.trust2)}</span><span class="pill"><i class="dotc" style="background:var(--gold)"></i>${esc(S.trust3)}</span></div></div>
 <div class="hero-art">${heroArt()}</div></div></div>`+footer();
 app.querySelector('#start').onclick=()=>{track('quiz_start',{});go(0)};app.querySelector('#how').onclick=()=>{vReveal(true)};bindLang()}

function vQuestion(i){const a=AREAS[i];const v=values[i];
 app.innerHTML=header()+`<div class="wrap screen"><div class="q" style="--c:${a.hex}"><section>
 <div class="progress" aria-label="${esc(S.qof(i+1))}">${AREAS.map((x,k)=>`<i class="${k<i?'done':k===i?'cur':''}" style="--c:${x.hex}"></i>`).join('')}</div>
 <div class="qbadge"><span class="ico">${a.ico}</span><span class="eyebrow">${esc(S.qof(i+1))} · ${i+1} — ${esc(t(a.n))}</span></div>
 <h1>${esc(t(a.q))}</h1><p class="help">${esc(t(a.help))}</p>
 <div class="days" role="group" aria-label="0–7">${[...Array(8)].map((_,n)=>`<button class="day${typeof v==='number'&&n<=v&&v>0?' lit':''}" data-v="${n}" aria-pressed="${v===n}" aria-label="${esc(S.days(n))}">${n}<small>${n===1?(L==='en'?'day':'dia'):(L==='en'?'days':'dias')}</small></button>`).join('')}</div>
 <div class="week" aria-hidden="true">${[...Array(7)].map((_,n)=>`<i class="${typeof v==='number'&&n<v?'on':''}"></i>`).join('')}</div>
 <button class="unknown" id="unk" aria-pressed="${v==='unknown'}">${esc(S.unknown)}</button>
 <p class="live" aria-live="polite">${v===null?esc(S.choose):esc(S.chosen(dayLabel(v)))}</p>
 ${i===1?`<div class="extras">${esc(S.optG)}<div class="chips"><button class="chip" data-x="g" data-val="m" aria-pressed="${extras.g==='m'}">${esc(S.g_m)}</button><button class="chip" data-x="g" data-val="h" aria-pressed="${extras.g==='h'}">${esc(S.g_h)}</button><button class="chip" data-x="g" data-val="" aria-pressed="${extras.g===null}">${esc(S.g_x)}</button></div></div>`:''}
 ${i===5?`<div class="extras">${esc(S.optR)}<div class="chips"><button class="chip" data-x="r" data-val="f" aria-pressed="${extras.r==='f'}">${esc(S.r_f)}</button><button class="chip" data-x="r" data-val="p" aria-pressed="${extras.r==='p'}">${esc(S.r_p)}</button><button class="chip" data-x="r" data-val="" aria-pressed="${extras.r===null}">${esc(S.r_x)}</button></div></div>`:''}
 <div class="nav"><button class="btn ghost" id="back">${esc(S.back)}</button><button class="btn primary" id="next" ${v===null?'disabled':''}>${editing?esc(S.save):i===7?esc(S.see):esc(S.next)} →</button></div>
 </section><aside class="aside"><div class="wheelbox">${wheel(values,{hi:i,labels:true,R:160})}<div class="legend">${esc(S.legend)}</div></div></aside></div></div>`+footer();
 animateWheel(app);
 app.querySelectorAll('.day').forEach(b=>b.onclick=()=>{values[i]=Number(b.dataset.v);track('answer',{q:i+1,area:AREAS[i].slug,v:values[i]});vQuestion(i);app.querySelector(`.day[data-v="${values[i]}"]`).focus({preventScroll:true})});
 app.querySelector('#unk').onclick=()=>{values[i]='unknown';track('answer',{q:i+1,area:AREAS[i].slug,v:'unknown'});vQuestion(i);app.querySelector('#unk').focus({preventScroll:true})};
 app.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{extras[b.dataset.x]=b.dataset.val||null;vQuestion(i)});
 app.querySelector('#back').onclick=()=>{editing=false;go(i-1)};
 app.querySelector('#next').onclick=()=>{if(values[i]===null)return;const tgt=editing?8:i+1;editing=false;if(tgt===8)track('quiz_done',{vals:values.map(v=>v==='unknown'?'x':v).join('')});go(tgt)};
 bindLang()}

function vReveal(showOnly){
 const has=values.every(v=>v!==null);
 if(!showOnly&&!has){go(values.findIndex(v=>v===null));return}
 let h=header()+`<div class="wrap screen">`;
 if(!showOnly){h+=`<div class="reveal"><div class="card">${wheel(values,{anim:true,R:160})}</div><div><span class="eyebrow">${esc(S.revEyebrow)}</span><h2 style="margin:8px 0 12px">${esc(S.revH)}</h2><p class="lead">${esc(S.revLead)}</p>
  <div class="card" style="margin-top:18px"><b>${esc(S.listH)}</b><ul class="scores">${AREAS.map((a,i)=>`<li style="--c:${a.hex}"><button data-edit="${i}" aria-label="${esc(S.edit)}: ${esc(lab(i))}">${esc(lab(i))}</button><span class="bar"><i data-w="${typeof values[i]==='number'?values[i]/7*100:0}"></i></span><strong>${esc(dayLabel(values[i]))}</strong></li>`).join('')}</ul>${values.includes('unknown')?`<p class="muted" style="font-size:13px;margin:10px 0 0">${esc(S.unknownNote)}</p>`:''}</div></div></div>
  <div class="section" id="prio"><div class="head"><span class="eyebrow">${esc(S.prioEyebrow)}</span><h2>${esc(S.prioH)}</h2><p class="lead">${esc(S.prioLead)}</p></div>
  <div class="prios">${AREAS.map((a,i)=>`<button class="prio" style="--c:${a.hex}" data-p="${i}" aria-pressed="${priority===i}"><span class="ico">${a.ico}</span><span>${esc(lab(i))}</span></button>`).join('')}</div><div id="path"></div></div>`}
 h+=`<div id="explainer"></div></div>`+footer();
 app.innerHTML=h; animateWheel(app);
 requestAnimationFrame(()=>app.querySelectorAll('.scores .bar i').forEach(b=>b.style.width=b.dataset.w+'%'));
 app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{editing=true;go(Number(b.dataset.edit))});
 app.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{priority=Number(b.dataset.p);track('priority_pick',{area:AREAS[priority].slug,where:'roda'});saveRoda();app.querySelectorAll('[data-p]').forEach(x=>x.setAttribute('aria-pressed',x===b));renderPath();renderExplainer(AREAS[priority].level);document.getElementById('path').scrollIntoView({behavior:'smooth',block:'start'})});
 renderExplainer(showOnly?null:(priority!==null?AREAS[priority].level:null));
 if(!showOnly&&priority!==null)renderPath();
 bindLang()}

function renderPath(){const box=document.getElementById('path');if(!box||!TR||priority===null)return;const order=TR.order(values,priority);let n=0;const SE=TR.SEMENTE[L];
 box.innerHTML=`<div class="section" style="padding-bottom:0"><div class="head"><span class="eyebrow">${esc(S.pathEyebrow)}</span><h2>${esc(S.pathH)}</h2><p class="lead">${esc(S.pathLead)}</p></div><div class="path"><div class="step seed" style="--c:var(--gold)"><span class="n seed">${esc(S.seed)}</span><img src="img/approved/nicolas-toigo-sq.jpg" alt="Nicolas Toigo"><div><b>${esc(SE.titulo)}</b><small>${esc(SE.sub)}</small></div></div>${order.map((i,k)=>{const p=TR.resolve(i,extras);const sp=byName(p.especialista);const a=AREAS[i];n++;
  return `<div class="step" style="--c:${a.hex};animation-delay:${(k+1)*90}ms"><span class="n">${esc(S.step(n))}</span>${sp?`<img src="${photoSq(sp)}" alt="${esc(sp.name)}">`:`<span class="ico" style="width:54px;height:54px;border-radius:50%;background:var(--c);display:grid;place-items:center;color:#fff">${a.ico}</span>`}<div><b>${esc(lab(i))}</b><small>${esc(p.programa||'')}${p.especialista?' · '+esc(p.especialista):''}</small></div></div>`}).join('')}</div></div>`}

function renderExplainer(hiLevel){const box=document.getElementById('explainer');if(!box)return;const lv=hiLevel==null?2:hiLevel;
 box.innerHTML=`<details class="section optional" id="sp"${hiLevel!=null?' open':''}><summary><span class="eyebrow">${esc(S.spEyebrow)}</span><h2>${esc(S.spH)}</h2><span class="btn ghost">${esc(S.spOpen)}</span></summary><p class="lead" style="margin:0 0 22px">${esc(S.spLead)}</p>
  <div class="spiral"><div id="spsvg">${spiral(lv)}</div><div><div role="tablist">${LEVELS.map((l,k)=>k===0?'':`<button class="lvl-tab" role="tab" data-lv="${k}" aria-selected="${k===lv}" style="--c:${l.deep}"><span class="n">${l.num}</span><span><b>${l.num} — ${esc(t(l.name))}</b><small>${esc(t(l.sub))}</small></span></button>`).join('')}</div><div class="lvl-panel" id="lvlpanel"></div></div></div></details>
  <div class="section"><div class="head"><span class="eyebrow">${esc(S.specEyebrow)}</span><h2>${esc(S.specH)}</h2><p class="lead">${esc(S.specLead)}</p></div>
  <div class="grid">${SPECS.map(s=>`<button class="spec" data-s="${s.slug}" style="--c:${LEVELS[s.level].deep}"><img src="${photo(s)}" alt="${esc(s.name)}" loading="lazy"><span class="body"><b>${esc(s.name)}</b><small>${esc(t(s.spec))}</small><span class="lv">${(()=>{const ai=AREAS.findIndex(a=>a.slug===s.area);return ai>=0?lab(ai):''})()}</span><span class="more">${esc(t(s.bio))}</span><span class="progs">${s.programs.map(esc).join(' · ')}</span></span></button>`).join('')}</div></div>
  <div class="section" id="depos"><div class="head"><span class="eyebrow">${esc(S.depoEyebrow)}</span><h2>${esc(S.depoH)}</h2><p class="lead">${esc(S.depoLead)}</p>${MF.depoimentosAprovados?'':`<span class="pill check">⚠ ${esc(S.depoCheck)}</span>`}</div>
  <div class="depos">${DEPOS.map((d,k)=>`<figure class="depo" style="animation-delay:${k*70}ms"><blockquote>“${esc(t(d.q))}”</blockquote><figcaption>${d.photo?`<img src="${d.photo}" alt="">`:''}<span><b>${esc(d.who)}${d.where?' · '+esc(d.where):''}</b><small>${esc(d.prog)}</small></span></figcaption></figure>`).join('')}</div>
  <div class="provas">${PROOFS.map(p=>`<button class="prova" data-img="${p.img}" aria-label="${esc(t(p.cap))}"><img src="${p.img}" alt="${esc(t(p.cap))}" loading="lazy"><span>${esc(t(p.cap))} · ${L==='en'?'tap to enlarge':'toque para ampliar'}</span></button>`).join('')}</div></div></div>
  <div class="section"><div class="head"><span class="eyebrow">${esc(S.howEyebrow)}</span><h2>${esc(S.howH)}</h2></div><div class="how">
   <div class="card"><span class="big">1</span><span class="eyebrow">${L==='en'?'Step':'Passo'} 1</span><h3>${esc(S.how1h)}</h3><p class="muted">${esc(S.how1)}</p></div>
   <div class="card"><span class="big">2</span><span class="eyebrow">${L==='en'?'Step':'Passo'} 2</span><h3>${esc(S.how2h)}</h3><p class="muted">${esc(S.how2)}</p></div>
   <div class="card"><span class="big">3</span><span class="eyebrow">${L==='en'?'Step':'Passo'} 3</span><h3>${esc(S.how3h)}</h3><p class="muted">${esc(S.how3)}</p></div></div></div>
  <div class="cta"><div><span class="eyebrow" style="color:#f1dca0">${esc(S.ctaEyebrow)}</span><h2 style="margin:8px 0 12px">${esc(S.ctaH)}</h2><p>${esc(S.ctaP)}</p></div><div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start"><a class="btn" id="cta" href="${cartaHref()}" data-track="cta_letter">${esc(S.ctaBtn)} →</a><button class="btn ghost" id="redo" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.3)">${hiLevel==null&&values.every(v=>v===null)?esc(S.start):esc(S.redo)}</button></div></div>`;
 const panel=()=>{const k=Number(box.querySelector('.lvl-tab[aria-selected=true]').dataset.lv);const l=LEVELS[k];const specs=SPECS.filter(s=>s.level===k);
  box.querySelector('#lvlpanel').innerHTML=`<span class="eyebrow" style="color:${l.deep}">${esc(S.inThisLevel)} · ${l.num}</span><h3 style="margin:6px 0 4px">${esc(t(l.name))}</h3><p class="muted" style="margin:0 0 8px">${esc(t(l.sub))}</p>
   <div class="muted" style="font-size:13px">${esc(S.areasIn)}: ${l.areas.map(i=>`<span class="pill" style="margin:2px 4px 2px 0"><i class="dotc" style="background:${AREAS[i].hex}"></i>${esc(lab(i))}</span>`).join('')}</div>
   <div class="faces">${specs.map(s=>`<button class="face" data-s="${s.slug}"><img src="${photoSq(s)}" alt=""><span><b>${esc(s.name)}</b><br><span class="muted" style="font-size:12px">${esc(s.programs[0])}</span></span></button>`).join('')}</div>`;
  box.querySelectorAll('.face').forEach(f=>f.onclick=()=>{const card=box.querySelector(`.spec[data-s="${f.dataset.s}"]`);if(card){card.classList.add('open');card.scrollIntoView({behavior:'smooth',block:'center'})}})};
 const select=k=>{box.querySelectorAll('.lvl-tab').forEach(b=>b.setAttribute('aria-selected',Number(b.dataset.lv)===k));box.querySelector('#spsvg').innerHTML=spiral(k);box.querySelectorAll('#spsvg text').forEach(x=>{x.style.animation='none';x.style.opacity='1'});box.querySelectorAll('path.arc').forEach(p=>{p.style.animation='none';p.style.strokeDashoffset='0';p.onclick=()=>{const kk=Number(p.dataset.lv);if(kk>0)select(kk)}});panel()};
 box.querySelectorAll('.lvl-tab').forEach(b=>b.onclick=()=>select(Number(b.dataset.lv)));
 box.querySelectorAll('path.arc').forEach(p=>p.onclick=()=>{const k=Number(p.dataset.lv);if(k>0)select(k)});
 box.querySelectorAll('.spec').forEach(c=>c.onclick=()=>c.classList.toggle('open'));
 box.querySelectorAll('.prova').forEach(b=>b.onclick=()=>{const m=document.createElement('div');m.className='modal';m.innerHTML=`<img src="${b.dataset.img}" alt=""><button aria-label="close">×</button>`;m.onclick=()=>m.remove();document.body.appendChild(m)});
 box.querySelector('#cta').addEventListener('click',()=>{track('cta_letter',{prioridade:priority!==null?AREAS[priority].slug:''});saveRoda()});
 box.querySelector('#redo').onclick=()=>{values=Array(8).fill(null);priority=null;extras={g:null,r:null};go(-1)};
 panel()}

/* respostas da roda → /api/roda (anônimo: vid/sid do track.js, sem nome, sem e-mail). No-op até configurar a planilha. */
let rodaSent='';function saveRoda(){try{const ep=(MF.dados||{}).endpoint;if(!ep||!values.every(v=>v!==null))return;const ids=(window.MF_TRACK&&window.MF_TRACK.ids)||{};const rec={ts:Date.now(),vid:ids.vid||'',sid:ids.sid||'',lang:L,vals:values.map(v=>v==='unknown'?'x':v).join(''),prioridade:priority!==null?AREAS[priority].slug:'',ordem:priority!==null&&TR?TR.encode(TR.order(values,priority)):'',g:extras.g||'',r:extras.r||'',...(ids.utm||{}),ref:(ids.first||{}).ref||''};const key=JSON.stringify(rec).replace(/"ts":\d+,/,'');if(key===rodaSent)return;rodaSent=key;const body=JSON.stringify(rec);if(navigator.sendBeacon)navigator.sendBeacon(ep,new Blob([body],{type:'application/json'}));else fetch(ep,{method:'POST',body,keepalive:true,headers:{'Content-Type':'application/json'}})}catch(e){}}
function bindLang(){app.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{const p=new URLSearchParams(location.search);if(b.dataset.lang==='en')p.set('lang','en');else p.delete('lang');location.search=p.toString()})}
function go(n){step=n;if(n<0)vHero();else if(n<8)vQuestion(n);else vReveal(false);window.scrollTo({top:0,behavior:'instant'});const h=app.querySelector('h1,h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}
go(-1);
})();
