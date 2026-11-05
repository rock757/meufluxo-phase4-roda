// Ordem sugerida = a espiral (CONFIRMADO por Rock, 2026-11-04): a pessoa começa pela necessidade que a trouxe
// e a espiral segue dali em diante (2→8, dando a volta). Propósito (Nico) é a semente, incluída sempre, mostrada antes do passo 1.
// Ordem 2026-11-05: 1 Propósito · 2 Saúde (movimento) · 3 Alimentação · 4 Memória · 5 Prosperidade (financas) · 6 Relações · 7 Crescimento · 8 Espiritualidade (transcendencia).
// Os dias relatados na roda NÃO definem a ordem; definem só o retrato. O cliente pode mudar a ordem.
(function(){
  const CODES=['pr','mo','al','me','fi','re','cr','tr']; // índice = posição na espiral (2026-11-05: Saúde=mo antes de Alimentação=al)
  function order(values,priority){
    // 2026-11-05: a semente é a própria Roda da Vida (autoavaliação com o Nicolas), já feita; os 8 passos começam pela prioridade e dão a volta.
    const p=(priority===null||priority===undefined)?0:priority;
    const seq=[];for(let k=0;k<8;k++)seq.push((p+k)%8);return seq;
  }
  const encode=o=>o.map(i=>CODES[i]).join('');
  function decode(s){if(!s||s.length!==16)return null;const o=[];for(let k=0;k<16;k+=2){const i=CODES.indexOf(s.slice(k,k+2));if(i<0||o.includes(i))return null;o.push(i)}return o}
  function resolve(i,ctx){const P=(window.MF_CONFIG||{}).programas||[];const p=P[i]||{};const v=p.variantes||{};ctx=ctx||{};
    if(i===1&&ctx.g==='m'&&v.mulher)return{...p,...v.mulher};
    if(i===1&&ctx.g==='h'&&v.homem)return{...p,...v.homem};
    if(i===5&&ctx.r==='f'&&v.filhos)return{...p,...v.filhos};
    return p}
  function render(o,ctx){
    let n=0;
    return '<ol class="trilha"><li class="semente"><strong>Sua Roda da Vida</strong> · <em>autoavaliação com o Nicolas, feita</em></li>'+o.map(i=>{const p=resolve(i,ctx);
      n++;return `<li><strong>${p.area||''}</strong><br>${p.programa||'[programa a definir]'}${p.especialista?' · com '+p.especialista:''}</li>`}).join('')+'</ol>';
  }
  const SEMENTE={pt:{titulo:'Sua Roda da Vida',sub:'autoavaliação com o Nicolas'},en:{titulo:'Your Wheel of Life',sub:'self-assessment with Nicolas'}};
  window.MF_TRILHA={order,encode,decode,render,resolve,CODES,SEMENTE};
})();
