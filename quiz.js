/* MeuFluxo · Roda da Vida — experience v4 (quiz · reveal · spiral · specialists). Vanilla JS, no deps. */
(function(){
'use strict';
const MF=window.MF_CONFIG||{}, TR=window.MF_TRILHA;
const Q=new URLSearchParams(location.search);
const L=Q.get('lang')==='en'?'en':'pt';
const t=o=>o[L]||o.pt;

/* ---------- strings ---------- */
const S={
 pt:{start:'Fazer minha Roda da Vida',how:'Como funciona',min:'2 minutos · sem cadastro',
  eyebrowHero:'Sua Roda da Vida',h1:'Sua vida, vista por inteiro.',lead:'Oito perguntas sobre a sua última semana. No final, uma imagem da sua vida inteira, e o passo que faz sentido agora.',
  trust1:'Mais de 15 especialistas',trust2:'Mais de 30 programas',trust3:'Suas respostas ficam com você',
  qof:(i)=>`Pergunta ${i} de 8`,choose:'Escolha uma opção para continuar.',chosen:(v)=>`Você escolheu: ${v}.`,days:(n)=>n===1?'1 dia':`${n} dias`,unknown:'Não sei dizer',unknownShort:'Não soube dizer',
  back:'Voltar',next:'Continuar',see:'Ver minha Roda da Vida',save:'Salvar alteração',
  weekHint:'Pense nos últimos 7 dias. Cada área tem seu próprio ritmo: sete não é meta.',
  legend:'Sua roda vai se formando a cada resposta.',
  optG:'Opcional, para personalizar a sugestão:',g_m:'Sou mulher',g_h:'Sou homem',g_x:'Prefiro não dizer',
  optR:'Opcional: a relação que mais pede atenção hoje é com…',r_f:'meus filhos',r_p:'parceiro(a) ou pessoas da minha idade',r_x:'não quero dizer',
  revEyebrow:'Sua Roda da Vida',revH:'Um retrato da sua última semana.',revLead:'Não é uma nota. É um retrato de sete dias. Olha onde teve espaço, e onde ficou pequeno.',
  listH:'Suas respostas',edit:'Alterar',unknownNote:'Áreas em “Não sei dizer” ficam vazias no desenho.',
  prioEyebrow:'O próximo passo',prioH:'O que você gostaria de cuidar agora?',prioLead:'Escolha uma área. Pode ser a que ficou pequena ou a que você quer cultivar. A escolha é sua.',
  pathEyebrow:'Sua espiral',pathH:'Comece pela sua necessidade. A espiral segue dali.',pathLead:'O propósito é a semente e já vem incluído. Depois, cada área leva à seguinte. É uma sugestão: a ordem é sua.',seed:'Semente · incluído',step:(n)=>`Passo ${n}`,
  spEyebrow:'Como o MeuFluxo organiza a vida',spH:'Seis níveis. Uma espiral. Tudo ligado.',spLead:'Toque em um nível para ver quem cuida dele. Cada nível se expande a partir do anterior.',
  inThisLevel:'Neste nível',areasIn:'Áreas da roda',
  specEyebrow:'Quem está por trás',specH:'Escolhidos a dedo. Um para cada pedaço da sua vida.',specLead:'Médicos, nutricionistas, terapeutas, educadores. Toque em um especialista para conhecer o método dele.',tapMore:'Toque para ver',
  howEyebrow:'Como funciona',howH:'Simples de verdade.',
  how1h:'Entre pela sua necessidade',how1:'Você escolhe a área que mais pede atenção hoje. Abre o programa do especialista. Assiste uma aula de 20 minutos.',
  how2h:'A espiral segue',how2:'Quando essa área melhora, a próxima já está ali, com a pessoa certa. Nada de começar do zero em outro lugar.',
  how3h:'No seu tempo',how3:'Tudo gravado. No celular, no computador, na TV. Você volta quantas vezes quiser, por anos.',
  ctaEyebrow:'A proposta',ctaH:'Todos os especialistas. Um lugar só. Uma decisão.',ctaP:'Conheça a carta do Nicolas com a proposta completa: o que está incluído, por quanto tempo, e a garantia.',ctaBtn:'Conhecer a proposta',redo:'Refazer minha roda',
  depoEyebrow:'Quem já está na jornada',depoH:'Pessoas reais. Palavras delas.',depoLead:'Relatos pessoais de alunos do MeuFluxo, no texto original. Cada história é de uma pessoa: resultados variam.',depoCheck:'Em verificação · não publicar sem autorização',depoOn:'Depoimento do programa',
  howAlone:'Ver como funciona, sem fazer a roda',
  foot:'Uma reflexão pessoal, não uma avaliação clínica. Suas respostas ficam apenas nesta página e desaparecem ao recarregar. Nenhum formulário, cadastro ou compra.',
  review:'Prévia de conceito · Black November'},
 en:{start:'Build my Wheel of Life',how:'How it works',min:'2 minutes · no sign-up',
  eyebrowHero:'Your Wheel of Life',h1:'Your whole life, in one picture.',lead:'Eight questions about your last week. At the end, a picture of your whole life, and the step that makes sense now.',
  trust1:'15+ specialists',trust2:'30+ programs',trust3:'Your answers stay with you',
  qof:(i)=>`Question ${i} of 8`,choose:'Pick an option to continue.',chosen:(v)=>`You chose: ${v}.`,days:(n)=>n===1?'1 day':`${n} days`,unknown:"I can't say",unknownShort:"Couldn't say",
  back:'Back',next:'Continue',see:'See my Wheel of Life',save:'Save change',
  weekHint:'Think about the last 7 days. Each area has its own rhythm: seven is not a target.',
  legend:'Your wheel takes shape with every answer.',
  optG:'Optional, to personalize the suggestion:',g_m:"I'm a woman",g_h:"I'm a man",g_x:"Rather not say",
  optR:'Optional: the relationship that needs attention most today is with…',r_f:'my kids',r_p:'partner or people my age',r_x:'rather not say',
  revEyebrow:'Your Wheel of Life',revH:'A portrait of your last week.',revLead:"Not a grade. A seven-day portrait. Look where there was room, and where it got small.",
  listH:'Your answers',edit:'Change',unknownNote:'Areas marked “can’t say” stay empty in the drawing.',
  prioEyebrow:'The next step',prioH:'What would you like to take care of now?',prioLead:'Pick one area. It can be the one that got small, or one you want to cultivate. Your call.',
  pathEyebrow:'Your spiral',pathH:'Start with your need. The spiral continues from there.',pathLead:'Purpose is the seed and is already included. Then each area leads to the next. A suggestion: the order is yours.',seed:'Seed · included',step:(n)=>`Step ${n}`,
  spEyebrow:'How MeuFluxo organizes life',spH:'Six levels. One spiral. Everything connected.',spLead:'Tap a level to see who takes care of it. Each level grows out of the previous one.',
  inThisLevel:'At this level',areasIn:'Wheel areas',
  specEyebrow:'Who is behind it',specH:'Hand-picked. One for every piece of your life.',specLead:'Doctors, nutritionists, therapists, educators. Tap a specialist to see their method.',tapMore:'Tap to see',
  howEyebrow:'How it works',howH:'Truly simple.',
  how1h:'Come in through your need',how1:'You pick the area that needs attention most today. Open the specialist’s program. Watch a 20-minute class.',
  how2h:'The spiral continues',how2:'When that area improves, the next one is already there, with the right person. No starting from scratch somewhere else.',
  how3h:'In your own time',how3:'All recorded. On your phone, computer, TV. Come back as often as you like, for years.',
  ctaEyebrow:'The proposal',ctaH:'All the specialists. One place. One decision.',ctaP:'Read Nicolas’s letter with the full proposal: what’s included, for how long, and the guarantee.',ctaBtn:'Read the proposal',redo:'Redo my wheel',
  depoEyebrow:'Already on the journey',depoH:'Real people. Their words.',depoLead:'Personal accounts from MeuFluxo students, translated here for review (originals in Portuguese). Every story is one person’s: results vary.',depoCheck:'Under verification · do not publish without authorization',depoOn:'Program testimonial',
  howAlone:'See how it works, without the wheel',
  foot:'A personal reflection, not a clinical assessment. Your answers stay on this page only and disappear on reload. No form, sign-up or purchase.',
  review:'Concept preview · English review copy'}
}[L];

/* ---------- data ---------- */
const AREAS=[
 {slug:'proposito',n:{pt:'Propósito',en:'Purpose'},full:{pt:'Propósito',en:'Purpose'},ico:'✦',c:'var(--a1)',hex:'#cfb5f1',level:1,
  q:{pt:'Em quantos dos últimos 7 dias você fez algo que sentiu ter sentido para a sua vida?',en:'On how many of the last 7 days did you do something that felt meaningful for your life?'},
  help:{pt:'Pode ter sido uma escolha pequena, ligada a algo que você considera importante.',en:'It may have been a small choice, tied to something you consider important.'}},
 {slug:'alimentacao',n:{pt:'Alimentação',en:'Nutrition'},full:{pt:'Alimentação',en:'Nutrition'},ico:'❋',c:'var(--a2)',hex:'#c9a4f0',level:2,
  q:{pt:'Em quantos dos últimos 7 dias você conseguiu dar à sua alimentação a atenção que gostaria?',en:'On how many of the last 7 days did you give your nutrition the attention you wanted?'},
  help:{pt:'Pense no que foi possível na sua rotina, sem comparar com a de outra pessoa.',en:'Think about what was possible in your routine, without comparing to anyone else.'}},
 {slug:'movimento',n:{pt:'Movimento',en:'Movement'},full:{pt:'Movimento',en:'Movement'},ico:'⟡',c:'var(--a3)',hex:'#ba92ec',level:2,
  q:{pt:'Em quantos dos últimos 7 dias você movimentou o corpo de uma forma que fez sentido para você?',en:'On how many of the last 7 days did you move your body in a way that made sense to you?'},
  help:{pt:'Uma caminhada, um alongamento, outra forma possível para você. Dentro dos seus limites.',en:'A walk, a stretch, any form possible for you. Within your limits.'}},
 {slug:'memoria',n:{pt:'Memória',en:'Memory'},full:{pt:'Memória',en:'Memory'},ico:'◉',c:'var(--a4)',hex:'#b083e9',level:3,
  q:{pt:'Em quantos dos últimos 7 dias você sentiu sua memória e seu foco funcionando do jeito que gostaria?',en:'On how many of the last 7 days did your memory and focus work the way you wanted?'},
  help:{pt:'Para estudar, trabalhar, lembrar do que importa ou manter a atenção em uma coisa de cada vez.',en:'To study, work, remember what matters or keep attention on one thing at a time.'}},
 {slug:'financas',n:{pt:'Finanças',en:'Finances'},full:{pt:'Finanças',en:'Finances'},ico:'◈',c:'var(--a5)',hex:'#9f72e3',level:5,
  q:{pt:'Em quantos dos últimos 7 dias você dedicou algum tempo a cuidar da sua organização financeira?',en:'On how many of the last 7 days did you spend some time on your financial organization?'},
  help:{pt:'Olhar as contas, organizar um pagamento, planejar um gasto. Não precisa ser todos os dias.',en:'Looking at bills, organizing a payment, planning a purchase. It doesn’t have to be every day.'}},
 {slug:'relacoes',n:{pt:'Relações',en:'Relationships'},full:{pt:'Relações',en:'Relationships'},ico:'♡',c:'var(--a6)',hex:'#9466df',level:4,
  q:{pt:'Em quantos dos últimos 7 dias você teve um momento de conexão com alguém importante para você?',en:'On how many of the last 7 days did you have a moment of connection with someone important to you?'},
  help:{pt:'Uma conversa, uma troca de apoio, um momento de convivência que teve significado.',en:'A conversation, a moment of support, time together that meant something.'}},
 {slug:'crescimento',n:{pt:'Crescimento',en:'Growth'},full:{pt:'Crescimento',en:'Growth'},ico:'✿',c:'var(--a7)',hex:'#7b4de2',level:5,
  q:{pt:'Em quantos dos últimos 7 dias você reconheceu algo em si de que gostou ou se orgulhou?',en:'On how many of the last 7 days did you recognize something in yourself you liked or were proud of?'},
  help:{pt:'Uma atitude, um esforço, uma habilidade, uma pequena conquista.',en:'An attitude, an effort, a skill, a small win.'}},
 {slug:'transcendencia',n:{pt:'Transcendência',en:'Transcendence'},full:{pt:'Transcendência',en:'Transcendence'},ico:'☼',c:'var(--a8)',hex:'#4b32c7',level:6,
  q:{pt:'Em quantos dos últimos 7 dias você reservou um momento para a sua energia interior ou espiritualidade?',en:'On how many of the last 7 days did you set aside a moment for your inner energy or spirituality?'},
  help:{pt:'Silêncio, reflexão, oração ou outra prática que faça sentido para você, com ou sem religião.',en:'Silence, reflection, prayer or any practice that makes sense to you, with or without religion.'}}
];
const LEVELS=[
 {num:'Centro',name:{pt:'Centro',en:'Center'},sub:{pt:'Onde tudo começa',en:'Where it all begins'},hex:'#F0E8FB',mid:'#EADAFB',deep:'#A67FDC',areas:[]},
 {num:'I',name:{pt:'Propósito',en:'Purpose'},sub:{pt:'Descubra quem você realmente é',en:'Discover who you really are'},hex:'#DCC6F5',mid:'#C9A4F0',deep:'#A67FDC',areas:[0]},
 {num:'II',name:{pt:'Saúde',en:'Health'},sub:{pt:'O combustível para a sua jornada',en:'The fuel for your journey'},hex:'#C9A4F0',mid:'#B58EE6',deep:'#8E68D0',areas:[1,2]},
 {num:'III',name:{pt:'Inteligência',en:'Intelligence'},sub:{pt:'A confiança para construir',en:'The confidence to build'},hex:'#B083E9',mid:'#9B6BDB',deep:'#6F44B8',areas:[3]},
 {num:'IV',name:{pt:'Relações',en:'Relationships'},sub:{pt:'Conexões que transformam',en:'Connections that transform'},hex:'#9466DF',mid:'#8451D4',deep:'#5A2FA0',areas:[5]},
 {num:'V',name:{pt:'Prosperidade',en:'Prosperity'},sub:{pt:'A abundância que você merece',en:'The abundance you deserve'},hex:'#7B4DE2',mid:'#7B4DE2',deep:'#4A2394',areas:[4,6]},
 {num:'VI',name:{pt:'Espiritualidade',en:'Spirituality'},sub:{pt:'A conexão com algo maior',en:'The connection with something bigger'},hex:'#4B32C7',mid:'#4B32C7',deep:'#2D1B85',areas:[7]}
];
const SPECS=[
 {slug:'nicolas-toigo',name:'Nicolas Toigo',level:1,spec:{pt:'Fundador do MeuFluxo · propósito',en:'MeuFluxo founder · purpose'},bio:{pt:'Reuniu os especialistas do MeuFluxo e criou a Jornada: sair da zona de conforto sem medo e escolher o próximo destino. Incluída em qualquer compra.',en:'Brought the MeuFluxo specialists together and created the Jornada: leave the comfort zone without fear and choose the next destination. Included with any purchase.'},programs:['A Jornada MeuFluxo']},
 {slug:'eduardo-claas',name:'Eduardo Claas',level:2,spec:{pt:'Nutrição funcional e saúde intestinal',en:'Functional nutrition and gut health'},bio:{pt:'Nutricionista e naturopata, referência em modulação intestinal e protocolos Low FODMAP. O intestino é o seu segundo cérebro.',en:'Nutritionist and naturopath, a reference in gut modulation and Low FODMAP protocols. The gut is your second brain.'},programs:['Dieta das 3 Fases 2.0','Reset Digestivo','Ciclo de Dietas']},
 {slug:'lucas-mallmann',name:'Lucas Mallmann',level:2,spec:{pt:'Nutrição esportiva e jejum',en:'Sports nutrition and fasting'},bio:{pt:'Mais de 7 anos de experiência, certificação internacional IFBB. Une corpo, mente e emoção. Emagrecer sem passar fome.',en:'7+ years of experience, international IFBB certification. Body, mind and emotion together. Lose weight without going hungry.'},programs:['Jejum 2.0','Desafio Jejum 7 em 10','Protocolo Detox Turbinado']},
 {slug:'jaqueline-brihy',name:'Jaqueline Brihy',level:2,spec:{pt:'Emagrecimento sem restrições',en:'Weight loss without restrictions'},bio:{pt:'Nutricionista que criou o método a partir da própria história e de estudos sobre falha metabólica. Leve, sem proibições radicais.',en:'Nutritionist who built her method from her own story and studies on metabolic failure. Light, no radical bans.'},programs:['Emagrecer Sem Restrições']},
 {slug:'suellen-lopes',name:'Suéllen Lopes',level:2,spec:{pt:'Saúde da mulher 40+',en:"Women's health 40+"},bio:{pt:'Personal trainer há mais de 14 anos, dedicada exclusivamente à saúde feminina acima dos 40. Resultados sustentáveis.',en:'Personal trainer for 14+ years, dedicated exclusively to women over 40. Sustainable results.'},programs:['Projeto Mulher 40+','Receitas Detox 40+ Express','Mindset 40+']},
 {slug:'peterson-menezes',name:'Peterson Menezes',level:2,spec:{pt:'Chi kung e terapia vibracional',en:'Chi kung and vibrational therapy'},bio:{pt:'Mestre em cultura oriental e artes marciais, terapeuta há mais de 30 anos. Alívio de dores e equilíbrio corporal.',en:'Master of Eastern culture and martial arts, therapist for 30+ years. Pain relief and body balance.'},programs:['Costas Sem Dores','Terapia Vibracional']},
 {slug:'mateus-cecconello',name:'Mateus Cecconello',level:2,spec:{pt:'Saúde física e shape',en:'Physical health and shape'},bio:{pt:'Educador físico, especialista em cinesiologia e biomecânica. Shape sem academia, com abordagem integrativa.',en:'Physical educator, specialist in kinesiology and biomechanics. Shape without a gym, integrative approach.'},programs:['Meu Shape Ideal']},
 {slug:'marcelo-roxo',name:'Dr. Marcelo Roxo',level:3,spec:{pt:'Performance mental e neurociência',en:'Mental performance and neuroscience'},bio:{pt:'Médico neurocirurgião e professor de medicina. Criador do método Ultra Inteligência: memória, foco e aprendizado.',en:'Neurosurgeon and professor of medicine. Creator of the Ultra Inteligência method: memory, focus and learning.'},programs:['Ultra Inteligência','15 Ferramentas da Alta Performance','Receitas da Inteligência']},
 {slug:'roberta-desnos',name:'Roberta Desnos',level:3,spec:{pt:'Desenvolvimento profissional',en:'Professional development'},bio:{pt:'Psicóloga, terapeuta e mestre em ciências sociais. Inteligência emocional e social para se destacar no trabalho.',en:'Psychologist, therapist and master in social sciences. Emotional and social intelligence to stand out at work.'},programs:['Novo Profissional 3R']},
 {slug:'gabriela-barea',name:'Gabriela Barea',level:4,spec:{pt:'Relacionamentos e libertação emocional',en:'Relationships and emotional release'},bio:{pt:'Criadora do método LDA (Libertar, Desbloquear e Atrair): exercícios práticos para abrir espaço para conexões profundas.',en:'Creator of the LDA method (Release, Unblock, Attract): practical exercises to make room for deep connection.'},programs:['4 Códigos do Amor']},
 {slug:'eddy-giordani',name:'Eddy Giordani',level:4,spec:{pt:'Relações familiares e disciplina positiva',en:'Family relationships and positive discipline'},bio:{pt:'Criador do método TRIPLO C: vínculos mais fortes entre pais e filhos, menos conflito, filhos capazes e conectados.',en:'Creator of the TRIPLO C method: stronger parent-child bonds, less conflict, capable and connected kids.'},programs:['Filhos Sem Conflitos']},
 {slug:'lucia-lux-tellaris',name:'Lucia Lux Tellaris',level:5,spec:{pt:'Desbloqueios energéticos e abundância',en:'Energetic unblocking and abundance'},bio:{pt:'Terapeuta holística. Integra espiritualidade, energia e reprogramação de crenças para liberar o que trava a prosperidade.',en:'Holistic therapist. Integrates spirituality, energy and belief reprogramming to release what blocks prosperity.'},programs:['Matriz da Abundância']},
 {slug:'nereu-araldi',name:'Nereu Araldi',level:5,spec:{pt:'Reprogramação mental e meditação',en:'Mental reprogramming and meditation'},bio:{pt:'Empresário, palestrante e escritor, com mais de 8 livros em 17 países. Técnicas para liberar padrões negativos.',en:'Entrepreneur, speaker and author of 8+ books in 17 countries. Techniques to release negative patterns.'},programs:['Restart Mental','Meditação Alfa']},
 {slug:'zaika-capita',name:'Zaika Capita',level:6,spec:{pt:'Frequências sonoras e bioenergia',en:'Sound frequencies and bioenergy'},bio:{pt:'Neurocientista, biocomunicadora e terapeuta. Cada célula, órgão e emoção tem a sua frequência.',en:'Neuroscientist, biocommunicator and therapist. Every cell, organ and emotion has its own frequency.'},programs:['Frequências da Vida','Bioenergia do Dinheiro']},
 {slug:'ariosto-mello',name:'Ariosto Mello',level:6,spec:{pt:'Yoga, meditação e sono',en:'Yoga, meditation and sleep'},bio:{pt:'Professor há mais de 11 anos, formado com um monge na Índia, na tradição dos meditadores do Himalaia.',en:'Teacher for 11+ years, trained with a monk in India in the Himalayan meditation tradition.'},programs:['Estado Delta','Mega Meditação']},
 {slug:'fernando-felix',name:'Fernando Felix',level:6,spec:{pt:'Comportamento humano e propósito',en:'Human behavior and purpose'},bio:{pt:'Trainer e especialista em comportamento humano. Método Desperte Seu Destino: conquistas rápidas e profundas.',en:'Trainer and human-behavior specialist. The Desperte Seu Destino method: fast, deep wins.'},programs:['Desperte Seu Destino']}
];
const DEPOS=[
 {who:'Cledi',where:'',spec:'eduardo-claas',prog:'Dieta das 3 Fases',q:{pt:'Eu fiz a dieta das 3 fases em fevereiro, o resultado foi excelente.',en:'I did the 3 Phases diet in February; the result was excellent.'}},
 {who:'Leandro',where:'',spec:'eduardo-claas',prog:'Dieta das 3 Fases',q:{pt:'Fiz o 3 Fases e perdi 18 kg e tive melhoras significativas.',en:'I did the 3 Phases and lost 18 kg, with significant improvements.'}},
 {who:'Juliana',where:'',spec:'marcelo-roxo',prog:'Ultra Inteligência',q:{pt:'Eu estudava 10 horas por dia e não lembrava de nada no dia seguinte. Hoje leio 420 palavras por minuto. O curso funciona.',en:'I used to study 10 hours a day and remember nothing the next day. Today I read 420 words per minute. The course works.'}},
 {who:'Daniel',where:'',spec:'marcelo-roxo',prog:'Ultra Inteligência',q:{pt:'Fui aprovado em 7 universidades de medicina e depois fui bicampeão de anatomia utilizando essas técnicas de estudo.',en:'I was accepted at 7 medical schools and then won the anatomy championship twice using these study techniques.'}},
 {who:'Marcia',where:'',spec:'gabriela-barea',prog:'4 Códigos do Amor',q:{pt:'Só de ouvir a explicação da Gabriela Barea foi terapêutico pra mim, senti verdade, bem-estar e mais força.',en:'Just hearing Gabriela Barea’s explanation was therapeutic for me; I felt truth, well-being and more strength.'}},
 {who:'Ivelize',where:'',spec:'nereu-araldi',prog:'Restart Mental',q:{pt:'Estou me sentindo mais forte e muito mais leve, muitas oportunidades aparecendo… estou animada, fazendo planos que já não fazia mais há muito tempo, e ainda não acabei a jornada!',en:'I feel stronger and much lighter, many opportunities showing up… I’m excited, making plans I hadn’t made in a long time, and I haven’t even finished the journey!'}},
 {who:'Edson',where:'',spec:'zaika-capita',prog:'Frequências da Vida',q:{pt:'Comprei este acesso porque sabia que seria bom, mas não sabia que seria tão incrível.',en:'I bought this access because I knew it would be good, but I didn’t know it would be this incredible.'}},
 {who:'Dilma',where:'',spec:'zaika-capita',prog:'Frequências da Vida',q:{pt:'Faço parte da plataforma MeuFluxo, e esse belo trabalho da Zaika Capita faz parte das coisas maravilhosas que tem por lá pra nos ajudar a construir uma saúde melhor em todas as áreas.',en:'I’m part of the MeuFluxo platform, and Zaika Capita’s beautiful work is one of the wonderful things there to help us build better health in every area.'}},
 {who:'Olga',where:'',spec:'ariosto-mello',prog:'Mega Meditação',q:{pt:'Sempre recusei meditação. Nunca consegui mais que dois minutos. No meufluxo.com pude finalmente iniciar uma relação de meditação e resultados.',en:'I always refused meditation. I never managed more than two minutes. At meufluxo.com I could finally start a relationship with meditation, and results.'}},
 {who:'Claudio',where:'São Paulo, SP',spec:'fernando-felix',prog:'Desperte Seu Destino',q:{pt:'Fiz a 1ª jornada e assisti as aulas de Desperte Seu Destino. Resultou em melhora no meu astral. E o mais importante, retomei o caminho certo!',en:'I did the first journey and watched the Desperte Seu Destino classes. My mood improved. And most importantly, I got back on the right path!'}},
 {who:'Bruna',where:'',spec:'lucas-mallmann',prog:'Jejum 2.0',q:{pt:'Transformou minha relação com a alimentação, me auxiliando a aderir a um estilo de vida saudável e livre de extremismos.',en:'It transformed my relationship with food, helping me adopt a healthy lifestyle free of extremes.'}}
];
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
function cartaHref(){const p=new URLSearchParams(stored());if(priority!==null){p.set('prioridade',AREAS[priority].slug);if(TR)p.set('ordem',TR.encode(TR.order(values,priority)))}if(extras.g)p.set('g',extras.g);if(extras.r)p.set('r',extras.r);const s=p.toString();return (L==='en'?'carta-en.html':'carta.html')+(s?'?'+s:'')}
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
function spiral(hi){let h=`<svg viewBox="-20 -20 650 417" aria-hidden="true"><defs><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>`;
 ARCS.forEach(a=>{const [x,y,sz]=a.sq;h+=`<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="${LEVELS[a.lv].mid}" opacity=".28"/><rect class="gold" x="${x}" y="${y}" width="${sz}" height="${sz}" fill="none" stroke="#d9b86a" stroke-width="1.2" opacity=".7"/>`});
 ARCS.forEach((a,k)=>{const on=hi!=null&&hi===a.lv;h+=`${on?`<path d="${a.d}" fill="none" stroke="#f1dca0" stroke-width="44" opacity=".9" filter="url(#soft)"/>`:''}<path class="arc${on?' hi':''}" data-lv="${a.lv}" d="${a.d}" stroke="${LEVELS[a.lv].deep}" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.1s ${k*.18}s cubic-bezier(.2,.7,.2,1) forwards"/>`});
 ARCS.forEach((a,k)=>{if(a.lv<3)return;const i=arcInfo(a);const rr=i.r-36;const x=i.c[0]+Math.cos(i.mid)*rr,y=i.c[1]+Math.sin(i.mid)*rr;h+=`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${a.lv>=5?26:18}" font-weight="700" fill="${LEVELS[a.lv].deep}" style="font-family:var(--sans);opacity:0;animation:fadein .6s ${1.1+k*.18}s forwards">${LEVELS[a.lv].num}</text>`});
 h+=`<circle cx="165" cy="267" r="5" fill="#d9b86a"><animate attributeName="r" values="4;7;4" dur="2.4s" repeatCount="indefinite"/></circle>`;
 return h+'</svg>'}
if(!document.getElementById('kf')){const st=document.createElement('style');st.id='kf';st.textContent='@keyframes draw{to{stroke-dashoffset:0}}@keyframes fadein{to{opacity:1}}';document.head.appendChild(st)}

/* ---------- views ---------- */
function header(){return `<div class="wrap top"><a href="${selfHref()}"><img src="img/meufluxo-logo.svg" alt="MeuFluxo"></a><div style="display:flex;gap:12px;align-items:center"><span class="pill" style="font-size:12px">${esc(S.review)}</span><div class="lang" role="group" aria-label="Language"><button ${L==='pt'?'class="on"':''} data-lang="pt">PT</button><button ${L==='en'?'class="on"':''} data-lang="en">EN</button></div></div></div>`}
function footer(){return `<div class="wrap foot">${esc(S.foot)}</div>`}

function vHero(){app.innerHTML=header()+`<div class="wrap screen"><div class="hero"><div class="copy"><span class="eyebrow">${esc(S.eyebrowHero)}</span><h1>${esc(S.h1)}</h1><p class="lead">${esc(S.lead)}</p>
 <div class="nav"><button class="btn primary" id="start">${esc(S.start)} →</button><button class="btn ghost" id="how">${esc(S.how)}</button></div>
 <p class="muted" style="font-size:14px">${esc(S.min)}</p>
 <div class="trust"><span class="pill"><i class="dotc" style="background:var(--a8)"></i>${esc(S.trust1)}</span><span class="pill"><i class="dotc" style="background:var(--a5)"></i>${esc(S.trust2)}</span><span class="pill"><i class="dotc" style="background:var(--gold)"></i>${esc(S.trust3)}</span></div></div>
 <div class="hero-art">${heroArt()}</div></div></div>`+footer();
 app.querySelector('#start').onclick=()=>go(0);app.querySelector('#how').onclick=()=>{vReveal(true)};bindLang()}

function vQuestion(i){const a=AREAS[i];const v=values[i];
 app.innerHTML=header()+`<div class="wrap screen"><div class="q" style="--c:${a.hex}"><section>
 <div class="progress" aria-label="${esc(S.qof(i+1))}">${AREAS.map((x,k)=>`<i class="${k<i?'done':k===i?'cur':''}" style="--c:${x.hex}"></i>`).join('')}</div>
 <div class="qbadge"><span class="ico">${a.ico}</span><span class="eyebrow">${esc(S.qof(i+1))} · ${i+1} — ${esc(t(a.n))}</span></div>
 <h1>${esc(t(a.q))}</h1><p class="help">${esc(t(a.help))}</p>
 <div class="days" role="group" aria-label="0–7">${[...Array(8)].map((_,n)=>`<button class="day${typeof v==='number'&&n<=v&&v>0?' lit':''}" data-v="${n}" aria-pressed="${v===n}" aria-label="${esc(S.days(n))}">${n}<small>${n===1?(L==='en'?'day':'dia'):(L==='en'?'days':'dias')}</small></button>`).join('')}</div>
 <div class="week" aria-hidden="true">${[...Array(7)].map((_,n)=>`<i class="${typeof v==='number'&&n<v?'on':''}"></i>`).join('')}</div>
 <button class="unknown" id="unk" aria-pressed="${v==='unknown'}">${esc(S.unknown)}</button>
 <p class="live" aria-live="polite">${v===null?esc(S.choose):esc(S.chosen(dayLabel(v)))}</p>
 ${i===2?`<div class="extras">${esc(S.optG)}<div class="chips"><button class="chip" data-x="g" data-val="m" aria-pressed="${extras.g==='m'}">${esc(S.g_m)}</button><button class="chip" data-x="g" data-val="h" aria-pressed="${extras.g==='h'}">${esc(S.g_h)}</button><button class="chip" data-x="g" data-val="" aria-pressed="${extras.g===null}">${esc(S.g_x)}</button></div></div>`:''}
 ${i===5?`<div class="extras">${esc(S.optR)}<div class="chips"><button class="chip" data-x="r" data-val="f" aria-pressed="${extras.r==='f'}">${esc(S.r_f)}</button><button class="chip" data-x="r" data-val="p" aria-pressed="${extras.r==='p'}">${esc(S.r_p)}</button><button class="chip" data-x="r" data-val="" aria-pressed="${extras.r===null}">${esc(S.r_x)}</button></div></div>`:''}
 <div class="nav"><button class="btn ghost" id="back">${esc(S.back)}</button><button class="btn primary" id="next" ${v===null?'disabled':''}>${editing?esc(S.save):i===7?esc(S.see):esc(S.next)} →</button></div>
 </section><aside class="aside"><div class="wheelbox">${wheel(values,{hi:i,labels:true,R:160})}<div class="legend">${esc(S.legend)}</div></div></aside></div></div>`+footer();
 animateWheel(app);
 app.querySelectorAll('.day').forEach(b=>b.onclick=()=>{values[i]=Number(b.dataset.v);vQuestion(i);app.querySelector(`.day[data-v="${values[i]}"]`).focus({preventScroll:true})});
 app.querySelector('#unk').onclick=()=>{values[i]='unknown';vQuestion(i);app.querySelector('#unk').focus({preventScroll:true})};
 app.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{extras[b.dataset.x]=b.dataset.val||null;vQuestion(i)});
 app.querySelector('#back').onclick=()=>{editing=false;go(i-1)};
 app.querySelector('#next').onclick=()=>{if(values[i]===null)return;const tgt=editing?8:i+1;editing=false;go(tgt)};
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
 app.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{priority=Number(b.dataset.p);app.querySelectorAll('[data-p]').forEach(x=>x.setAttribute('aria-pressed',x===b));renderPath();renderExplainer(AREAS[priority].level);document.getElementById('path').scrollIntoView({behavior:'smooth',block:'start'})});
 renderExplainer(showOnly?null:(priority!==null?AREAS[priority].level:null));
 if(!showOnly&&priority!==null)renderPath();
 bindLang()}

function renderPath(){const box=document.getElementById('path');if(!box||!TR||priority===null)return;const order=TR.order(values,priority);let n=0;
 box.innerHTML=`<div class="section" style="padding-bottom:0"><div class="head"><span class="eyebrow">${esc(S.pathEyebrow)}</span><h2>${esc(S.pathH)}</h2><p class="lead">${esc(S.pathLead)}</p></div><div class="path">${order.map((i,k)=>{const p=TR.resolve(i,extras);const sp=byName(p.especialista);const a=AREAS[i];const seed=!!p.incluido;if(!seed)n++;
  return `<div class="step" style="--c:${a.hex};animation-delay:${k*90}ms"><span class="n${seed?' seed':''}">${seed?esc(S.seed):esc(S.step(n))}</span>${sp?`<img src="${photoSq(sp)}" alt="${esc(sp.name)}">`:`<span class="ico" style="width:54px;height:54px;border-radius:50%;background:var(--c);display:grid;place-items:center;color:#fff">${a.ico}</span>`}<div><b>${esc(lab(i))}</b><small>${esc(p.programa||'')}${p.especialista?' · '+esc(p.especialista):''}</small></div></div>`}).join('')}</div></div>`}

function renderExplainer(hiLevel){const box=document.getElementById('explainer');if(!box)return;const lv=hiLevel==null?2:hiLevel;
 box.innerHTML=`<div class="section" id="sp"><div class="head"><span class="eyebrow">${esc(S.spEyebrow)}</span><h2>${esc(S.spH)}</h2><p class="lead">${esc(S.spLead)}</p></div>
  <div class="spiral"><div id="spsvg">${spiral(lv)}</div><div><div role="tablist">${LEVELS.map((l,k)=>k===0?'':`<button class="lvl-tab" role="tab" data-lv="${k}" aria-selected="${k===lv}" style="--c:${l.deep}"><span class="n">${l.num}</span><span><b>${l.num} — ${esc(t(l.name))}</b><small>${esc(t(l.sub))}</small></span></button>`).join('')}</div><div class="lvl-panel" id="lvlpanel"></div></div></div></div>
  <div class="section"><div class="head"><span class="eyebrow">${esc(S.specEyebrow)}</span><h2>${esc(S.specH)}</h2><p class="lead">${esc(S.specLead)}</p></div>
  <div class="grid">${SPECS.map(s=>`<button class="spec" data-s="${s.slug}" style="--c:${LEVELS[s.level].deep}"><img src="${photo(s)}" alt="${esc(s.name)}" loading="lazy"><span class="body"><b>${esc(s.name)}</b><small>${esc(t(s.spec))}</small><span class="lv">${L==='en'?'LEVEL':'NÍVEL'} ${LEVELS[s.level].num}</span><span class="more">${esc(t(s.bio))}</span><span class="progs">${s.programs.map(esc).join(' · ')}</span></span></button>`).join('')}</div></div>
  <div class="section" id="depos"><div class="head"><span class="eyebrow">${esc(S.depoEyebrow)}</span><h2>${esc(S.depoH)}</h2><p class="lead">${esc(S.depoLead)}</p>${MF.depoimentosAprovados?'':`<span class="pill check">⚠ ${esc(S.depoCheck)}</span>`}</div>
  <div class="depos">${DEPOS.map((d,k)=>{const sp=byName(SPECS.find(x=>x.slug===d.spec)?.name);return `<figure class="depo" style="--c:${sp?LEVELS[sp.level].deep:'var(--violet)'};animation-delay:${k*70}ms"><blockquote>“${esc(t(d.q))}”</blockquote><figcaption>${sp?`<img src="${photoSq(sp)}" alt="">`:''}<span><b>${esc(d.who)}${d.where?' · '+esc(d.where):''}</b><small>${esc(d.prog)}${sp?' · '+esc(sp.name):''}</small></span></figcaption></figure>`}).join('')}</div></div>
  <div class="section"><div class="head"><span class="eyebrow">${esc(S.howEyebrow)}</span><h2>${esc(S.howH)}</h2></div><div class="how">
   <div class="card"><span class="big">1</span><span class="eyebrow">${L==='en'?'Step':'Passo'} 1</span><h3>${esc(S.how1h)}</h3><p class="muted">${esc(S.how1)}</p></div>
   <div class="card"><span class="big">2</span><span class="eyebrow">${L==='en'?'Step':'Passo'} 2</span><h3>${esc(S.how2h)}</h3><p class="muted">${esc(S.how2)}</p></div>
   <div class="card"><span class="big">3</span><span class="eyebrow">${L==='en'?'Step':'Passo'} 3</span><h3>${esc(S.how3h)}</h3><p class="muted">${esc(S.how3)}</p></div></div></div>
  <div class="cta"><div><span class="eyebrow" style="color:#f1dca0">${esc(S.ctaEyebrow)}</span><h2 style="margin:8px 0 12px">${esc(S.ctaH)}</h2><p>${esc(S.ctaP)}</p></div><div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start"><a class="btn" id="cta" href="${cartaHref()}">${esc(S.ctaBtn)} →</a><button class="btn ghost" id="redo" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.3)">${hiLevel==null&&values.every(v=>v===null)?esc(S.start):esc(S.redo)}</button></div></div>`;
 const panel=()=>{const k=Number(box.querySelector('.lvl-tab[aria-selected=true]').dataset.lv);const l=LEVELS[k];const specs=SPECS.filter(s=>s.level===k);
  box.querySelector('#lvlpanel').innerHTML=`<span class="eyebrow" style="color:${l.deep}">${esc(S.inThisLevel)} · ${l.num}</span><h3 style="margin:6px 0 4px">${esc(t(l.name))}</h3><p class="muted" style="margin:0 0 8px">${esc(t(l.sub))}</p>
   <div class="muted" style="font-size:13px">${esc(S.areasIn)}: ${l.areas.map(i=>`<span class="pill" style="margin:2px 4px 2px 0"><i class="dotc" style="background:${AREAS[i].hex}"></i>${esc(lab(i))}</span>`).join('')}</div>
   <div class="faces">${specs.map(s=>`<button class="face" data-s="${s.slug}"><img src="${photoSq(s)}" alt=""><span><b>${esc(s.name)}</b><br><span class="muted" style="font-size:12px">${esc(s.programs[0])}</span></span></button>`).join('')}</div>`;
  box.querySelectorAll('.face').forEach(f=>f.onclick=()=>{const card=box.querySelector(`.spec[data-s="${f.dataset.s}"]`);if(card){card.classList.add('open');card.scrollIntoView({behavior:'smooth',block:'center'})}})};
 const select=k=>{box.querySelectorAll('.lvl-tab').forEach(b=>b.setAttribute('aria-selected',Number(b.dataset.lv)===k));box.querySelector('#spsvg').innerHTML=spiral(k);box.querySelectorAll('#spsvg text').forEach(x=>{x.style.animation='none';x.style.opacity='1'});box.querySelectorAll('path.arc').forEach(p=>{p.style.animation='none';p.style.strokeDashoffset='0';p.onclick=()=>{const kk=Number(p.dataset.lv);if(kk>0)select(kk)}});panel()};
 box.querySelectorAll('.lvl-tab').forEach(b=>b.onclick=()=>select(Number(b.dataset.lv)));
 box.querySelectorAll('path.arc').forEach(p=>p.onclick=()=>{const k=Number(p.dataset.lv);if(k>0)select(k)});
 box.querySelectorAll('.spec').forEach(c=>c.onclick=()=>c.classList.toggle('open'));
 box.querySelector('#redo').onclick=()=>{values=Array(8).fill(null);priority=null;extras={g:null,r:null};go(-1)};
 panel()}

function bindLang(){app.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{const p=new URLSearchParams(location.search);if(b.dataset.lang==='en')p.set('lang','en');else p.delete('lang');location.search=p.toString()})}
function go(n){step=n;if(n<0)vHero();else if(n<8)vQuestion(n);else vReveal(false);window.scrollTo({top:0,behavior:'instant'});const h=app.querySelector('h1,h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}
go(-1);
})();
