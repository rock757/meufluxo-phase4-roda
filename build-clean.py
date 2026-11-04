# Generates the deployable carta.html from carta.master.html: strips every internal block from the SOURCE.
import io,re
h=io.open('carta.master.html',encoding='utf-8').read()
h=re.sub(r'<section data-closing="B">.*?</section>','',h,flags=re.S)   # deploy shows closing A (Nic's plan); B stays in master
h=re.sub(r'<div class="review"[^>]*>.*?</div>\n?','',h,flags=re.S)
h=re.sub(r'<h2>Fechamento A \|[^<]*</h2>\n?','',h)
h=re.sub(r'<h2>Encerramento comum</h2>\n?','',h)
h=h.replace('<span class="tag">CARTA · RASCUNHO PRIVADO</span>','<span class="tag">PRÉVIA DE CONCEITO</span>',1)
h=h.replace('<footer>Versão privada para revisão. Nenhuma compra ou envio de respostas está disponível.</footer>','<footer>Prévia de conceito. Nenhuma compra está disponível nesta página.</footer>',1)
h=h.replace('<h3>3. Preciso fazer todos os programas de uma vez?</h3>\n','<h3>3. Preciso fazer todos os programas de uma vez?</h3>\n<p>Não. Você pode começar pelo passo que escolher e continuar dentro do seu período de acesso.</p>\n',1)
for bad in ['INTERNO','R$997','R$779','Fechamento','SOMENTE SE APROVADO','PROVA OPCIONAL','[LINK DO','[a confirmar','Botão:']:
    assert bad not in h, bad
io.open('carta.html','w',encoding='utf-8').write(h); print('carta.html built', len(h))
