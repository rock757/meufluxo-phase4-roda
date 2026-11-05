// MeuFluxo · Fase 4 — anexar linhas em uma planilha Google (conta de serviço), sem dependências.
// Variáveis de ambiente (Vercel → Settings → Environment Variables; NUNCA no repositório):
//   GOOGLE_SA_EMAIL  e-mail da conta de serviço (…@…iam.gserviceaccount.com)
//   GOOGLE_SA_KEY    chave privada PEM da conta de serviço (com \n literais ou quebras reais)
//   SHEET_ID         id da planilha (compartilhada com a conta de serviço como Editor)
// Sem as três variáveis, append() devolve {ok:false,skipped:true} e as funções /api/* respondem 204 (no-op).
const crypto = require('crypto');
let tokenCache = { token: '', exp: 0 };

function configured() { return !!(process.env.GOOGLE_SA_EMAIL && process.env.GOOGLE_SA_KEY && process.env.SHEET_ID); }

function b64url(buf) { return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }

async function accessToken() {
  if (tokenCache.token && Date.now() < tokenCache.exp - 60000) return tokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({ iss: process.env.GOOGLE_SA_EMAIL, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const key = String(process.env.GOOGLE_SA_KEY).replace(/\\n/g, '\n');
  const sig = b64url(crypto.createSign('RSA-SHA256').update(header + '.' + claim).sign(key));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + header + '.' + claim + '.' + sig });
  const j = await r.json();
  if (!j.access_token) throw new Error('token: ' + JSON.stringify(j).slice(0, 200));
  tokenCache = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return tokenCache.token;
}

// append(tab, row) → acrescenta uma linha no fim da aba `tab` (cria valores como texto/número crus).
async function append(tab, row) {
  if (!configured()) return { ok: false, skipped: true };
  const tok = await accessToken();
  const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(process.env.SHEET_ID) + '/values/' + encodeURIComponent(tab + '!A1') + ':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS';
  const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [row] }) });
  if (!r.ok) throw new Error('sheets ' + r.status + ': ' + (await r.text()).slice(0, 200));
  return { ok: true };
}

// readTab(tab) → matriz de linhas (para o painel). Vazio se não configurado.
async function readTab(tab, range) {
  if (!configured()) return [];
  const tok = await accessToken();
  const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(process.env.SHEET_ID) + '/values/' + encodeURIComponent(tab + '!' + (range || 'A:Z'));
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + tok } });
  if (!r.ok) throw new Error('sheets ' + r.status);
  return (await r.json()).values || [];
}

function readBody(req) {
  return new Promise(resolve => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let s = typeof req.body === 'string' ? req.body : '';
    if (s) { try { return resolve(JSON.parse(s)); } catch (e) { return resolve({}); } }
    req.on('data', c => { s += c; if (s.length > 20000) s = s.slice(0, 20000); });
    req.on('end', () => { try { resolve(JSON.parse(s || '{}')); } catch (e) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}
const clean = (v, n) => String(v == null ? '' : v).replace(/[\r\n\t]/g, ' ').slice(0, n || 200);

module.exports = { configured, append, readTab, readBody, clean };
