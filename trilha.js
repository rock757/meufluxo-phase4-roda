// Ordem sugerida da Jornada (Plano B). Regra PROPOSTA, não validada:
// 1º = área que o cliente escolheu cuidar agora; depois, as áreas com MENOS dias relatados (mais espaço para crescer);
// "Não sei dizer" vem depois das áreas com número; empates seguem a ordem da roda. O cliente pode mudar a ordem.
(function(){
  const CODES=['pr','al','mo','ap','fi','re','cr','es'];
  function order(values,priority){
    const idx=[0,1,2,3,4,5,6,7];
    const key=i=>(typeof values[i]==='number'?values[i]:99);
    const rest=idx.filter(i=>i!==priority).sort((a,b)=>key(a)-key(b)||a-b);
    return priority===null||priority===undefined?rest:[priority,...rest];
  }
  const encode=o=>o.map(i=>CODES[i]).join('');
  function decode(s){if(!s||s.length!==16)return null;const o=[];for(let k=0;k<16;k+=2){const i=CODES.indexOf(s.slice(k,k+2));if(i<0||o.includes(i))return null;o.push(i)}return o}
  function render(o){
    const P=(window.MF_CONFIG||{}).programas||[];
    return '<ol class="trilha">'+o.map(i=>{const p=P[i]||{};return `<li><strong>${p.area||''}</strong><br>${p.programa||'[programa a definir]'}${p.especialista?' · com '+p.especialista:''}</li>`}).join('')+'</ol>';
  }
  window.MF_TRILHA={order,encode,decode,render,CODES};
})();
