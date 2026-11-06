import json, subprocess, time, os, sys, re, uuid
from playwright.sync_api import sync_playwright
ROOT="/home/claude/meufluxo-phase4-roda"; PORT=8766
TJS=open("/home/claude/inputs/trck/t.js").read()   # public central tracker, fetched 2026-11-06 (identical on both hosts)
srv=subprocess.Popen([sys.executable,"-m","http.server",str(PORT)],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
B=f"http://127.0.0.1:{PORT}/"; res=[]
def ok(name,cond,got=None): res.append(cond); print(("PASS " if cond else "FAIL ")+name+("" if cond else f"  → {got}"))
CAP="""window.__b=[];navigator.sendBeacon=function(u,blob){blob.text().then(t=>window.__b.push(JSON.parse(t)));return true};"""
CHECKOUT="https://checkout.payt.com.br/16d222a5fac9d8d7a3ee790f9ee46af5?coupon=100BLACK&split=12"
central=[]; third=[]; IDENT_DELAY={"ms":0}
def wire(ctx):
    def on_route(route):
        r=route.request; u=r.url
        if u.endswith("/config.js") and "127.0.0.1" in u:
            s=open(ROOT+"/config.js").read().replace("central: { ativo:false","central: { ativo:true").replace("checkoutUrl: ''","checkoutUrl: '%s'"%CHECKOUT)
            return route.fulfill(status=200,content_type="application/javascript",body=s)
        if "dados.meufluxoultrainteligencia.com" in u:
            p=u.split("dados.meufluxoultrainteligencia.com")[1].split("?")[0]
            central.append({"path":p,"method":r.method,"body":(json.loads(r.post_data) if r.post_data else None),"url":u})
            if p=="/t.js": return route.fulfill(status=200,content_type="application/javascript",body=TJS)
            if p=="/api/config": return route.fulfill(status=200,content_type="application/json",body='{"ga4":[],"pixels":["1120529180840486"],"tiktok":[]}')
            if p=="/api/identify":
                time.sleep(IDENT_DELAY["ms"]/1000)
                return route.fulfill(status=200,content_type="application/json",body=json.dumps({"trck_user_id":str(uuid.uuid4())}))
            return route.fulfill(status=200,content_type="application/json",body="{}")
        if "127.0.0.1" in u: return route.continue_()
        third.append(u); return route.abort()   # facebook / gtm / payt: never reached in the test, but recorded
    ctx.route("**/*",on_route)
try:
  with sync_playwright() as p:
    br=p.chromium.launch(); ctx=br.new_context(); ctx.add_init_script(CAP); wire(ctx); pg=ctx.new_page()
    pg.goto(B+"index.html?utm_source=email&utm_medium=MFI&utm_campaign=blacknov20261111&utm_content=EMAIL1&mf_test=claude-qa"); pg.wait_for_timeout(2500)
    tjs=[c for c in central if c["path"]=="/t.js"]; ev=[c for c in central if c["path"]=="/api/event"]
    ok("index: central t.js loaded exactly once, with data-funil=black-november-bf", len(tjs)==1 and pg.evaluate("document.querySelector('script[src$=\"/t.js\"]').getAttribute('data-funil')")=="black-november-bf", [len(tjs)])
    ok("index: exactly one PageView to the central (no duplicate from Phase 4 tracker)", [e["body"]["event_name"] for e in ev]==["PageView"], [e["body"].get("event_name") for e in ev])
    ok("index: PageView carries funil + UTMs; browser Pixel addressed with trackSingle to 1120529180840486", ev[0]["body"]["funil"]=="black-november-bf" and ev[0]["body"]["utm_source"]=="email" and pg.evaluate("(window.fbq&&window.fbq.queue||[]).some(q=>q[0]==='trackSingle'&&q[1]==='1120529180840486'&&q[2]==='PageView')"), ev[0]["body"])
    ok("index: Phase 4 tracker did not load its own GA4/GTM/Meta (one producer)", not any(("googletagmanager" in u or "gtag" in u) for u in third) and pg.evaluate("!document.querySelector('script[src*=\"gtm.js\"],script[src*=\"gtag/js\"]')"), third)
    pg.wait_for_timeout(300); tid=pg.evaluate("localStorage.getItem('trck_user_id')")
    b=pg.evaluate("window.__b")
    ok("index: Phase 4 events carry the central id (trck) once identify answered", bool(tid) and any(x.get("trck")==tid for x in b), {"tid":tid,"trck":[x.get("trck") for x in b]})
    pg.click("#start"); pg.wait_for_timeout(600)
    pg.evaluate("window.MF_TRACK('quiz_done',{vals:'5736241x',prioridade:'alimentacao',g:'f',r:'1'})"); pg.wait_for_timeout(600)
    et=[c for c in central if c["path"]=="/api/etapa"]
    ok("milestones go to /api/etapa with fixed neutral labels (02-roda-inicio, 03-roda-fim)", [e["body"]["etapa"] for e in et]==["02-roda-inicio","03-roda-fim"] and all(set(e["body"].keys())<= {"trck_user_id","funil","etapa","rotulo","event_source_url"} for e in et), [e["body"] for e in et])
    allc=json.dumps([c["body"] for c in central if c["body"]])+json.dumps([c["url"] for c in central])
    ok("no quiz answers / priority / gender in anything sent to the central", not re.search(r"5736241|alimentacao|prioridade|\"vals\"|\"g\":|\"r\":",allc), allc[:400])
    # ---- carta: URL scrubbed, checkout decorated, one InitiateCheckout ----
    n0=len([c for c in central if c["path"]=="/api/event"])
    pg.goto(B+"carta.html?prioridade=alimentacao&ordem=12345678&g=f&r=1&utm_source=email&mf_test=claude-qa"); pg.wait_for_timeout(2500)
    url=pg.url; ev=[c for c in central if c["path"]=="/api/event"][n0:]
    ok("carta: self-assessment params removed from the URL before trackers read it (utm kept)", "prioridade" not in url and "ordem" not in url and "utm_source=email" in url, url)
    ok("carta: event_source_url sent to the central has no prioridade/ordem", ev and all("prioridade" not in (e["body"].get("event_source_url") or "") and "ordem=" not in (e["body"].get("event_source_url") or "") for e in ev), [e["body"].get("event_source_url") for e in ev])
    ok("carta: priority still applied from sessionStorage", pg.evaluate("JSON.parse(sessionStorage.getItem('mf_carta')||'{}').prioridade")=="alimentacao" and pg.evaluate("!!document.querySelector('#primeiro')"), pg.evaluate("sessionStorage.getItem('mf_carta')"))
    ok("carta: exactly one PageView to the central", [e["body"]["event_name"] for e in ev]==["PageView"], [e["body"].get("event_name") for e in ev])
    btn=pg.query_selector('a[data-track="checkout_click"]'); href0=btn.get_attribute("href")
    ok("carta: checkout link keeps coupon/split and the UTMs and carries NO prioridade/ordem", "coupon=100BLACK" in href0 and "split=12" in href0 and "utm_source=email" in href0 and "prioridade" not in href0 and "ordem" not in href0, href0)
    ok("carta: URL was scrubbed in <head> before t.js was injected (central.js runs before the tracker script exists)", pg.evaluate("(function(){const s=[...document.scripts].map(x=>x.getAttribute('src')||'');return s.indexOf('central.js')<s.findIndex(x=>x.endsWith('/t.js'))})()") and all("prioridade" not in c["url"] for c in central), [c["url"] for c in central if "prioridade" in c["url"]])
    pg.evaluate("document.querySelector('a[data-track=\"checkout_click\"]').addEventListener('click',e=>e.preventDefault())")
    btn.click(); pg.wait_for_timeout(800); btn.click(); pg.wait_for_timeout(800)
    href1=btn.get_attribute("href"); tid2=pg.evaluate("localStorage.getItem('trck_user_id')")
    ok("carta: click decorates checkout with trck=sck=xcod=<central id> and keeps coupon", all(f"{k}={tid2}" in href1 for k in ("trck","sck","xcod")) and "coupon=100BLACK" in href1, href1)
    ic=[e for e in [c for c in central if c["path"]=="/api/event"] if e["body"]["event_name"]=="InitiateCheckout"]
    ok("carta: double click → exactly one InitiateCheckout to the central (1.5 s guard)", len(ic)==1, len(ic))
    cc=[x for x in pg.evaluate("window.__b") if x["ev"]=="checkout_click"]
    ok("carta: Phase 4 checkout_click recorded (2 clicks, Neon keeps both) with trck", len(cc)==2 and all(x.get("trck")==tid2 for x in cc), cc)
    ok("carta: Phase 4 never sends Purchase; central Purchase comes only from the Payt webhook", not any(e["body"]["event_name"]=="Purchase" for e in [c for c in central if c["path"]=="/api/event"]))
    # ---- private pages ----
    c0=len(central); pg.goto(B+"painel.html"); pg.wait_for_timeout(1200)
    ok("painel: central tracker not loaded, nothing sent", len(central)==c0 and pg.evaluate("!document.querySelector('script[src$=\"/t.js\"]')"), len(central)-c0)
    pg.goto(B+"index.html"); pg.wait_for_timeout(1500)
    ok("staff browser (mf_internal after painel) does not load the central tracker on customer pages", len(central)==c0, len(central)-c0)
    # ---- early checkout click before identify answers (fresh browser, slow identify) ----
    IDENT_DELAY["ms"]=2500; ctx2=br.new_context(); ctx2.add_init_script(CAP); wire(ctx2); p2=ctx2.new_page()
    p2.goto(B+"carta.html?mf_test=claude-qa"); p2.wait_for_timeout(400)
    p2.evaluate("document.querySelector('a[data-track=\"checkout_click\"]').addEventListener('click',e=>e.preventDefault())")
    a=p2.query_selector('a[data-track="checkout_click"]'); a.click(); p2.wait_for_timeout(300); h=a.get_attribute("href"); cc2=[x for x in p2.evaluate("window.__b") if x["ev"]=="checkout_click"]
    ok("early click (identity not ready): link intact and clickable, no fake trck, Phase 4 records the click without trck", "coupon=100BLACK" in h and "trck=" not in h and len(cc2)==1 and not cc2[0].get("trck"), {"href":h,"cc":cc2})
    ok("early click: no InitiateCheckout with an invented identity", not any(c["path"]=="/api/event" and c["body"].get("event_name")=="InitiateCheckout" and c["body"].get("trck_user_id") for c in central[c0:]), [c["body"] for c in central[c0:] if c["path"]=="/api/event"])
    ctx2.close(); br.close()
finally: srv.terminate()
print(f"{sum(res)} passed, {len(res)-sum(res)} failed")
open(ROOT+"/tests/batch2-central-results.txt","w").write("\n".join(("PASS" if r else "FAIL") for r in res)+f"\n{sum(res)} passed, {len(res)-sum(res)} failed · {time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}\n")
