/* MeuFluxo · Roda da Vida — experience v4 (quiz · reveal · spiral · specialists). Vanilla JS, no deps. */
(function(){
'use strict';
const MF=window.MF_CONFIG||{}, TR=window.MF_TRILHA;
const track=(ev,p)=>{try{window.MF_TRACK&&window.MF_TRACK(ev,p)}catch(e){}};
const C=MF.campanha||{};const daysLeft=()=>null;
const countdownLabel=()=>window.MF_COUNTDOWN_LABEL?window.MF_COUNTDOWN_LABEL(L):'';
const Q=new URLSearchParams(location.search);
const L=Q.get('lang')==='en'?'en':'pt';
const t=o=>o[L]||o.pt;
/* v9: o selo "Presente de Black November · só durante o Black November · pouco tempo restando" saiu: a Roda é grátis sempre e não há prazo confirmado. */
const G={};

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
  pathEyebrow:'A jornada recomendada',pathH:'Uma sugestão de caminho pelas oito áreas. A ordem é sua.',pathLead:'É a mesma jornada para todo mundo, pensada pela equipe do MeuFluxo: um programa de cada área, do Propósito à Espiritualidade. A sua Roda já é o primeiro passo. Você começa pela área que escolheu e segue no seu ritmo.',chosenEb:'Seu começo',chosenH:(a)=>`Seu começo: ${a}`,chosenP:'Uma sugestão para começar pela área que você escolheu. Não é um diagnóstico: é um bom ponto de partida, e você pode trocar quando quiser.',chosenGo:'Ver a proposta completa',chosenRoda:'Você já fez a Roda da Vida, a ferramenta de reflexão do Nicolas. O próximo passo é escolher um programa para começar.',chosenTag:'Seu começo',done:'Feita ✓',whoCares:'Especialista desta área no MeuFluxo',seed:'Feita ✓',step:(n)=>`Área ${n}`,
  spEyebrow:'Conheça os temas',spH:'Como as áreas se conectam',spLead:'A roda mostra oito áreas da vida. A espiral reúne essas áreas em seis níveis, do centro para fora. Selecione um nível para conhecer os programas e especialistas.',spOpen:'Conhecer a espiral',
  inThisLevel:'Neste nível',areasIn:'Áreas da roda',
  specEyebrow:'Conheça os especialistas',specH:'Especialistas para cuidar das diferentes áreas da sua vida.',specLead:'Conheça os médicos, nutricionistas, terapeutas e educadores do MeuFluxo. Selecione um nome para saber mais sobre seu trabalho e seus programas.',tapMore:'Toque para ver',
  howEyebrow:'Como funciona',howH:'Como começar',
  how1h:'Escolha por onde começar',how1:'Conheça um programa da área que você escolheu. Com o acesso, você pode começar pela primeira aula.',
  how2h:'Continue quando fizer sentido',how2:'Volte ao mesmo programa ou explore outro conteúdo incluído no seu acesso. Você escolhe a ordem.',
  how3h:'Aprenda no seu ritmo',how3:'Assista às aulas gravadas no celular ou no computador e reveja os conteúdos durante os seus cinco anos de acesso.',
  ctaEyebrow:'MeuFluxo Ilimitado · Black November',ctaH:'Programas de todos os especialistas, em um só lugar.',ctaP:'Veja a proposta do Nicolas: os programas incluídos, o valor, o tempo de acesso e a garantia.',ctaBtn:'Ver a proposta completa',redo:'Refazer minha roda',
  depoEyebrow:'Quem já está na jornada',depoH:'Histórias de quem já participa',depoLead:'Relatos de pessoas que participam do MeuFluxo, com suas próprias palavras. Cada pessoa tem sua experiência, e os resultados podem variar.',depoCheck:'Em verificação · não publicar sem autorização',depoOn:'Depoimento do programa',
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
  optG:'If you like, answer to personalize the suggestion:',g_m:"I'm a woman",g_h:"I'm a man",g_x:"Rather not answer",
  optR:'Optional: the relationship that needs attention most today is with…',r_f:'my kids',r_p:'partner or people my age',r_x:'rather not say',
  revEyebrow:'Your Wheel of Life',revH:'A portrait of your last week.',revLead:'See how present each area was in your week and choose what you want to take care of now.',
  listH:'Your answers',edit:'Review answer',unknownNote:'Areas marked “can’t say” stay empty in the drawing.',
  prioEyebrow:'The next step',prioH:'Which area would you like to take care of now?',prioLead:'Choose an area you want to give more attention to, or keep caring for.',
  pathEyebrow:'The recommended journey',pathH:'A suggested path through the eight areas. The order is yours.',pathLead:'It is the same journey for everyone, planned by the MeuFluxo team: one program from each area, from Purpose to Spirituality. Your Wheel is already the first step. You start with the area you chose and go at your own pace.',chosenEb:'Your start',chosenH:(a)=>`Your start: ${a}`,chosenP:'A suggestion to begin with the area you chose. It is not a diagnosis: it is a good starting point, and you can change it whenever you like.',chosenGo:'See the full offer',chosenRoda:'You have already done the Wheel of Life, Nicolas’s reflection tool. The next step is choosing a program to start with.',chosenTag:'Your start',done:'Done ✓',whoCares:'Specialist for this area at MeuFluxo',seed:'Done ✓',step:(n)=>`Area ${n}`,
  spEyebrow:'Meet the themes',spH:'How the areas connect',spLead:'The wheel shows eight areas of life. The spiral groups those areas into six levels, from the centre outward. Select a level to meet the programs and specialists.',spOpen:'Explore the spiral',
  inThisLevel:'At this level',areasIn:'Wheel areas',
  specEyebrow:'Meet the specialists',specH:'Specialists to care for the different areas of your life.',specLead:'Meet the doctors, nutritionists, therapists and educators of MeuFluxo. Select a name to learn about their work and programs.',tapMore:'Tap to see',
  howEyebrow:'How it works',howH:'How to start',
  how1h:'Choose where to start',how1:'Get to know a program in the area you chose. With access, you can start with the first class.',
  how2h:'Continue when it makes sense',how2:'Go back to the same program or explore other content included in your access. You choose the order.',
  how3h:'Learn at your pace',how3:'Watch the recorded classes on your phone or computer and revisit the content throughout your five years of access.',
  ctaEyebrow:'MeuFluxo Ilimitado · Black November',ctaH:'Programs from every specialist, in one place.',ctaP:'See Nicolas’s offer: the programs included, the price, the access period and the guarantee.',ctaBtn:'See the full offer',redo:'Redo my wheel',
  depoEyebrow:'Already on the journey',depoH:'Stories from people already taking part',depoLead:'Accounts from MeuFluxo students, in their own words (translated for review). Everyone has their own experience, and results may vary.',depoCheck:'Under verification · do not publish without authorization',depoOn:'Program testimonial',
  howAlone:'See how it works, without the wheel',
  foot:'This wheel is an invitation to personal reflection and does not replace a clinical assessment. Your answers are recorded anonymously (no name, no e-mail) to prepare your suggestion and improve the Wheel. You do not need to sign up or buy anything to answer.',
  review:'Concept preview · English review copy',bn:(n)=>n===null?'Black November':`Black November · ${n} days left`}
}[L];
/* ---------- v9 copy (2026-11-07, Rock: só palavras — mais simples, mais curto, mais alegre). Remover este bloco = volta ao v8. ---------- */
Object.assign(S,{
 pt:{start:'Fazer minha Roda grátis',
  eyebrowHero:'Roda da Vida · grátis',h1:'Como anda a sua vida? Veja em dois minutos.',lead:'Oito perguntas rápidas sobre a sua semana. É como tirar uma foto: no fim, você vê o que está bem, o que pede mais carinho e escolhe por onde começar.',
  weekHint:'Pense nos últimos 7 dias. Responda sem pensar muito: não existe resposta certa, e sete não é meta.',
  legend:'A sua roda vai ganhando forma a cada resposta.',
  revEyebrow:'Sua Roda da Vida',revH:'Pronto. Esta é a sua semana.',revLead:'Nenhuma roda é perfeita, e não precisa ser. Ela só mostra onde vale a pena colocar um pouco mais de carinho agora.',
  prioEyebrow:'O próximo passo',prioH:'O que você quer cuidar primeiro?',prioLead:'Escolha uma área: a que está pedindo ajuda ou a que você quer fortalecer. Uma de cada vez já é um ótimo começo.',
  pathEyebrow:'A jornada recomendada',pathH:'Um passo de cada vez, pelas oito áreas.',pathLead:'É como um GPS: você não precisa adivinhar o próximo passo. A jornada é a mesma para todo mundo, e a sua Roda já é o primeiro. Você começa pela área que escolheu e segue no seu ritmo.',
  chosenP:'Um ótimo jeito de começar. É uma sugestão, não um diagnóstico: você pode trocar quando quiser.',chosenGo:'Ver como começar',
  specLead:'Médicos, nutricionistas, terapeutas e educadores. Toque num nome para conhecer o trabalho e os programas.',
  how1h:'Comece pelo que importa agora',how1:'Abra a primeira aula do programa da área que você escolheu.',
  how2h:'Volte quando quiser',how2:'Retome de onde parou ou abra outro tema incluído no acesso.',
  how3h:'Vá no seu ritmo',how3:'Aulas gravadas, no celular ou no computador, por cinco anos.',
  ctaH:'Os programas de todos os especialistas, em uma casa só.',ctaP:'Veja o que está incluído, quanto custa, por quanto tempo e como funciona a garantia de 7 dias.',ctaBtn:'Ver a proposta',
  spLead:'As oito áreas se encaixam em seis níveis, do centro para fora. Toque num nível para ver os programas e especialistas.',bn:(n)=>n===null?'Black November':`Black November · ${n} dias para a Black Friday`},
 en:{start:'Do my Wheel, free',
  eyebrowHero:'Wheel of Life · free',h1:'How is your life going? See it in two minutes.',lead:'Eight quick questions about your week. It is like taking a photo: at the end you see what is going well, what needs more care, and you choose where to start.',
  weekHint:'Think about the last 7 days. Answer without overthinking: there is no right answer, and seven is not a target.',
  legend:'Your wheel takes shape with each answer.',
  revEyebrow:'Your Wheel of Life',revH:'Done. This is your week.',revLead:'No wheel is perfect, and it does not need to be. It just shows where a little more care is worth it right now.',
  prioEyebrow:'The next step',prioH:'What do you want to care for first?',prioLead:'Pick one area: the one asking for help or the one you want to strengthen. One at a time is already a great start.',
  pathEyebrow:'The recommended journey',pathH:'One step at a time, through the eight areas.',pathLead:'It is like a GPS: you do not need to guess the next step. The journey is the same for everyone, and your Wheel is already the first one. You start with the area you chose and go at your own pace.',
  chosenP:'A great way to start. It is a suggestion, not a diagnosis: you can change it whenever you like.',chosenGo:'See how to start',
  specLead:'Doctors, nutritionists, therapists and educators. Tap a name to see their work and programs.',
  how1h:'Start with what matters now',how1:'Open the first class of the program for the area you chose.',
  how2h:'Come back whenever you like',how2:'Pick up where you stopped or open another topic included in the access.',
  how3h:'Go at your pace',how3:'Recorded classes, on your phone or computer, for five years.',
  ctaH:'Every specialist’s programs, under one roof.',ctaP:'See what is included, what it costs, for how long and how the 7-day guarantee works.',ctaBtn:'See the offer',
  spLead:'The eight areas fit into six levels, from the center outward. Tap a level to see the programs and specialists.',bn:(n)=>n===null?'Black November':`Black November · ${n} days to Black Friday`}}[L]);
/* ---------- v10 copy (2026-11-07, ROCKdot/Rock: palavras primeiro). Sobre o v9; remover este bloco = volta ao v9 (tag sales-v9-2026-11-07). ----------
   Selos só com fatos verificáveis (8 áreas, grátis, sem cadastro) no lugar das contagens não confirmadas; rodapé sem "anônimas" (há identificadores de sessão). */
Object.assign(S,{
 pt:{start:'Começar minha Roda',eyebrowHero:'Sua Roda da Vida',min:'Se uma pergunta for difícil, responda “Não sei dizer”.',
  lead:'Oito perguntas rápidas sobre a sua semana. Como uma foto: você vê o que está bem, o que pede mais carinho e escolhe por onde começar.',
  trust1:'8 áreas da vida',trust2:'Grátis',trust3:'Sem cadastro, sem e-mail',
  legend:'Um retrato da semana, não uma nota sobre você.',
  revLead:'É um retrato, não uma nota. Nenhuma roda é perfeita: ela só mostra onde vale colocar um pouco mais de carinho agora.',
  prioLead:'Escolha uma área: a que pede ajuda ou a que você quer fortalecer. Você pode mudar depois.',
  pathLead:'É como um GPS: você não precisa adivinhar o próximo passo. A jornada sugere um programa por área, igual para todo mundo, e a sua Roda já é o primeiro. Comece pela área que escolheu; não precisa fazer tudo de uma vez.',
  chosenP:'Um bom primeiro passo para essa área. É uma sugestão, não um diagnóstico: você pode abrir outro programa quando quiser.',
  specH:'Conheça os especialistas e os programas',
  foot:'A Roda é um convite à reflexão, não uma avaliação clínica. Suas respostas são registradas sem nome e sem e-mail, para preparar a sua sugestão e melhorar a Roda. Para responder, você não precisa se cadastrar nem comprar.'},
 en:{start:'Start my Wheel',eyebrowHero:'Your Wheel of Life',min:'If a question is hard, answer “I can\'t say”.',
  lead:'Eight quick questions about your week. Like a photo: you see what is going well, what needs more care, and you choose where to start.',
  trust1:'8 areas of life',trust2:'Free',trust3:'No sign-up, no e-mail',
  legend:'A picture of the week, not a grade about you.',
  revLead:'It is a picture, not a grade. No wheel is perfect: it just shows where a little more care is worth it right now.',
  prioLead:'Pick one area: the one asking for help or the one you want to strengthen. You can change later.',
  pathLead:'It is like a GPS: you do not need to guess the next step. The journey suggests one program per area, the same for everyone, and your Wheel is already the first. Start with the area you chose; you do not need to do everything at once.',
  chosenP:'A good first step for this area. It is a suggestion, not a diagnosis: you can open another program whenever you like.',
  specH:'Meet the specialists and the programs',
  foot:'The Wheel is an invitation to reflect, not a clinical assessment. Your answers are recorded without your name or e-mail, to prepare your suggestion and improve the Wheel. You do not need to sign up or buy to answer.'}}[L]);

const REVIEW_COPY={"en": {"h1": "Get to know yourself better, in Just 2 Minutes.", "lead": "Just 8 simple questions about your typical week -- you see what's good now, what could be better, and the easiest way to get there... starting TODAY.", "trust1": "Free", "trust2": "No sign-up", "trust3": "No email needed", "start": "Start my Wheel", "weekPrompt": "In your typical week, how many days…", "choose": "Choose how many days out of 7", "review": "Review only · not published", "less": "Less = Still Growing", "more": "More = Going Well", "resultTitle": "Your Best Next Step", "support": "Now, to move forward in the right way, let’s take it one step at a time.", "go": "See your next step", "redo": "Redo my Wheel", "pending": "Review note: the recommendation rule is still to be agreed. No program has been selected from your answers.", "strong": "Going well", "growing": "Still growing"}, "pt": {"h1": "Conheça melhor você, em Apenas 2 Minutos.", "lead": "Só 8 perguntas simples sobre uma semana típica sua -- você vê o que está bom agora, o que pode melhorar e o jeito mais fácil de chegar lá... começando HOJE.", "trust1": "Grátis", "trust2": "Sem cadastro", "trust3": "Sem precisar de e-mail", "start": "Começar minha Roda", "weekPrompt": "Em uma semana típica sua, em quantos dias…", "choose": "Escolha quantos dias, de 0 a 7", "review": "Em revisão · não publicado", "less": "Menos = Ainda Crescendo", "more": "Mais = Indo Bem", "resultTitle": "Seu Melhor Próximo Passo", "support": "Agora, para evoluir da maneira certa, vamos por partes.", "go": "Ver seu próximo passo", "redo": "Refazer minha Roda", "pending": "Nota de revisão: a regra da recomendação ainda será definida. Nenhum programa foi escolhido com base nas suas respostas.", "strong": "Indo bem", "growing": "Ainda crescendo"}};
Object.assign(S,REVIEW_COPY[L]);
const REVIEW_QUESTIONS={"en": ["do you feel on the right track?", "do you move your body?", "are you proud of the way you ate?", "do you remember all you need to, and focus?", "do you feel at peace about money?", "do you have someone close you know you can count on?", "are you better, in some way, from the day before?", "do you feel a sense of inner peace?"], "pt": ["você sente que está no caminho certo?", "você movimenta o corpo?", "você sente orgulho da forma como se alimentou?", "você lembra de tudo o que precisa e consegue se concentrar?", "você se sente em paz com o dinheiro?", "você tem alguém próximo com quem sabe que pode contar?", "você está melhor, de alguma forma, do que no dia anterior?", "você sente paz interior?"]};
/* ---------- data (data.js) ---------- */
const {AREAS}=window.MF_DATA;




const lab=i=>`${i+1} — ${t(AREAS[i].full)}`;
/* ---------- state ---------- */
let values=Array(8).fill(null), step=-1, editing=false, priority=null, extras={g:null,r:null};
/* 2026-11-06: a roda concluída fica só NESTA aba (sessionStorage 'mf_roda'), para "Voltar à Roda da Vida" reabrir o resultado e a área escolhida.
   Nada vai para a URL nem para o servidor por causa disso; fechar a aba apaga. "Refazer minha roda" apaga de propósito. */
/* v8 (2026-11-07): Propósito = passo 1 (a Roda). Quem já fez não recebe de novo o mesmo passo: o painel mostra "feito" e o próximo passo da jornada. */
const Q8={pt:{doneH:(a)=>`Primeiro passo feito: ${a}`,next:'Próximo passo',nextTag:'Próximo',doneP:'Você já fez a Roda: o primeiro passo está dado. Este é o próximo da jornada. Siga essa ordem ou escolha outra área quando quiser.',startDone:'Seu começo ✓'},
 en:{doneH:(a)=>`First step done: ${a}`,next:'Next step',nextTag:'Next',doneP:'You have already done the Wheel: the first step is taken. This is the next one in the journey. Follow that order or choose another area whenever you like.',startDone:'Your start ✓'}}[L==='en'?'en':'pt'];
const ST_KEY='mf_roda';
function keep(){try{if(values.every(v=>v!==null))sessionStorage.setItem(ST_KEY,JSON.stringify({v:values,p:priority}))}catch(e){}}
function forget(){try{sessionStorage.removeItem(ST_KEY)}catch(e){}}
function restore(){try{const o=JSON.parse(sessionStorage.getItem(ST_KEY)||'null');if(!o||!Array.isArray(o.v)||o.v.length!==8)return false;
 if(!o.v.every(x=>x==='unknown'||(Number.isInteger(x)&&x>=0&&x<=7)))return false;values=o.v.slice();priority=(Number.isInteger(o.p)&&o.p>=0&&o.p<8)?o.p:null;return true}catch(e){return false}}
const app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dayLabel=v=>v==='unknown'?S.unknownShort:S.days(v);

/* params chain */
const KEYS=MF.paramsRepassados||[];
(function cap(){try{const kept={};KEYS.forEach(k=>{if(Q.get(k))kept[k]=Q.get(k)});if(Object.keys(kept).length)sessionStorage.setItem('mf_params',JSON.stringify(kept))}catch(e){}})();
function stored(){try{return JSON.parse(sessionStorage.getItem('mf_params')||'{}')}catch(e){return{}}}
function cartaHref(){const p=new URLSearchParams(stored());if(priority!==null){p.set('prioridade',AREAS[priority].slug);if(TR&&!MF.jornadaPadrao)p.set('ordem',TR.encode(TR.order(values,priority)))}if(!MF.jornadaPadrao){if(extras.g)p.set('g',extras.g);if(extras.r)p.set('r',extras.r)}if(L==='en')p.set('lang','en');const s2=p.toString();return 'carta.html'+(s2?'?'+s2:'')}
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
function header(){return `<div class="wrap top"><a href="${selfHref()}"><img src="img/meufluxo-logo.svg" alt="MeuFluxo"></a><div style="display:flex;gap:12px;align-items:center"><span class="pill" style="font-size:12px">${esc(MF.revisao?S.review:countdownLabel())}</span><div class="lang" role="group" aria-label="Language"><button ${L==='pt'?'class="on"':''} data-lang="pt">PT</button><button ${L==='en'?'class="on"':''} data-lang="en">EN</button></div></div></div>`}
function footer(){return ''}

function vHero(){app.innerHTML=header()+`<div class="wrap screen"><div class="hero"><div class="copy"><span class="eyebrow">${esc(S.eyebrowHero)}</span><h1>${esc(S.h1)}</h1><p class="lead">${esc(S.lead)}</p>
 <div class="nav"><button class="btn primary" id="start">${esc(S.start)} →</button><button class="btn ghost" id="how">${esc(S.how)}</button></div>
 
 <div class="gift"><div class="row"><span class="was"><small>${L==='en'?'NORMALLY':'NORMALMENTE'}</small><s>R$299</s></span><span class="free">${L==='en'?'FREE':'GRÁTIS'}</span></div></div>
 <div class="trust"><span class="pill"><i class="dotc" style="background:var(--a8)"></i>${esc(S.trust1)}</span><span class="pill"><i class="dotc" style="background:var(--a5)"></i>${esc(S.trust2)}</span><span class="pill"><i class="dotc" style="background:var(--gold)"></i>${esc(S.trust3)}</span></div></div>
 <div class="hero-art">${heroArt()}</div></div></div>`+footer();
 app.querySelector('#start').onclick=()=>{track('quiz_start',{});go(0)};app.querySelector('#how').onclick=()=>{vReveal(true)};bindLang()}

function vQuestion(i){const a=AREAS[i];const v=values[i];
 app.innerHTML=header()+`<div class="wrap screen"><div class="q" style="--c:${a.hex}"><section>
 <div class="progress" aria-label="${esc(S.qof(i+1))}">${AREAS.map((x,k)=>`<i class="${k<i?'done':k===i?'cur':''}" style="--c:${x.hex}"></i>`).join('')}</div>
 <div class="qbadge"><span class="ico">${a.ico}</span><span class="eyebrow">${esc(S.qof(i+1))} · ${i+1} — ${esc(t(a.n))}</span></div>
 <p class="week-prompt">${esc(S.weekPrompt)}</p><h1>${esc(REVIEW_QUESTIONS[L][i])}</h1>
 <div class="slider" style="--c:${a.hex}"><div class="val" id="val">${typeof v==='number'?v:'–'}<small>${typeof v==='number'?(v===1?(L==='en'?'day':'dia'):(L==='en'?'days':'dias')):(L==='en'?'slide':'arraste')}</small></div>
  <input type="range" id="rng" min="0" max="7" step="1" value="${typeof v==='number'?v:0}" aria-label="0–7" ${typeof v==='number'?'':'data-untouched="1"'}>
  <div class="ticks">${[...Array(8)].map((_,n)=>`<span${typeof v==='number'&&n===v?' class="on"':''}>${n}</span>`).join('')}</div></div>
 <div class="week" aria-hidden="true">${[...Array(7)].map((_,n)=>`<i class="${typeof v==='number'&&n<v?'on':''}"></i>`).join('')}</div>
 <button class="unknown" id="unk" aria-pressed="${v==='unknown'}">${esc(S.unknown)}</button>
 <p class="live" aria-live="polite">${v===null?esc(S.choose):esc(S.chosen(dayLabel(v)))}</p>
 ${i===1&&!MF.jornadaPadrao?`<div class="extras">${esc(S.optG)}<div class="chips"><button class="chip" data-x="g" data-val="m" aria-pressed="${extras.g==='m'}">${esc(S.g_m)}</button><button class="chip" data-x="g" data-val="h" aria-pressed="${extras.g==='h'}">${esc(S.g_h)}</button><button class="chip" data-x="g" data-val="" aria-pressed="${extras.g===null}">${esc(S.g_x)}</button></div></div>`:''}
 ${i===5&&!MF.jornadaPadrao?`<div class="extras">${esc(S.optR)}<div class="chips"><button class="chip" data-x="r" data-val="f" aria-pressed="${extras.r==='f'}">${esc(S.r_f)}</button><button class="chip" data-x="r" data-val="p" aria-pressed="${extras.r==='p'}">${esc(S.r_p)}</button><button class="chip" data-x="r" data-val="" aria-pressed="${extras.r===null}">${esc(S.r_x)}</button></div></div>`:''}
 <div class="nav"><button class="btn ghost" id="back">${esc(S.back)}</button><button class="btn primary" id="next" ${v===null?'disabled':''}>${editing?esc(S.save):i===7?esc(S.see):esc(S.next)} →</button></div>
 </section><aside class="aside"><div class="wheelbox">${wheel(values,{hi:i,labels:true,R:160})}</div></aside></div></div>`+footer();
 animateWheel(app);
 const rng=app.querySelector('#rng');rng.style.setProperty('--p',typeof v==='number'?v/7:0);const paint=(v)=>{values[i]=v;rng.removeAttribute('data-untouched');rng.style.setProperty('--p',v/7);app.querySelector('#val').innerHTML=`${v}<small>${v===1?(L==='en'?'day':'dia'):(L==='en'?'days':'dias')}</small>`;app.querySelectorAll('.ticks span').forEach((x,n)=>x.classList.toggle('on',n===v));app.querySelectorAll('.week i').forEach((x,n)=>x.classList.toggle('on',n<v));app.querySelector('#unk').setAttribute('aria-pressed','false');app.querySelector('.live').textContent=S.chosen(dayLabel(v));app.querySelector('#next').disabled=false;const wb=app.querySelector('.wheelbox');wb.querySelector('svg').outerHTML=wheel(values,{hi:i,labels:true,R:160});wb.querySelectorAll('.wedge').forEach(w=>w.classList.add('in'))};
 rng.oninput=()=>paint(Number(rng.value));rng.onchange=()=>track('answer',{q:i+1,area:AREAS[i].slug,v:values[i]});
 rng.addEventListener('pointerdown',()=>{if(rng.dataset.untouched)paint(Number(rng.value))});rng.addEventListener('keydown',()=>{if(rng.dataset.untouched)setTimeout(()=>paint(Number(rng.value)),0)});
 app.querySelector('#unk').onclick=()=>{values[i]='unknown';track('answer',{q:i+1,area:AREAS[i].slug,v:'unknown'});vQuestion(i);app.querySelector('#unk').focus({preventScroll:true})};
 app.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{extras[b.dataset.x]=b.dataset.val||null;vQuestion(i)});
 app.querySelector('#back').onclick=()=>{editing=false;go(i-1)};
 app.querySelector('#next').onclick=()=>{if(values[i]===null)return;const tgt=editing?8:i+1;editing=false;if(tgt===8)track('quiz_done',{vals:values.map(v=>v==='unknown'?'x':v).join('')});go(tgt)};
 bindLang()}

function reviewObservations(){
 const known=values.map((v,i)=>({v,i})).filter(x=>typeof x.v==='number');
 if(!known.length)return `<p>${L==='en'?'You left all eight areas open. There is no ranking to show yet.':'Você deixou as oito áreas em aberto. Ainda não há uma comparação para mostrar.'}</p>`;
 const hi=Math.max(...known.map(x=>x.v)),lo=Math.min(...known.map(x=>x.v));
 if(hi===lo)return `<p>${L==='en'?`You reported ${hi} days in each answered area.`:`Você marcou ${hi} dias em todas as áreas respondidas.`}</p>`;
 const names=n=>known.filter(x=>x.v===n).map(x=>t(AREAS[x.i].n)).join(', ');
 const phrase=(n,growing)=>L==='en'?`You are ${growing?'still growing':'doing well'} in ${names(n)} (you marked ${n} ${n===1?'day':'days'}).`:`Você está ${growing?'ainda crescendo':'indo bem'} em ${names(n)} (marcou ${n} ${n===1?'dia':'dias'}).`;
 return `<div class="observation"><p>${esc(phrase(hi,false))}</p></div><div class="observation"><p>${esc(phrase(lo,true))}</p></div>`;
}
function vReveal(showOnly){
 if(showOnly){go(0);return}
 if(!values.every(v=>v!==null)){go(values.findIndex(v=>v===null));return}
 priority=null;keep();saveRoda();
 app.innerHTML=header()+`<div class="wrap screen"><div class="guided-result"><div class="result-wheel"><div class="card"><h2 class="wheel-title eyebrow">${esc(S.revEyebrow)}</h2>${wheel(values,{anim:true,R:160})}</div><div class="fill-key"><span><i class="less"></i>${esc(S.less)}</span><span><i class="more"></i>${esc(S.more)}</span></div></div><section><h1>${esc(S.resultTitle)}</h1>${reviewObservations()}${values.includes('unknown')?`<p class="unknown-note">${L==='en'?'Unanswered areas are not compared.':'Áreas sem resposta não entram na comparação.'}</p>`:''}<p class="support">${esc(S.support)}</p><a class="btn primary" id="guided-next" href="${cartaHref()}">${esc(S.go)} →</a><p class="redo-later">${L==='en'?'You can redo it later.':'Você pode refazer depois.'}</p></section></div></div>`;
 animateWheel(app);bindLang();
 app.querySelector('#guided-next').addEventListener('click',()=>{track('cta_letter',{prioridade:''});saveRoda()});
}

let rodaSent='';function saveRoda(){try{const ep=(MF.dados||{}).endpoint;if(!ep||!values.every(v=>v!==null))return;const ids=(window.MF_TRACK&&window.MF_TRACK.ids)||{};const rec={ts:Date.now(),vid:ids.vid||'',sid:ids.sid||'',lang:L,vals:values.map(v=>v==='unknown'?'x':v).join(''),prioridade:priority!==null?AREAS[priority].slug:'',ordem:priority!==null&&TR?TR.encode(TR.order(values,priority)):'',g:extras.g||'',r:extras.r||'',...(ids.utm||{}),ref:(ids.first||{}).ref||''};const key=JSON.stringify(rec).replace(/"ts":\d+,/,'');if(key===rodaSent)return;rodaSent=key;const body=JSON.stringify(rec);if(navigator.sendBeacon)navigator.sendBeacon(ep,new Blob([body],{type:'application/json'}));else fetch(ep,{method:'POST',body,keepalive:true,headers:{'Content-Type':'application/json'}})}catch(e){}}
function bindLang(){app.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{const p=new URLSearchParams(location.search);if(b.dataset.lang==='en')p.set('lang','en');else p.delete('lang');location.search=p.toString()})}
function go(n){step=n;if(n<0)vHero();else if(n<8)vQuestion(n);else vReveal(false);window.scrollTo({top:0,behavior:'instant'});const h=app.querySelector('h1,h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}
(function boot(){const back=Q.get('voltar')==='1', redo=Q.get('refazer')==='1';
 if(back||redo){try{const u=new URL(location.href);u.searchParams.delete('voltar');u.searchParams.delete('refazer');history.replaceState(history.state,'',u.pathname+(u.searchParams.toString()?'?'+u.searchParams:'')+u.hash)}catch(e){}}
 if(redo)forget();
 if(!redo&&restore()){go(8);if(priority!==null){const b=document.querySelector(`[data-p="${priority}"]`);if(b)b.setAttribute('aria-pressed','true');const pa=document.getElementById('path');if(pa)setTimeout(()=>pa.scrollIntoView({block:'start'}),60)}return}
 go(-1)})();
})();
