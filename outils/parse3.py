import re,json,html,os
raw=json.load(open('raw.json'))
out=[]
for p in raw['prods']:
    f=f"albums/{p['id']}.html"; s=open(f).read() if os.path.exists(f) else ''
    m=re.search(r'showalbumheader__gallerysubtitle htmlwrap__main">(.*?)</div>',s,re.S)
    d=m.group(1) if m else ''
    d=re.sub(r'<br\s*/?>|</p>|</div>','\n',d); d=html.unescape(re.sub(r'<[^>]+>','',d))
    d='\n'.join(l.strip() for l in d.split('\n') if l.strip())
    photos=re.findall(r'data-origin-src="(https://photo\.yupoo\.com/[^"]+)"',s)
    p['desc']=d; p['photos']=photos; p['ok']=len(s)>20000
    out.append(p)
json.dump(dict(cats=raw['cats'],prods=out),open('full.json','w'),ensure_ascii=False,indent=1)
print(sum(p['ok'] for p in out), sum(bool(p['desc']) for p in out))
