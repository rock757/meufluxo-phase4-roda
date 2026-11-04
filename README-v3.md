# prototype-v3 — Plan B build (Jornada Completa) with Plan A one switch away · 2026-11-04

Base: `inputs/PASSPORT-unpacked/prototype/` (private review v2, commit 7129d86). Body copy of the letter untouched; closings A and B, FAQ 4–7 and the "trilha" paragraph rewritten; `style.css` has one appended block (journey list).

## Files
- `config.js` — **the only file to edit.** `revisao`, `fechamento` ('A'|'B'|null), `checkoutUrl`, `paramsRepassados`, `oferta.A/B` (nome, preco, parcelas, acessoPrazo, garantia, inclusoes, suporte, entrega), `programas` (the 8 Plan-B programs, one per wheel area, with internal alternatives).
- `trilha.js` — ordering rule + 16-char `ordem` code (`pr al mo ap fi re cr es`). Rule (PROPOSED): chosen priority first, then areas by fewest reported days, "Não sei dizer" last, ties in wheel order.
- `app.js` — programs per area come from `config.programas`; result page shows the 8-step suggested order when `fechamento` is B or null; "Conhecer a proposta" carries origin params + `prioridade` + `ordem`.
- `carta.html` + `carta.js` — one closing or both; `[data-field]` spans filled from `config.oferta`; empty field → `[a confirmar: …]` in review, sentence hidden for customers (`data-requires`); `[data-only="A|B"]` paragraphs; `#trilha` rendered from `ordem`; CTA built only when `checkoutUrl` is set, params appended without overwriting existing ones; customer mode hides every internal block/heading.
- `obrigado.html` — Payt success destination. Re-renders the sequence from `?ordem=` and shows delivery/support fields. Only works if Payt forwards the query string to the success URL (ask Évila); without params it shows wheel order.
- `index.html` — loads config + trilha.

## Flip to launch (B)
1. Fill `oferta.B` (preco, parcelas with total, acessoPrazo, garantia, suporte, entrega). 2. `fechamento: 'B'`, `checkoutUrl`. 3. `revisao: false`. 4. Open index → carta → obrigado on a phone and desktop; keyboard once. Same for A with `oferta.A`.

## Tested (OBSERVED, Chromium headless 390 px)
Review (both closings, journey shown, `[a confirmar]` markers, no buy button) · B customer (all fields filled: single closing, 0 internal leaks, one button carrying coupon + utm + prioridade + ordem, obrigado renders the same order) · A review (journey block absent, B hidden). Ordering verified against hand-computed expectation. Scripts: `scratch/test_v3.py`, `scratch/test_b.py`.
Not tested: real Payt, WhatsApp in-app browser on a device.
