import re,json,html,glob
cats={}
for f in glob.glob('p?.html'):
    for cid,name in re.findall(r'href="/collections/(\d+)"[^>]*>([^<]*)',open(f).read()): cats[cid]=html.unescape(name).strip()
prods={}
order=0
for cid in cats:
    s=open(f'col_{cid}.html').read()
    for m in re.finditer(r'class="album__main"\s+title="([^"]*)"\s+href="/albums/(\d+)[^"]*".*?data-src="([^"]*)".*?album__photonumber">(\d+)',s,re.S):
        t,aid,img,n=m.groups()
        p=prods.setdefault(aid,dict(id=aid,title=html.unescape(t).strip(),cover=img,n=int(n),cats=[],order=order)); order+=1
        if cid not in p['cats']: p['cats'].append(cid)
print(len(prods))
json.dump(dict(cats=cats,prods=list(prods.values())),open('raw.json','w'),ensure_ascii=False)
