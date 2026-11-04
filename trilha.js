// Ordem sugerida = a espiral (CONFIRMADO por Rock, 2026-11-04): a pessoa começa pela necessidade que a trouxe
// e a espiral segue dali em diante (2→8, dando a volta). Propósito (Nico) é a semente, incluída sempre, mostrada antes do passo 1.
// Os dias relatados na roda NÃO definem a ordem; definem só o retrato. O cliente pode mudar a ordem.
(function(){
  const CODES=['pr','al','mo','me','fi','re','cr','tr'];
  function order(values,priority){
    const p=(priority===null||priority===undefined)?1:priority;
    const seq=[];
    if(p===0){for(let i=1;i<8;i++)seq.push(i)}
    else{for(let k=0;k<7;k++){const i=((p-1+k)%7)+1;seq.push(i)}}
    return [0,...seq];
  }
  const encode=o=>o.map(i=>CODES[i]).join('');
  function decode(s){if(!s||s.length!==16)return null;const o=[];for(let k=0;k<16;k+=2){const i=CODES.indexOf(s.slice(k,k+2));if(i<0||o.includes(i))return null;o.push(i)}return o}
  function resolve(i,ctx){const P=(window.MF_CONFIG||{}).programas||[];const p=P[i]||{};const v=p.variantes||{};ctx=ctx||{};
    if(i===2&&ctx.g==='m'&&v.mulher)return{...p,...v.mulher};
    if(i===2&&ctx.g==='h'&&v.homem)return{...p,...v.homem};
    if(i===5&&ctx.r==='f'&&v.filhos)return{...p,...v.filhos};
    return p}
  function render(o,ctx){
    let n=0;
    return '<ol class="trilha">'+o.map(i=>{const p=resolve(i,ctx);
      if(p.incluido)return `<li class="semente"><strong>${p.area||''}</strong> · <em>semente, incluído</em><br>${p.programa||''}${p.especialista?' · com '+p.especialista:''}</li>`;
      n++;return `<li><strong>${p.area||''}</strong><br>${p.programa||'[programa a definir]'}${p.especialista?' · com '+p.especialista:''}</li>`}).join('')+'</ol>';
  }
  window.MF_TRILHA={order,encode,decode,render,resolve,CODES};
})();
