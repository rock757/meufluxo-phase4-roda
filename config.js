// MeuFluxo Phase 4 — configuração única. Editar SOMENTE aqui.
// Após qualquer mudança: abrir index.html, carta.html e obrigado.html no celular e no desktop antes de publicar.
window.MF_CONFIG = {
  revisao: false,        // true = mostra avisos internos e campos [a confirmar]; false = versão para clientes
  fechamento: 'A',     // 'A' (Ilimitado 5 anos) | 'B' (Jornada Completa 8 passos) | null = mostra os dois (revisão)
  checkoutUrl: 'https://checkout.payt.com.br/4ced8f35dc1c393cca8c3c80148b86b3?split=12',      // URL do checkout APROVADO (Payt), versão de 11/11 com split=12 (parcelamento em 12x). Vazio = nenhum botão de compra aparece. Não colocar carta= aqui: cada carta acrescenta a sua.
  depoimentosAprovados: false, // false = a seção de depoimentos mostra o aviso 'Em verificação'. true só com texto, programa e autorização confirmados.
  // Depoimentos DENTRO das cartas A/B (cartas/*.html): cada um tem um número T1…T28. Só aparecem para o público os que estiverem nesta lista,
  // ex.: ['T1','T5','T13'], ou 'todos'. Lista vazia = nenhum aparece para o público. Na prévia com ?revisao=1 todos aparecem, com etiqueta.
  depoimentosLiberados: ['T3','T17'],
  // Calendário da experiência, não um prazo de compra: Black Friday e depois o fim de novembro (BRT). lote.ativo=false até existir um lote real.
  campanha: { nome:'Black November', prazoTexto:'30 de novembro', prazoTextoEn:'November 30', contagemBlackFriday:'2026-11-27', contagemFimMes:'2026-11-30',
              // 11/11: a oferta deixou de anunciar data ('a qualquer momento essa oferta pode sair do ar'). semData:true tira TODAS as contagens
              // (carta, roda, resumo da oferta). Para voltar a mostrar a contagem até contagemFimMes, pôr false.
              semData:true, fraseUrgencia:'A qualquer momento essa oferta pode sair do ar. Quando sair, o preço volta para R$ 1.997.',
              lote:{ ativo:false, texto:'primeiro lote' },
              rodaValor:'R$197',   // valor de referência do presente (exibido em quiz.js)
              // números institucionais
              numeros:{ alunos:'mais de 50 mil', programas:'mais de 30', especialistas:'mais de 15', equipe:'mais de 20 pessoas', dieta:'mais de 60 mil alunos' } },
  prazoConfirmado: true,  // true = a condição vale até prazoTexto e a contagem vai até contagemFimMes
  jornadaPadrao: true,  // true = uma jornada recomendada igual para todos (ordem 1→8)
  downsellUrl: '',      // link da Jornada 8 programas (R$697) — válvula de escape no rodapé da carta; vazio = não aparece
  tracking: { gtm:'', ga4:'', metaPixel:'', endpoint:'/api/track' }, // vazios = só dataLayer + localStorage + /api/track
  dados: { endpoint:'/api/roda' }, // respostas da roda → Google Sheets via função serverless (ver api/roda.js); no-op até configurar
  // Teste A/B da carta: textos em cartas/carta-a.html e carta-b.html.
  splitTeste: { ativo:true, variantes:['A','B'] }, // desligar = false
  // Parâmetros de origem repassados do link de convite -> roda -> carta -> checkout, sem sobrescrever
  // parâmetros já presentes na URL do checkout (ex.: coupon, split).
  paramsRepassados: ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src','sck','xcod','ref','fbclid','gclid'],

  // Fatos comerciais. Vazio = a frase correspondente NÃO aparece para o cliente (em revisão aparece "[a confirmar]").
  oferta: {
    A: { nome: 'MeuFluxo Ilimitado — Versão Black November (5 anos)',
         preco: 'R$997 à vista',
         precoDe: 'R$ 1.997',     // preço de referência riscado no resumo da oferta (Nico 11/11: riscar o valor anterior); vazio = não aparece
         parcela: '12x de R$ 100,10',       // aparece em destaque no resumo da oferta e na barra fixa; vazio = volta o formato antigo (à vista primeiro)
         totalParcelado: 'R$ 1.201,20',     // 12 x 100,10. Conferir com o checkout sempre que a parcela mudar. Nunca dizer 'sem juros'.
         parcelas: 'ou em até 12x no cartão (valor total das parcelas informado no checkout)',
         acessoPrazo: 'por cinco anos, contados da confirmação do pagamento',
         garantia: 'Garantia de 7 dias: se não fizer sentido para você, peça o reembolso pelo suporte dentro desse prazo e devolvemos o valor integral.',
         inclusoes: 'todos os programas do MeuFluxo Ilimitado que estão na plataforma hoje, e os que forem lançados nos seus cinco anos de acesso',
         suporte: '',               // ex.: 'suporte@meufluxo.com'
         whatsapp: 'https://wa.me/5554997151575', // carta.js adiciona mensagem com ref da carta/origem
         entrega: '' },             // ex.: 'o acesso é liberado em até 24h após a aprovação do pagamento, pelo e-mail da compra'
    B: { nome: 'Jornada MeuFluxo — 8 Programas (1 ano)',
         preco: 'R$697 à vista',
         parcelas: 'ou em até 12x no cartão (valor total das parcelas informado no checkout)',
         acessoPrazo: 'por 12 meses, contados da confirmação do pagamento',
         garantia: 'Garantia de 7 dias: se não fizer sentido para você, peça o reembolso pelo suporte dentro desse prazo e devolvemos o valor integral.',
         inclusoes: '',
         suporte: '',
         entrega: '' }
  },

  // Oito áreas na ordem da espiral.
  // 'variantes' escolhe o programa pela resposta opcional (gênero em Movimento; filhos em Relacionamentos). Padrões = programas-vitrine dos especialistas.
  programas: [ // Ordem = espiral: 1 Propósito · 2 Saúde · 3 Alimentação · 4 Memória · 5 Prosperidade · 6 Relações · 7 Crescimento · 8 Espiritualidade. slug = id estável.
    { slug:'proposito',      area:'Propósito',      programa:'Desperte Seu Destino',  especialista:'Fernando Felix' },
    { slug:'movimento',      area:'Saúde',          programa:'Costas Sem Dores',      especialista:'Peterson Menezes',
      variantes:{ mulher:{programa:'Projeto Mulher 40+',especialista:'Suéllen Lopes'}, homem:{programa:'Meu Shape Ideal',especialista:'Mateus Cecconello'} } },
    { slug:'alimentacao',    area:'Alimentação',    programa:'Dieta das 3 Fases 2.0', especialista:'Eduardo Claas' },
    { slug:'memoria',        area:'Memória',        programa:'Ultra Inteligência',    especialista:'Dr. Marcelo Roxo' },
    { slug:'financas',       area:'Prosperidade',   programa:'Matriz da Abundância',  especialista:'Lucia Lux Tellaris' },
    { slug:'relacoes',       area:'Relações',       programa:'4 Códigos do Amor',     especialista:'Gabriela Barea',
      variantes:{ filhos:{programa:'Filhos Sem Conflitos',especialista:'Eddy Giordani'} } },
    { slug:'crescimento',    area:'Crescimento',    programa:'Restart Mental',        especialista:'Nereu Araldi' },
    { slug:'transcendencia', area:'Espiritualidade',programa:'Frequências da Vida',   especialista:'Zaika Capita' }
  ]
};


// Com prazoConfirmado: contagem até o fim da oferta (contagemFimMes). Sem prazo confirmado: só marcador de calendário (Black Friday, depois fim do mês).
window.MF_COUNTDOWN_LABEL = function(language, now) {
  const campaign = (window.MF_CONFIG && window.MF_CONFIG.campanha) || {};
  if (campaign.semData) return ''; // sem data anunciada: nenhuma contagem aparece
  const blackFriday = campaign.contagemBlackFriday || '2026-11-27';
  const monthEnd = campaign.contagemFimMes || '2026-11-30';
  const current = now instanceof Date ? now : new Date(now || Date.now());
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(current);
  const value = type => parts.find(part => part.type === type).value;
  const today = `${value('year')}-${value('month')}-${value('day')}`;
  const dayNumber = date => {
    const [year, month, day] = date.split('-').map(Number);
    return Date.UTC(year, month - 1, day) / 86400000;
  };
  const untilBlackFriday = dayNumber(blackFriday) - dayNumber(today);
  const untilMonthEnd = dayNumber(monthEnd) - dayNumber(today);
  const isEnglish = language === 'en';
  // Com prazo confirmado, a contagem vai até o fim da oferta.
  if (window.MF_CONFIG && window.MF_CONFIG.prazoConfirmado) {
    if (untilMonthEnd < 0) return '';
    if (untilMonthEnd === 0) return isEnglish ? 'Last day of the offer' : 'Último dia da oferta';
    return isEnglish
      ? `${untilMonthEnd} day${untilMonthEnd === 1 ? '' : 's'} left on the offer`
      : `Falta${untilMonthEnd === 1 ? '' : 'm'} ${untilMonthEnd} dia${untilMonthEnd === 1 ? '' : 's'} para o fim da oferta`;
  }

  if (today < blackFriday) {
    return isEnglish
      ? (untilBlackFriday === 1 ? 'Black Friday is tomorrow' : `${untilBlackFriday} days until Black Friday`)
      : (untilBlackFriday === 1 ? 'Amanhã é Black Friday' : `Faltam ${untilBlackFriday} dias para a Black Friday`);
  }
  if (today === blackFriday) return isEnglish ? "It's Black Friday!" : 'Hoje é Black Friday!';
  if (today <= monthEnd) {
    if (untilMonthEnd === 0) return isEnglish ? 'Last day of November' : 'Último dia de novembro!';
    return isEnglish
      ? `${untilMonthEnd} day${untilMonthEnd === 1 ? '' : 's'} until the end of November`
      : `Falta${untilMonthEnd === 1 ? '' : 'm'} ${untilMonthEnd} dia${untilMonthEnd === 1 ? '' : 's'} para o fim de novembro`;
  }
  return '';
};
