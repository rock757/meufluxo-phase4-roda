// MeuFluxo Phase 4 — configuração única. Editar SOMENTE aqui.
// Após qualquer mudança: abrir index.html, carta.html e obrigado.html no celular e no desktop antes de publicar.
window.MF_CONFIG = {
  revisao: true,        // true = mostra avisos internos e campos [a confirmar]; false = versão para clientes
  fechamento: null,     // 'A' (Ilimitado 5 anos) | 'B' (Jornada Completa 8 passos) | null = mostra os dois (revisão)
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

  // Plano B — um programa por área da roda. Ordem = ordem canônica da roda. Slugs batem com app.js.
  // 'alternativa' é só registro interno para decisão; não aparece para o cliente.
  programas: [
    { slug:'proposito',      area:'Realização e propósito',            programa:'Desperte Seu Destino',      especialista:'Fernando Felix',    alternativa:'A Jornada MeuFluxo (Nicolas Toigo) — confirmar se é produto pago ou teaser gratuito' },
    { slug:'alimentacao',    area:'Alimentação e disposição',          programa:'Emagrecer Sem Restrições',  especialista:'Jaqueline Brihy',   alternativa:'Dieta das 3 Fases 2.0 (Eduardo Claas) — alto risco de o cliente já possuir' },
    { slug:'movimento',      area:'Movimento e cuidado com o corpo',   programa:'Meu Shape Ideal',           especialista:'Mateus Cecconello', alternativa:'Costas Sem Dores (Peterson Menezes)' },
    { slug:'aprendizado',    area:'Aprendizado e clareza para decidir',programa:'15 Ferramentas da Alta Performance', especialista:'Dr. Marcelo Roxo', alternativa:'Ultra Inteligência (Marcelo Roxo) — alto risco de o cliente já possuir' },
    { slug:'financas',       area:'Organização e segurança financeira',programa:'Matriz da Abundância',      especialista:'Lucia Lux Tellaris',alternativa:'Bioenergia do Dinheiro (Zaika Capita)' },
    { slug:'relacoes',       area:'Relações e convivência',            programa:'4 Códigos do Amor',         especialista:'Gabriela Barea',    alternativa:'Filhos Sem Conflitos (Eddy Giordani)' },
    { slug:'crescimento',    area:'Autoestima e crescimento pessoal',  programa:'Restart Mental',            especialista:'Nereu Araldi',      alternativa:'Novo Profissional 3R (Roberta Desnos)' },
    { slug:'espiritualidade',area:'Vida interior e espiritualidade',   programa:'Estado Delta',              especialista:'Ariosto Mello',     alternativa:'Frequências da Vida (Zaika Capita)' }
  ]
};
