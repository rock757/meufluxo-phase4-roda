# meufluxo-phase4-roda

MeuFluxo Phase 4 (Black November): Roda da Vida quiz → written letter → checkout. Static prototype v3 + bilingual decision tool. PRIVATE WORKING MATERIAL.

- Authoritative working source: M2 · `/Volumes/APG2T/PROJECTS/MF_LTV_PHASE4_NOV5AM/src/prototype-v3/` (this repo is its backup/deploy mirror).
- Pages: `index.html` (quiz), `carta.html` (letter), `obrigado.html` (post-purchase), `decidir.html` (PT/EN offer decision tool → generates `config.js`).
- Edit only `config.js` to flip offer A/B, prices, terms, checkout URL and review mode. Details in `README-v3.md`.
- No credentials in this repo. No build step; deploy as static files.

Deploy: Vercel project meufluxo-fase-4-roda-da-vida-prototype-v3 (team contato-q620), auto-deploys from main.

## Payt sales (`/api/payt`)

Payt's sale notice (postback "PayT V1") is stored in the `compras` table with its utm tags, `src` and letter (A/B), and the private panel (`painel.html`) counts paid sales by letter and by email. Off until `PAYT_INTEGRATION_KEY` is set in Vercel. One-time setup: run `db/compras_payt.sql` in Neon (`meufluxo_fase4`), register the postback in Payt pointing to `https://carta.meufluxo.com/api/payt`, put Payt's integration key in Vercel as `PAYT_INTEGRATION_KEY`, redeploy. No customer name, email, CPF, phone or address is stored.
