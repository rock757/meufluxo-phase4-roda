import json
from playwright.sync_api import sync_playwright
D="file:///home/claude/meufluxo-phase4-roda"
OUT="/home/claude/outputs/v4"
import os; os.makedirs(OUT,exist_ok=True)
def run(name,vp,mobile,lang=""):
    r={}
    with sync_playwright() as p:
        b=p.chromium.launch(args=["--allow-file-access-from-files"]); ctx=b.new_context(viewport=vp,is_mobile=mobile,device_scale_factor=2 if mobile else 1); pg=ctx.new_page()
        errs=[]; pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append("console:"+m.text) if m.type=="error" else None)
        pg.goto(f"{D}/index.html?utm_source=api&utm_campaign=bn26{lang}"); pg.wait_for_selector("#start")
        r["h1"]=pg.inner_text("h1"); pg.screenshot(path=f"{OUT}/{name}-0-hero.png",full_page=True)
        pg.click("#start"); pg.wait_for_selector(".day")
        for i,v in enumerate([5,3,2,6,2,4,1,7]):
            pg.wait_for_selector(".day"); pg.click(f'.day[data-v="{v}"]')
            if i==2: pg.click('[data-x="g"][data-val="m"]')
            if i==5: pg.click('[data-x="r"][data-val="f"]')
            if i==1: pg.screenshot(path=f"{OUT}/{name}-1-q2.png",full_page=True)
            pg.click("#next")
        pg.wait_for_selector("[data-p]"); pg.wait_for_timeout(1200)
        pg.screenshot(path=f"{OUT}/{name}-2-reveal.png",full_page=False)
        r["wedges"]=pg.evaluate("document.querySelectorAll('.reveal .wedge.in').length")
        pg.click('[data-p="4"]'); pg.wait_for_timeout(1500)
        r["path"]=pg.evaluate("[...document.querySelectorAll('.path .step b')].map(e=>e.textContent)")
        r["path_imgs"]=pg.evaluate("[...document.querySelectorAll('.path .step img')].filter(i=>i.complete&&i.naturalWidth>0).length")
        r["tab_selected"]=pg.evaluate("document.querySelector('.lvl-tab[aria-selected=true] b').textContent")
        r["panel_faces"]=pg.evaluate("document.querySelectorAll('#lvlpanel .face').length")
        pg.click('.lvl-tab[data-lv="2"]'); pg.wait_for_timeout(300)
        r["panel_faces_lv2"]=pg.evaluate("document.querySelectorAll('#lvlpanel .face').length")
        r["spec_cards"]=pg.evaluate("document.querySelectorAll('.spec').length")
        r["spec_imgs_ok"]=pg.evaluate("[...document.querySelectorAll('.spec img')].filter(i=>i.complete&&i.naturalWidth>0).length")
        pg.click('.spec[data-s="marcelo-roxo"]'); r["spec_open"]=pg.evaluate("document.querySelector('.spec[data-s=\"marcelo-roxo\"]').classList.contains('open')")
        r["cta"]=pg.get_attribute("#cta","href")
        pg.screenshot(path=f"{OUT}/{name}-3-result-full.png",full_page=True)
        r["errors"]=errs; b.close()
    print(f"=== {name}\n"+json.dumps(r,ensure_ascii=False,indent=1)); return r
d=run("desktop",{"width":1280,"height":860},False)
m=run("mobile",{"width":390,"height":844},True)
e=run("desktop-en",{"width":1280,"height":860},False,"&lang=en")
assert d["wedges"]==8 and d["path"][0].startswith("Prop") and d["path"][1].startswith("Seguran") and d["path_imgs"]==8 and d["spec_cards"]==16 and d["spec_imgs_ok"]==16 and d["spec_open"] and "ordem=" in d["cta"] and "g=m" in d["cta"] and "r=f" in d["cta"] and "utm_source=api" in d["cta"]
assert e["h1"].startswith("Your whole life") and e["cta"].startswith("carta-en.html")
assert not (d["errors"] or m["errors"] or e["errors"])
print("ALL V4 ASSERTIONS PASSED")
