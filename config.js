// MeuFluxo Phase 4 — configuração única. Editar SOMENTE aqui.
// Após qualquer mudança: abrir index.html, carta.html e obrigado.html no celular e no desktop antes de publicar.
window.MF_CONFIG = {
  revisao: false,        // true = mostra avisos internos e campos [a confirmar]; false = versão para clientes
  fechamento: 'A',     // 'A' (Ilimitado 5 anos) | 'B' (Jornada Completa 8 passos) | null = mostra os dois (revisão)
  checkoutUrl: '',      // URL do checkout APROVADO (Payt). Vazio = nenhum botão de compra aparece.
  depoimentosAprovados: false, // false = a seção de depoimentos mostra o aviso 'Em verificação'. true SOMENTE após Gabi/Júlia confirmarem texto, programa e autorização (LEIA-ME de 29/10).
  // Campanha (Rock 2026-11-05: urgência real, datas reais). PROPOSTO até Rock confirmar: prazo = Black Friday 27/11/2026 23:59 BRT. lote.ativo=false até existir um lote real.
  campanha: { nome:'Black November', prazoTexto:'27 de novembro, Black Friday', prazoTextoEn:'November 27, Black Friday', prazoISO:'2026-11-27T23:59:00-03:00',
              lote:{ ativo:false, texto:'primeiro lote' },
              rodaValor:'',        // vazio até Rock confirmar um preço realmente praticado para a Roda (feedback 05/11: não riscar valor que nunca foi cobrado).   // PROPOSTO (Rock 05/11): valor 'normal' da Roda, riscado → GRÁTIS no Black November. Confirmar que esse preço existiu/existe antes de publicar.
              // Números ditos pelo Nicolas nas lives (BF 2025 / Ilimitado 2026): HISTÓRICOS; confirmar antes de publicar.
              numeros:{ alunos:'mais de 50 mil', programas:'mais de 30', especialistas:'mais de 15', equipe:'mais de 20 pessoas', dieta:'mais de 60 mil alunos' } },
  jornadaPadrao: true,  // Rock 05/11 15:xx: no lançamento, UMA jornada recomendada igual para todos (ordem 1→8). As variantes por prioridade/gênero/filhos ficam no código, desligadas.
  downsellUrl: '',      // link da Jornada 8 programas (R$697) — válvula de escape no rodapé da carta; vazio = não aparece
  tracking: { gtm:'', ga4:'', metaPixel:'', endpoint:'/api/track' },
  // Rastreador CENTRAL (plataforma tracking-meufluxo, Vini). VERIFICADO 2026-11-06 19:40 BRT, somente leitura:
  //  · script público t.js (idêntico em tracking-meufluxo.vercel.app e dados.meufluxoultrainteligencia.com); chave da página = data-funil
  //  · funil existente 'Fase 3 - Black November' = chave 'black-november-bf' → Pixel Meta 'MF - BLACK FRIDAY 2026' (1120529180840486), GA4 nenhum
  //  · a venda do Payt chega pelo webhook central e vira 1 Purchase por transação (event_id pur_<chave Payt>), casada por trck_user_id → e-mail → telefone
  // ativo:false = NADA é enviado ao central (sem PageView, pixel ou etapa). Ligar SÓ com aprovação do Rock de que a Fase 4 usa esse funil/pixel.
  central: { ativo:false, script:'https://dados.meufluxoultrainteligencia.com/t.js', funil:'black-november-bf', etapas:true },
 // IDs do Vini/Hergamenes. Vazios = só dataLayer + localStorage + /api/track (no-op até configurar)
  dados: { endpoint:'/api/roda' }, // respostas da roda → Google Sheets via função serverless (ver api/roda.js); no-op até configurar
  // Parâmetros de origem repassados do link de convite -> roda -> carta -> checkout, sem sobrescrever
  // parâmetros já presentes na URL do checkout (ex.: coupon, split). Confirmar com Évila o que o Payt grava.
  paramsRepassados: ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src','sck','xcod','ref','fbclid','gclid'],

  // Fatos comerciais CONFIRMADOS por Rock 2026-11-04 ~20:50 BRT: A = Ilimitado Black November R$997 / 5 anos; B (downsell) = 8 programas R$697 / 1 ano; ambos garantia 7 dias. Parcelas: 12x 'um pouco mais' — total exato só no checkout (Évila). Suporte/entrega ainda vazios.
  // Fatos comerciais. Vazio = a frase correspondente NÃO aparece para o cliente (em revisão aparece "[a confirmar]").
  oferta: {
    A: { nome: 'MeuFluxo Ilimitado — Versão Black November (5 anos)',
         preco: 'R$997 à vista',
         precoDe: '',             // vazio até existir preço de referência comprovado (feedback 05/11).       // PROPOSTO (Rock 05/11): preço de referência riscado acima do R$997. Confirmar preço real praticado antes de publicar.
         parcelas: 'ou em até 12x no cartão (valor total das parcelas informado no checkout)',
         acessoPrazo: 'por cinco anos, contados da confirmação do pagamento',
         garantia: 'Garantia de 7 dias: se não fizer sentido para você, peça o reembolso pelo suporte dentro desse prazo e devolvemos o valor integral.',
         inclusoes: 'todos os programas do MeuFluxo Ilimitado disponíveis hoje na plataforma',
         suporte: '',               // ex.: 'suporte@meufluxo.com'
         whatsapp: '',              // link wa.me do comercial (Rebecca) — só aparece quando preenchido e confirmado (nome, horário, finalidade)
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

  // Oito áreas na ordem da espiral (CONFIRMADO por Rock, 2026-11-04). 2026-11-05: a semente é a própria Roda da Vida (autoavaliação com o Nicolas), já feita; o Nicolas não tem programa próprio ainda.
  // 'variantes' escolhe o programa pela resposta opcional (gênero em Movimento; filhos em Relacionamentos). Padrões = programas-vitrine dos especialistas.
  programas: [ // Ordem = espiral (Rock 2026-11-05): 1 Propósito · 2 Saúde · 3 Alimentação · 4 Memória · 5 Prosperidade · 6 Relações · 7 Crescimento · 8 Espiritualidade. slug = id estável.
    { slug:'proposito',      area:'Propósito',      programa:'Desperte Seu Destino',  especialista:'Fernando Felix' }, // 2026-11-05 Rock: a Jornada do Nicolas ainda não existe; a semente é a própria Roda (autoavaliação), ver trilha.js
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
