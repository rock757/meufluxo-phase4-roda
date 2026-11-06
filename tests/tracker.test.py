import json, subprocess, time, os, sys
from playwright.sync_api import sync_playwright
ROOT="/home/claude/meufluxo-phase4-roda"; PORT=8765
srv=subprocess.Popen([sys.executable,"-m","http.server",str(PORT)],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
B=f"http://127.0.0.1:{PORT}/"; res=[]; 
def ok(name,cond,got=None): res.append(cond); print(("PASS " if cond else "FAIL ")+name+("" if cond else f"  → {got}"))
CAP="""window.__b=[];navigator.sendBeacon=function(u,blob){blob.text().then(t=>window.__b.push(JSON.parse(t)));return true};"""
try:
  with sync_playwright() as p:
    br=p.chromium.launch(); ctx=br.new_context(); ctx.add_init_script(CAP); pg=ctx.new_page()
    pg.goto(B+"index.html"); old=int(time.time()*1000)-3*86400*1000
    pg.evaluate(f"localStorage.setItem('mf_first',JSON.stringify({{ts:{old},ref:'',landing:'index'}}));localStorage.removeItem('mf_internal');localStorage.removeItem('mf_test')")
    pg.goto(B+"index.html?utm_source=email&mf_test=claude-qa"); pg.wait_for_timeout(2200)
    b=pg.evaluate("window.__b"); pv=[x for x in b if x['ev']=='page_view'][0]; now=int(time.time()*1000)
    ok("event time is NOW, not the 3-day-old first touch", abs(pv['ts']-now)<10000 and pv['first_ts']==old, {'ts':pv['ts'],'first_ts':pv.get('first_ts')})
    ok("explicit test label travels on every event (mf_test=claude-qa)", all(x.get('test')=='claude-qa' for x in b), [x.get('test') for x in b])
    ok("automation flag reported (webdriver=1 under Playwright)", pv.get('wd')==1, pv.get('wd'))
    tall=ctx.new_page(); tall.goto(B+"index.html"); tall.wait_for_timeout(400); tall.evaluate("document.body.style.display='none'"); tall.wait_for_timeout(1900)
    tb=tall.evaluate("window.__b"); tall.close()
    ok("automatic scroll (page fits window) marked auto=1, so it is not counted as human", any(x['ev']=='scroll' and x.get('auto')==1 for x in tb) and not any(x['ev']=='interact' for x in tb), [x for x in tb if x['ev'] in ('scroll','interact')])
    ok("no interact event before any real input", not any(x['ev']=='interact' for x in b))
    pg.evaluate("window.MF_TRACK('custom_check',{vid:'HACK',ts:1,page:'x',utm_source:'spoof',note:'kept'})"); pg.wait_for_timeout(300)
    c=[x for x in pg.evaluate("window.__b") if x['ev']=='custom_check'][0]
    ok("payload cannot overwrite identity, time, page or UTM", c['vid']!='HACK' and c['ts']>1e12 and c['page']=='index' and c['utm_source']=='email' and c['note']=='kept', c)
    pg.click("#start"); pg.wait_for_timeout(400)
    it=[x for x in pg.evaluate("window.__b") if x['ev']=='interact']
    ok("real input sends exactly one interact event", len(it)==1, it)
    pg.goto(B+"painel.html"); pg.wait_for_timeout(800)
    ok("private dashboard sends no tracking events", pg.evaluate("window.__b.length")==0, pg.evaluate("window.__b"))
    pg.goto(B+"index.html?mf_test=off"); pg.wait_for_timeout(600)
    b2=pg.evaluate("window.__b")
    ok("after opening the dashboard this browser is marked staff (internal=painel)", all(x.get('internal')=='painel' for x in b2) and len(b2)>0, [x.get('internal') for x in b2])
    ok("mf_test=off clears the test label", all('test' not in x for x in b2), [x.get('test') for x in b2])
    pg.goto(B+"overview.html"); pg.wait_for_timeout(800); ok("overview sends no tracking events", pg.evaluate("window.__b.length")==0)
    br.close()
finally: srv.terminate()
print(f"{sum(res)} passed, {len(res)-sum(res)} failed"); open("/home/claude/meufluxo-phase4-roda/tests/batch1-tracker-results.txt","w").write(f"{sum(res)} passed, {len(res)-sum(res)} failed\n")
