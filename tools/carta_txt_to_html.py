#!/usr/bin/env python3
"""Carta VSLORG pass 2 (texto exportado do .docx) -> HTML do slot do teste A/B + cópia limpa em .md + log.

Uso: python3 tools/carta_txt_to_html.py CARTA.txt cartas/carta-a.html --md BACKUP.md --log LOG.md

Remove: cabeçalho/nota de montagem, rótulos "# Lead"/"# Corpo", linhas "EN: ...", linhas de quem fala/minutagem
("Nico · [BF 28:02] ..."), notas ⚑, e tudo a partir de "## Readability". Troca a parede de benefícios em inglês
pela versão pt-BR de tools/carta_wall_ptbr.html. Segura (fora do ar até o Rock confirmar) as frases em HOLD.
Põe o bloco da oferta antes de "## No dia 1º de dezembro". Não escreve nem traduz nada além da parede.
"""
import argparse, html, os, re, sys

HOLD = {  # trecho exato -> motivo
    'A gente deixou algumas aulas liberadas': 'nota ⚑: confirmar que as aulas grátis seguem abertas no app antes de publicar',
    'A gente não para de lançar coisa nova. Esse ano': 'nota ⚑: contagem de lançamentos é de setembro de 2026; trocar pelo total real',
}
SPEAKER = re.compile(r'^[A-ZÀ-Ý][\wÀ-ÿ .]{1,40} · \[[^\]]*\]')
WALL_START, WALL_KEYS = '**Propósito: **', ('**Propósito: **', '**Saúde: **', '**Alimentação: **', '**Memória: **', '**Prosperidade: **', '**Relações: **', '**Crescimento: **', '**Espiritualidade: **', '**Across all eight: **')
OFERTA_BEFORE = '## No dia 1º de dezembro'

def inline(t):
    t = html.escape(t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', t)
    return t.strip()

def convert(lines, wall_html):
    out, md, log, wall_done = [], [], [], False
    for raw in lines:
        s = raw.strip()
        if not s: continue
        if s.startswith('## Readability'):
            log.append(('rodapé de métricas e tudo depois', s)); break
        if s.startswith('VSLORG · ') or s.startswith('Built 20'): log.append(('cabeçalho', s[:120])); continue
        if s in ('# Lead', '# Corpo (compartilhado)'): log.append(('rótulo de seção', s)); continue
        if s.startswith('EN:'): log.append(('linha EN', s[:100])); continue
        if SPEAKER.match(s): log.append(('fala/minutagem', s)); continue
        if s.startswith('*⚑') or s.startswith('⚑'): log.append(('nota ⚑', s[:160])); continue
        if s == '## P.S.': log.append(('título P.S. (repetido no texto)', s)); continue
        if s.startswith(WALL_KEYS):
            log.append(('parede em inglês -> pt-BR', s[:60]))
            if not wall_done:
                out.append(wall_html.strip()); md.append(re.sub(r'<!--.*?-->', '', wall_html, flags=re.S).strip()); wall_done = True
            continue
        held = next((k for k in HOLD if s.startswith(k)), None)
        if held:  # fica fora do HTML publicado (o arquivo é público); só no log
            log.append(('SEGURADO: ' + HOLD[held], s[:120])); continue
        if s.startswith(OFERTA_BEFORE): out.append('<!--OFERTA-->'); md.append('[BLOCO DA OFERTA: R$997, checkout Payt, garantia]')
        if s.startswith('## '):
            out.append(f'<h2>{inline(s[3:])}</h2>'); md.append(s)
        else:
            out.append(f'<p>{inline(s)}</p>'); md.append(s)
    return out, md, log, wall_done

def main(argv=None):
    a = argparse.ArgumentParser(); a.add_argument('src'); a.add_argument('out'); a.add_argument('--md', required=True); a.add_argument('--log', required=True)
    o = a.parse_args(argv)
    wall = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'carta_wall_ptbr.html'), encoding='utf-8').read()
    out, md, log, wall_done = convert(open(o.src, encoding='utf-8').read().splitlines(), wall)
    if not out or not wall_done or '<!--OFERTA-->' not in out:
        print('ERRO: texto vazio, parede ou ponto da oferta não encontrados; nada gravado.', file=sys.stderr); return 2
    name = os.path.basename(o.src)
    open(o.out, 'w', encoding='utf-8').write('\n'.join(out) + '\n')  # sem cabeçalho: o arquivo é servido publicamente
    open(o.md, 'w', encoding='utf-8').write('\n\n'.join(md) + '\n')
    nums = sorted({m.group(0) for l in md for m in re.finditer(r'R\$ ?\d[\d.,]*(?: mil)?|\b\d[\d.,]*(?: mil| milhão| milhões)?\b(?= ?(?:pessoas|membros|plays|acessos|programas|especialistas|aulas|anos|meses|dias|mil|reais|%))', l)})
    lines = [f'# Log {name}', '', f'Blocos no ar: {len(out)}. Removidos/segurados: {len(log)}.', '', '## Segurados (voltam só com o ok do Rock)', '']
    lines += [f'- {k[10:]}: {t}' for k, t in log if k.startswith('SEGURADO')] or ['- nenhum']
    lines += ['', '## Removidos (não são texto para o leitor)', ''] + [f'- **{k}:** {t}' for k, t in log if not k.startswith('SEGURADO')]
    lines += ['', '## Números no texto publicado (conferir)', ''] + [f'- {n}' for n in nums]
    open(o.log, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print(f'ok {name}: {len(out)} blocos, {len(log)} remoções, {sum(1 for k,_ in log if k.startswith("SEGURADO"))} segurados')
    return 0

if __name__ == '__main__':
    sys.exit(main())
