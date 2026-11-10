"""python3 tests/test_carta_converter.py  (needs python-docx). Builds a synthetic pass-2 docx shaped like the VSLORG builder output."""
import os, sys, tempfile, subprocess
from docx import Document
from docx.shared import Pt, RGBColor
HERE = os.path.dirname(os.path.abspath(__file__)); TOOL = os.path.join(HERE, '..', 'tools', 'carta_docx_to_html.py')
GRAY, GREEN, RED = RGBColor(0x88, 0x88, 0x88), RGBColor(0x1F, 0x7A, 0x3E), RGBColor(0xC0, 0x1C, 0x1C)
def build(path):
    d = Document()
    d.add_heading('VSLORG · Pass 2 · Carta A', level=0)
    p = d.add_paragraph(); r = p.add_run('Built 2026-11-09 19:10 BRT. Native pt-BR. Dark = connective ...'); r.font.color.rgb = GRAY; r.font.size = Pt(9)
    d.add_heading('Lead', level=1)
    d.add_paragraph('Você já sentiu que falta tempo para cuidar de si?')
    p = d.add_paragraph(); r = p.add_run('You have felt there is no time to look after yourself? · Flesch-PT ≈78'); r.font.color.rgb = GRAY; r.font.size = Pt(9)
    p = d.add_paragraph(); r = p.add_run('“A gente começa pelo que dá.” '); r.font.color.rgb = GREEN; r2 = p.add_run('Nico'); r2.bold = True
    d.add_paragraph('São 56 programas por R$297 cada, se comprados avulsos.')
    p = d.add_paragraph(); r = p.add_run('⚑ Confirmar preço avulso antes de publicar.'); r.font.color.rgb = RED; r.italic = True; r.font.size = Pt(8.5)
    d.add_heading('Corpo (compartilhado)', level=1)
    d.add_heading('O que muda em 5 anos', level=2)
    d.add_paragraph('Primeiro item', style='List Bullet'); d.add_paragraph('Segundo item <com> & símbolos', style='List Bullet')
    d.add_paragraph('OFERTA')
    d.add_paragraph('Até 30 de novembro, por R$997 à vista.')
    d.add_heading('Readability', level=2)
    d.add_paragraph('Connective pt-BR: 12 blocks, 11.2 words/sentence')
    d.save(path)
def main():
    tmp = tempfile.mkdtemp(); src = os.path.join(tmp, 'Carta-A.docx'); out = os.path.join(tmp, 'carta-a.html'); build(src)
    r = subprocess.run([sys.executable, TOOL, src, out], capture_output=True, text=True); assert r.returncode == 0, r.stderr
    h = open(out, encoding='utf-8').read(); log = open(os.path.join(tmp, 'Carta-A.log.md'), encoding='utf-8').read()
    checks = {
      'keeps dark connective text': 'Você já sentiu que falta tempo para cuidar de si?' in h,
      'keeps green quote with bold name': '“A gente começa pelo que dá.” <b>Nico</b>' in h,
      'drops gray English helper line': 'You have felt' not in h and 'Flesch' not in h,
      'drops title, build note, section labels': 'VSLORG' not in h and 'Built 2026' not in h and '<h2>Lead</h2>' not in h and 'Corpo (compartilhado)' not in h,
      'drops red flag and the flagged block': '⚑' not in h and '56 programas' not in h and 'R$297' not in h,
      'keeps real subheading': '<h2>O que muda em 5 anos</h2>' in h,
      'bullets become escaped <ul>': '<ul>\n<li>Primeiro item</li>\n<li>Segundo item &lt;com&gt; &amp; símbolos</li>\n</ul>' in h,
      'OFERTA line becomes marker': '\n<!--OFERTA-->\n' in h,
      'drops Readability section': 'Connective pt-BR' not in h,
      'log lists flag and flagged block': 'bandeira vermelha' in log and 'bloco apontado pela bandeira:** São 56 programas' in log,
      'log lists numbers left in text': 'R$997' in log,
      'log is next to the docx, not in the slot': not os.path.exists(os.path.join(tmp, 'carta-a.log.md')),
    }
    r2 = subprocess.run([sys.executable, TOOL, src, out, '--keep-flagged'], capture_output=True, text=True); h2 = open(out, encoding='utf-8').read()
    checks['--keep-flagged keeps the block, still drops the flag'] = r2.returncode == 0 and '56 programas' in h2 and '⚑' not in h2
    empty = os.path.join(tmp, 'empty.docx'); Document().save(empty)
    r3 = subprocess.run([sys.executable, TOOL, empty, os.path.join(tmp, 'x.html')], capture_output=True, text=True)
    checks['empty docx writes nothing, exits 2'] = r3.returncode == 2 and not os.path.exists(os.path.join(tmp, 'x.html'))
    bad = [k for k, v in checks.items() if not v]
    for k, v in checks.items(): print('PASS' if v else 'FAIL', k)
    print(f'TOTAL {len(checks) - len(bad)} passed, {len(bad)} failed'); sys.exit(1 if bad else 0)
main()
