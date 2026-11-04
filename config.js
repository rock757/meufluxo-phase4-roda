// MeuFluxo Phase 4 — configuração única. Editar SOMENTE aqui.
// Após qualquer mudança: abrir index.html, carta.html e obrigado.html no celular e no desktop antes de publicar.
window.MF_CONFIG = {
  revisao: false,        // true = mostra avisos internos e campos [a confirmar]; false = versão para clientes
  fechamento: 'A',     // 'A' (Ilimitado 5 anos) | 'B' (Jornada Completa 8 passos) | null = mostra os dois (revisão)
  checkoutUrl: '',      // URL do checkout APROVADO (Payt). Vazio = nenhum botão de compra aparece.
  // Parâmetros de origem repassados do link de convite -> roda -> carta -> checkout, sem sobrescrever
  // parâmetros já presentes na URL do checkout (ex.: coupon, split). Confirmar com Évila o que o Payt grava.
  paramsRepassados: ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src','sck','xcod','ref','fbclid','gclid'],

  // Fatos comerciais. Vazio = a frase correspondente NÃO aparece para o cliente (em revisão aparece "[a confirmar]").
  oferta: {
    A: { nome: 'MeuFluxo Ilimitado — 5 anos',
         preco: '',                 // ex.: 'R$997 à vista'
         parcelas: '',              // ex.: 'ou 12x de R$97,00 (total R$1.164,00)'  — só se confirmado, com total
         acessoPrazo: '',           // ex.: 'por cinco anos, contados da confirmação do pagamento'
         garantia: '',              // ex.: 'Garantia de 7 dias: peça o reembolso pelo suporte e devolvemos o valor.'
         inclusoes: '',             // ex.: 'todos os programas atuais do MeuFluxo Ilimitado' (+ novos lançamentos SÓ se confirmado)
         suporte: '',               // ex.: 'suporte@meufluxo.com'
         entrega: '' },             // ex.: 'o acesso é liberado em até 24h após a aprovação do pagamento, pelo e-mail da compra'
    B: { nome: 'Jornada Completa MeuFluxo — 8 Passos',
         preco: '',                 // ex.: 'R$779 à vista'
         parcelas: '',
         acessoPrazo: '',           // ex.: 'por 12 meses' / 'vitalício' — CONFIRMAR com Gabi
         garantia: '',
         inclusoes: '',
         suporte: '',
         entrega: '' }
  },

  // Oito áreas na ordem da espiral (CONFIRMADO por Rock, 2026-11-04). Propósito (Nico) é a semente: incluído em qualquer compra, nunca vendido aqui.
  // 'variantes' escolhe o programa pela resposta opcional (gênero em Movimento; filhos em Relacionamentos). Padrões = programas-vitrine dos especialistas.
  programas: [
    { slug:'proposito',       area:'Propósito',                              programa:'A Jornada MeuFluxo',       especialista:'Nicolas Toigo',     incluido:true },
    { slug:'alimentacao',     area:'Alimentação e metabolismo',              programa:'Dieta das 3 Fases 2.0',    especialista:'Eduardo Claas' },
    { slug:'movimento',       area:'Movimento, estrutura e dores',           programa:'Costas Sem Dores',         especialista:'Peterson Menezes',
      variantes:{ mulher:{programa:'Projeto Mulher 40+',especialista:'Suéllen Lopes'}, homem:{programa:'Meu Shape Ideal',especialista:'Mateus Cecconello'} } },
    { slug:'memoria',         area:'Memória, foco e inteligência',           programa:'Ultra Inteligência',       especialista:'Dr. Marcelo Roxo' },
    { slug:'financas',        area:'Segurança e prosperidade financeira',    programa:'Matriz da Abundância',     especialista:'Lucia Lux Tellaris' },
    { slug:'relacoes',        area:'Relacionamentos sociais e familiares',   programa:'4 Códigos do Amor',        especialista:'Gabriela Barea',
      variantes:{ filhos:{programa:'Filhos Sem Conflitos',especialista:'Eddy Giordani'} } },
    { slug:'crescimento',     area:'Autoestima e crescimento pessoal',       programa:'Restart Mental',           especialista:'Nereu Araldi' },
    { slug:'transcendencia',  area:'Auto-transcendência: energia e espiritualidade', programa:'Frequências da Vida', especialista:'Zaika Capita' }
  ]
};
