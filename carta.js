(function(){
  const cfg=window.MF_CONFIG||{};
  const keys=cfg.paramsRepassados||[];
  let stored={};try{stored=JSON.parse(sessionStorage.getItem('mf_params')||'{}')}catch(e){}
  const params=new URLSearchParams();
  Object.keys(stored).forEach(k=>params.set(k,stored[k]));
  const q=new URLSearchParams(location.search);
  q.forEach((v,k)=>{if(keys.includes(k)||k==='prioridade'||k==='ordem'||k==='g'||k==='r')params.set(k,v)});
  const F=cfg.fechamento||null;
  // closings
  document.querySelectorAll('[data-closing]').forEach(sec=>{if(F&&sec.dataset.closing!==F)sec.hidden=true});
  document.querySelectorAll('[data-only]').forEach(el=>{if(F&&el.dataset.only!==F)el.hidden=true; if(!F&&cfg.revisao!==false)el.classList.add('review')});
  // fields: "A.preco" / "B.preco" / "X.preco" (X = fechamento escolhido, ou A em revisão sem escolha)
  const of=cfg.oferta||{};
  const val=ref=>{let [k,f]=ref.split('.');if(k==='X')k=F||'A';return ((of[k]||{})[f]||'').trim()};
  document.querySelectorAll('[data-field]').forEach(el=>{
    const v=val(el.dataset.field);
    if(v){el.textContent=(el.dataset.prefix||'')+v}
    else if(cfg.revisao!==false){const n=el.dataset.falta||el.dataset.field;el.innerHTML='<span class="falta">[a confirmar: '+n+']</span>'}
    else{el.textContent=''}
  });
  document.querySelectorAll('[data-requires]').forEach(el=>{if(!val(el.dataset.requires))el.hidden=true});
  if(cfg.textoClienteAtual)document.querySelectorAll('[data-owner-text]').forEach(el=>el.textContent=cfg.textoClienteAtual.replace(/\.$/,''));
  // trilha (Plano B)
  const T=window.MF_TRILHA;
  document.querySelectorAll('[data-trilha]').forEach(box=>{if(!T)return;
    let o=T.decode(q.get('ordem'));
    const aviso=box.previousElementSibling&&box.previousElementSibling.id==='trilha-aviso'?box.previousElementSibling:null;
    if(!o){o=[0,1,2,3,4,5,6,7];document.querySelectorAll('.trilha-aviso').forEach(a=>a.textContent='Ordem da espiral. Faça a sua Roda da Vida para começar pela sua necessidade.')}
    box.innerHTML=T.render(o,{g:q.get('g'),r:q.get('r')});
  });
  // CTA
  if(cfg.checkoutUrl){
    document.querySelectorAll('[data-cta]').forEach(block=>{
      if(F&&block.dataset.cta!==F)return;
      let url;try{url=new URL(cfg.checkoutUrl,location.href)}catch(e){return}
      params.forEach((v,k)=>{if(!url.searchParams.has(k))url.searchParams.set(k,v)});
      const a=document.createElement('a');a.className='btn';a.href=url.toString();a.textContent=block.dataset.label+' →';
      const wrap=document.createElement('div');wrap.className='actions';wrap.appendChild(a);block.replaceWith(wrap);
    });
  }
  if(cfg.revisao===false){
    document.querySelectorAll('.review,.tag,footer').forEach(el=>el.hidden=true);
    document.querySelectorAll('h1,h2,h3,p,li').forEach(el=>{const t=el.textContent.trim();if(/^\[|SOMENTE SE APROVADO|^Encerramento comum$|^Fechamento [AB] \|/.test(t))el.hidden=true});
  }
})();
