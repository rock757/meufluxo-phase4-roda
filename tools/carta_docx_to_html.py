#!/usr/bin/env python3
"""Converte a carta VSLORG (.docx, pass 2 pt-BR) no HTML do slot do teste A/B.

Uso:  python3 tools/carta_docx_to_html.py CARTA.docx cartas/carta-a.html [--log CARTA.log.md]  (padrão: ao lado do .docx, nunca dentro do site) [--keep-flagged]

Regras (e por quê):
  - Mantém o texto da carta: parágrafos escuros (conectivos) e verdes (falas do Nico/especialistas), com negrito/itálico.
  - Remove o título do documento, os rótulos de seção ("Lead", "Corpo (compartilhado)") e tudo a partir de "Readability".
  - Remove linhas de apoio: texto cinza ou pequeno (≤ 10 pt) = linha-guia em inglês, Flesch, notas de montagem.
  - Remove bandeiras vermelhas (⚑ ou texto vermelho) E o bloco de texto logo antes de cada uma (é o que a bandeira
    aponta: número não confirmado, permissão etc.). --keep-flagged mantém o bloco e remove só a nota.
  - Cada remoção vai para o log com o texto, para revisão. Números que sobraram no texto também são listados.
  - Uma linha só com OFERTA vira o marcador de oferta do slot.
Não inventa nem traduz nada: só copia ou remove.
"""
import argparse, html, re, sys
from docx import Document
from docx.shared import Pt

STOP_HEADINGS = {'readability', 'legibilidade'}
LABEL_HEADINGS = {'lead', 'corpo', 'corpo (compartilhado)', 'body', 'body (shared)'}


def rgb(run):
    try:
        c = run.font.color
        return tuple(c.rgb) if c is not None and c.type is not None and c.rgb is not None else None
    except Exception:
        return None


def is_gray(c):
    return c is not None and abs(c[0] - c[1]) < 24 and abs(c[1] - c[2]) < 24 and 70 <= c[0] <= 200


def is_red(c):
    return c is not None and c[0] >= 150 and c[1] < 90 and c[2] < 90


def size(run, para):
    s = run.font.size or (para.style.font.size if para.style is not None and para.style.font is not None else None)
    return s.pt if s is not None else None


def classify(p):
    text = p.text.strip()
    style = (p.style.name if p.style is not None else '') or ''
    runs = [r for r in p.runs if r.text.strip()]
    if not text:
        return 'empty'
    if '⚑' in text or (runs and any(is_red(rgb(r)) for r in runs)):
        return 'flag'
    if style.startswith('Title') or style == 'Heading 0':
        return 'title'
    if style.startswith('Heading'):
        t = text.lower()
        if t in STOP_HEADINGS:
            return 'stop'
        if t in LABEL_HEADINGS or t.startswith('vslorg'):
            return 'label'
        return 'heading'
    if runs and all(is_gray(rgb(r)) or (size(r, p) or 99) <= 10 for r in runs):
        return 'helper'
    if text.strip().upper() == 'OFERTA':
        return 'oferta'
    return 'body'


def runs_html(p):
    out = []
    for r in p.runs:
        if not r.text:
            continue
        if is_gray(rgb(r)) or (size(r, p) or 99) <= 10:  # nota cinza dentro de um parágrafo de texto
            continue
        t = html.escape(r.text)
        if r.bold:
            t = f'<b>{t}</b>'
        if r.italic:
            t = f'<i>{t}</i>'
        out.append(t)
    return ''.join(out).strip()


def convert(src, keep_flagged=False):
    doc = Document(src)
    html_blocks, log = [], []   # html_blocks: (html, plain_text)
    stopped = False
    for i, p in enumerate(doc.paragraphs):
        kind = 'stopped' if stopped else classify(p)
        txt = p.text.strip()
        if kind == 'stop':
            stopped = True
            log.append(('seção de métricas e tudo depois', txt))
            continue
        if kind in ('empty',):
            continue
        if kind in ('stopped', 'title', 'label', 'helper'):
            log.append(({'stopped': 'depois de Readability', 'title': 'título', 'label': 'rótulo de seção', 'helper': 'linha de apoio (cinza/pequena)'}[kind], txt))
            continue
        if kind == 'flag':
            log.append(('bandeira vermelha', txt))
            if not keep_flagged and html_blocks:
                prev = html_blocks.pop()
                log.append(('bloco apontado pela bandeira', prev[1]))
            continue
        if kind == 'oferta':
            html_blocks.append(('<!--OFERTA-->', 'OFERTA'))
            continue
        inner = runs_html(p)
        if not inner:
            log.append(('linha de apoio (cinza/pequena)', txt))
            continue
        tag = 'h2' if kind == 'heading' else ('blockquote' if (p.style is not None and 'Quote' in (p.style.name or '')) else 'p')
        if tag == 'p' and 'List' in ((p.style.name if p.style is not None else '') or ''):
            tag = 'li'
        html_blocks.append((f'<{tag}>{inner}</{tag}>', re.sub(r'<[^>]+>', '', html.unescape(inner))))
    # junta <li> seguidos em <ul>
    out, in_list = [], False
    for h, _ in html_blocks:
        if h.startswith('<li>') and not in_list:
            out.append('<ul>'); in_list = True
        if not h.startswith('<li>') and in_list:
            out.append('</ul>'); in_list = False
        out.append(h)
    if in_list:
        out.append('</ul>')
    numbers = sorted({m.group(0) for _, t in html_blocks for m in re.finditer(r'R\$\s?\d[\d.,]*|\b\d[\d.,]*\s?(?:%|mil|programas?|especialistas?|anos?|dias?|alunos?|x)\b', t)})
    return '\n'.join(out) + '\n', log, numbers, len(html_blocks)


def main(argv=None):
    a = argparse.ArgumentParser()
    a.add_argument('docx'); a.add_argument('out'); a.add_argument('--log'); a.add_argument('--keep-flagged', action='store_true')
    o = a.parse_args(argv)
    body, log, numbers, n = convert(o.docx, o.keep_flagged)
    if n == 0:
        print('ERRO: nenhum parágrafo de texto encontrado; nada gravado.', file=sys.stderr); return 2
    open(o.out, 'w', encoding='utf-8').write(f'<!-- Gerado de {o.docx.split("/")[-1]} por tools/carta_docx_to_html.py. Revisar o log antes de publicar. -->\n' + body)
    lines = [f'# Log: {o.docx.split("/")[-1]} -> {o.out}', '', f'Blocos mantidos: {n}. Removidos: {len(log)}.', '', '## Removido', '']
    lines += [f'- **{k}:** {t[:300]}' for k, t in log] or ['- nada']
    lines += ['', '## Números que ficaram no texto (conferir)', ''] + ([f'- {x}' for x in numbers] or ['- nenhum'])
    logp = o.log or re.sub(r'\.docx$', '', o.docx) + '.log.md'  # ao lado do .docx, fora do site (o log tem notas internas)
    open(logp, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print(f'ok: {n} blocos -> {o.out}; {len(log)} remoções -> {logp}; {len(numbers)} números para conferir')
    return 0


if __name__ == '__main__':
    sys.exit(main())
