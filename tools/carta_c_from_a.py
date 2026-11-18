#!/usr/bin/env python3
"""Carta C = Carta A cortada pela CUB review (Rock, 18/11/2026). Gera cartas/carta-c.html a partir de cartas/carta-a.html.

Uso: python3 tools/carta_c_from_a.py   (rodar de novo se a Carta A mudar; confira as linhas antes)
Mantém o visual da A (capa, fotos, capas dos programas, áreas, oferta, garantia). Só corta parágrafos e encurta frases.
Depoimentos: ficam os aprovados (T3, T4, T5, T6, T17, em config.js depoimentosLiberados); os outros saem da C.
Presente físico: fica fora até a lista da Júlia.
"""
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = open(os.path.join(ROOT, 'cartas/carta-a.html'), encoding='utf-8').read().split('\n')
assert A[5].startswith('<h1 data-n="A2">Aqui está o segredo'), 'Carta A mudou: confira as linhas antes de gerar a C'
assert A[425] == '<!--RODAPE-->' and A[369] == '<!--OFERTA-->', 'Carta A mudou: confira as linhas antes de gerar a C'

DELETE = {19,20,21,22,23,24,25,26,27,28, 34, 53, 58,59, 68, 73, 76,77, 81,82, 84, 94, 96,97, 99, 107,108,
          114, 116, 119, 121,122,123, 131, 135,136, 139,140,141, 142, 144,145, 147,148, 155,156, 165,
          167, 169,170,171, 179, 185, 188, 191, 193, 196,197, 199,200, 204, 206, 208,209,210, 211,212,213,
          226,227, 230, 246, 256, 259,260,261, 262,263,264,265, 273,274, 283, 290,291,292,293, 302,303,304,305, 317,
          323,324, 327,328,329, 336, 338, 346, 349, 353,354,355,356,357, 363, 368,369, 383, 388,389,390,
          399,400, 403, 406, 413, 425,
          48, 52, 217,218, 240,241, 271, 285, 296, 320, 322,
          70, 75, 207, 221, 232, 268, 301, 341, 395, 407}
TEXT = {  # linha (1 = primeira) -> novo texto do <p> (mantém data-n e classe)
 245:'E com o Marcelo a gente tem mais cinco programas, como o Neuroprodutividade e o Reset de Dopamina.',
 16:'É ter do seu lado quem já sabe o caminho: profissionais que fazem isso todo dia no consultório e te dão um passo a passo que você aplica hoje.',
 17:'É isso que o MeuFluxo oferece. Então, primeiro, eu vou te mostrar quem são essas pessoas.',
 18:'Depois, por que tudo isso custa menos do que uma consulta com uma delas.',
 47:'São sete anos. E mais de 350 mil membros, no Brasil e no mundo.',
 93:'Eu entendo. Eu sei que a vida está corrida.',
 202:'Muita gente tenta o jejum sem orientação e desiste.',
 205:'O Jejum 2.0, do Lucas Mallmann, ensina mais de cinco protocolos, do iniciante ao avançado.',
 216:'O Emagrecer Sem Restrições, da Jaqueline Brihy, é para quem já fez dieta demais e quer comer sem paranoia.',
 272:'Para cuidar dos relacionamentos: com o marido, com os filhos, com quem você ama.',
 276:'O Filhos Sem Conflitos, da Eddy Giordani, ensina comunicação, vínculo e rotina entre pais e filhos.',
 321:'No Desperte Seu Destino, o método do Fernando Felix leva você da ideia para a execução.',
 30:'São mais de 15 especialistas e 56+ programas, nas oito áreas da sua roda. Olha a sua fatia mais fina e veja quem está atrás dela:',
 49:'Antes de colocar qualquer programa na plataforma, eu sento com o especialista e faço o programa junto com ele.',
 54:'Já testei coisa que eu não gostei. Não entrou.',
 61:'Vontade de mudar, quase todo mundo tem.',
 80:'A gente está vivendo mais anos. Mas tem muita gente que só sobrevive.',
 83:'E bem na hora em que a pessoa lutou a vida inteira para ter um dinheirinho guardado e uma chance de descansar, a saúde não acompanha.',
 95:'Quantas vezes você já ficou 40 minutos rolando a tela do celular?',
 98:'Dez minutinhos todo dia, por noventa dias, valem mais do que três horas num dia só.',
 103:'Você pode começar, parar, voltar.',
 110:'Quem se transforma tem três coisas. Ambiente. Sistema. Constância.',
 112:'Por que é mais fácil treinar na academia do que na sala de casa?',
 120:'No MeuFluxo, o seu ambiente passa a ter mais de 15 dos melhores especialistas do Brasil.',
 130:'A bússola te dá a direção. Mas você não sabe se tem um rio no caminho, uma montanha, quanto tempo vai levar.',
 132:'O GPS te dá o caminho, curva por curva.',
 133:'A maioria das pessoas tenta mudar com uma bússola: eu preciso emagrecer, eu preciso ter mais foco.',
 137:'O MeuFluxo é o GPS. Passo 1, passo 2, passo 3. Você não precisa adivinhar.',
 143:'O terceiro pilar é a constância. Água mole em pedra dura, tanto bate até que fura.',
 146:'A gota não é mais forte que a pedra. Mas a gota é constante.',
 149:'Transformação não é mágica.',
 154:'Você tem 5 anos para ser a gota.',
 168:'Dá vontade de entrar e fazer tudo, porque tudo é muito bom. Não precisa.',
 173:'Precisa melhorar a memória? Assiste a aula de memória.',
 176:'Olha para ela mais uma vez. Fica com a área que você escolheu.',
 178:'Aqui vai, rápido, o que te espera em cada área. Começa pela sua.',
 186:'A Dieta das 3 Fases 2.0, do Eduardo, é a nossa campeã: best-seller há quatro, cinco anos, com mais de 60 mil alunos. É quase um Maracanã inteiro.',
 192:'Tem também o Reset Digestivo, um protocolo de 7 dias, e o Ciclo de Dietas.',
 194:'A fila para se consultar com o Eduardo leva meses.',
 229:'O Meu Shape Ideal, do Mateus Cecconello, é um calendário de treinos: você dá o play e faz junto com ele.',
 231:'Ajuda a diminuir gordura e ganhar massa muscular, preservando ombro, quadril e joelhos.',
 254:'A Lucia atendia gente do mundo inteiro quando morava na França.',
 255:'E entendeu os padrões que travam a vida financeira. O Matriz da Abundância são oito meditações guiadas.',
 258:'Os áudios ajudam a soltar os bloqueios mentais e emocionais ligados a dinheiro e a merecimento.',
 288:'Trabalha as memórias da infância, quando a personalidade se forma.',
 289:'São nove áudios de reprogramação profunda. Uma espécie de renascimento.',
 300:'Você pode ouvir ao acordar, dirigindo, antes de dormir.',
 309:'São frequências feitas por músicos, com instrumentos reais.',
 326:'O que as pessoas contam, área por área:',
 333:'Você nunca mais precisa adivinhar o próximo passo.',
 337:'Nada aqui substitui remédio ou tratamento. É algo que complementa.',
 347:'Imagina procurar hoje três especialistas: um para fazer terapia, um personal trainer e um nutricionista.',
 348:'Cada um por fora, você gastaria pelo menos R$ 1.300 por mês. Em cinco anos, R$ 78 mil.',
 351:'E para marcar com alguns deles, você espera três, seis meses.',
 361:'São 5 anos de acesso, contados da confirmação do pagamento. Todos os 56+ programas que estão na plataforma hoje.',
 376:'Pensa nos primeiros 7 dias como um teste grátis: se você sentir que não é para você, pede o reembolso pelo suporte e a gente devolve cada real.',
 382:'O outro é o calendário. Você conhece a cena: as promessas de fim de ano, a primeira semana de janeiro.',
 391:'A sua roda é a foto do antes. Daqui a seis meses, desenha de novo e veja o quanto mudou.',
 402:'Tudo fica no aplicativo do MeuFluxo, na palma da sua mão.',
 405:'Só para você ter uma ideia: a gente investiu mais de 1,2 milhão de reais, 18 meses de trabalho e mais de 40 pessoas nesse aplicativo.',
 409:'As instruções de acesso chegam no seu email depois da confirmação do pagamento.',
 411:'Toca em “Preciso de ajuda para comprar” e fala com o nosso time.',
 415:'Se você está aqui hoje, é porque alguma coisa em você quer mais.',
 423:'P.P.S. Os primeiros 7 dias são um teste grátis. Faz a primeira aula hoje à noite e você vai saber.',
}
WALL = {'Saúde':['mais energia e disposição','dormir melhor','costas sem dor'],
        'Alimentação':['intestino funcionando','menos inchaço','a vontade de doce que some'],
        'Memória':['foco','ler mais rápido','lembrar o nome de quem você acabou de conhecer'],
        'Prosperidade':['sentir que merece ter dinheiro'],
        'Relações':['autoestima','paz com os filhos e com os seus próprios pais'],
        'Crescimento':['rotina e constância','ser um pouco melhor do que ontem'],
        'Espiritualidade':['paz interior','menos ansiedade','um sono mais fundo'],
        'Propósito':['transformar sonhos em ação']}

def set_p(line, txt):
    m = re.match(r'^(<p[^>]*>)(.*)(</p>)$', line)
    assert m, 'não é um <p> simples: ' + line[:80]
    inner = m.group(2)
    for tag in ('em', 'strong'):  # mantém o estilo do parágrafo (itálico/negrito)
        if inner.startswith('<%s>' % tag): return m.group(1) + '<%s>%s</%s>' % (tag, txt, tag) + m.group(3)
    return m.group(1) + txt + m.group(3)

out = []
for n, line in enumerate(A, 1):
    if n in DELETE: continue
    if n == 1: line = '<!-- MeuFluxo · Black November · Carta C · Carta A cortada pela CUB review (18/11/2026) · gerado por tools/carta_c_from_a.py: não editar à mão -->'
    elif n in TEXT: line = set_p(line, TEXT[n])
    elif n == 330: line = '<div class="cf-wall">' + ''.join('<div class="cf-wg"><b>%s</b><ul>%s</ul></div>' % (k, ''.join('<li>%s</li>' % x for x in v)) for k, v in WALL.items()) + '</div>'
    elif n == 371: line = line.replace('Experimente por 7 dias. Não é para você? Cada real volta. Sem perguntas.', 'Experimente por 7 dias, de graça. Não é para você? Cada real volta.')
    out.append(line)
open(os.path.join(ROOT, 'cartas/carta-c.html'), 'w', encoding='utf-8').write('\n'.join(out))
print('carta-c.html:', len(out), 'linhas')
