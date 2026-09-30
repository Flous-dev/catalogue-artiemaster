import json,re,collections
d=json.load(open('full.json'))
fr={int(l.split('|',1)[0]):l.split('|',1)[1].strip() for l in open('fr.txt',encoding='utf8') if '|' in l}
CATS={ # cid: (fr name, group)
'5171092':('Automne-Hiver 2026','col'),'5058219':('Printemps-Été 2026','col'),
'4867238':('Automne-Hiver 2025','col'),'4730980':('Printemps-Été 2025','col'),
'5110939':('Best-sellers été','best'),'4608702':('Best-sellers hiver','best'),
'3129491':('T-shirts','type'),'4608718':('T-shirts imprimés','type'),'3129489':('Débardeurs','type'),
'3129492':('Shorts','type'),'3132644':('Sweats','type'),'3132645':('Manches longues','type'),
'4634948':('Manches longues & sweats imprimés','type'),'3129596':('Pantalons','type'),
'4949353':('Vestes & gilets','type'),'5095298':('Femme','type'),'5142871':('Casquettes','type'),'5260588':('Pantalons imprimés','type')}
PRE=[('喷马骝','Monkey wash '),('喷马溜','Monkey wash '),('马骝','Monkey wash '),('蜡染','Batik '),('水洗','Délavé '),('复古','Vintage '),('喷染','Teint spray '),('喷然','Teint spray '),('喷绘','Peint '),
('废土','Wasteland '),('废墟','Ruine '),('破坏','Destroy '),('凉感','Frais '),('甩点','Moucheté '),('泼墨','Encre '),('涂鸦','Graffiti '),('雾霾','Brume '),('做旧','Vieilli '),
('渲染','Nuancé '),('脏染','Dirty '),('活性','Réactif '),('渐变做旧','Dégradé '),('渐变','Dégradé '),('巴家','Balenci '),('蛇纹','Serpent '),('豹纹','Léopard '),('喷色','Teint ')]
BASE=[('布林','prune'),('迷彩','camo'),('暗','sombre '),('克莱因','Klein '),('奶油','crème '),('巧克力','chocolat'),('巴黎','Paris '),('暖','chaud '),('火焰','flamme '),('长春花','pervenche '),('深酒红','bordeaux foncé'),('淡','pâle '),('寒梅','prunier'),('茵','vert '),('黑撞灰','noir/gris'),('白撞蓝','blanc/bleu'),('红撞黑','rouge/noir'),('午夜蓝','bleu nuit'),('藏青蓝','bleu marine'),('海军蓝','bleu marine'),('藏青','bleu marine'),('藏蓝','bleu marine'),
('孔雀蓝','bleu paon'),('孔雀绿','vert paon'),('巴黎蓝','bleu Paris'),('巴黎粉','rose Paris'),('巴黎杏','abricot Paris'),('天蓝','bleu ciel'),('湖蓝','bleu lac'),('彩蓝','bleu vif'),('宝蓝','bleu roi'),
('静谧蓝','bleu calme'),('海盐蓝','bleu sel marin'),('薄荷蓝','bleu menthe'),('雾蓝','bleu brume'),('靛蓝','indigo'),('灰蓝','gris-bleu'),('麻灰蓝','gris-bleu chiné'),('浅蓝','bleu clair'),('深蓝','bleu foncé'),('暗蓝','bleu sombre'),('中蓝','bleu moyen'),('蓝','bleu'),
('伊甸园绿','vert Éden'),('苔藓绿','vert mousse'),('橄榄绿','vert olive'),('棕榈绿','vert palmier'),('森林绿','vert forêt'),('翡翠绿','vert émeraude'),('薄荷绿','vert menthe'),('卡其绿','vert kaki'),
('荧光绿','vert fluo'),('嫩草绿','vert herbe'),('草绿','vert herbe'),('青铜绿','vert bronze'),('森绿','vert forêt'),('墨绿','vert bouteille'),('灰绿','gris-vert'),('军绿','vert militaire'),('深绿','vert foncé'),('浅绿','vert clair'),('中绿','vert moyen'),('松绿','vert pin'),('苍绿','vert pâle'),('青绿','vert-bleu'),('黑绿','noir-vert'),('绿','vert'),
('西瓜红','rouge pastèque'),('海棠红','rouge begonia'),('朱砂红','rouge vermillon'),('赤士红','rouge terre'),('砖红','rouge brique'),('枣红','rouge jujube'),('酒红','bordeaux'),('玫红','rose fuchsia'),('虾红','rouge crevette'),
('袖红','rouge'),('锈红','rouge rouille'),('大红','rouge vif'),('暗红','rouge sombre'),('红','rouge'),
('胭脂粉','rose poudré'),('藕粉','vieux rose'),('桃粉','rose pêche'),('樱粉','rose cerise'),('灰粉','rose grisé'),('浅粉','rose pâle'),('暗粉','rose sombre'),('粉橙','orange rosé'),('粉','rose'),
('布林紫','violet prune'),('芋紫','violet taro'),('梅紫','violet prune'),('电光紫','violet électrique'),('酱紫','violet foncé'),('浅紫','violet clair'),('暗紫','violet sombre'),('紫','violet'),
('柠檬黄','jaune citron'),('琥珀黄','jaune ambre'),('海砂黄','jaune sable'),('姜黄','curcuma'),('淡黄','jaune pâle'),('黄','jaune'),
('赤土橙','orange terracotta'),('橘橙','orange mandarine'),('橙','orange'),
('勃肯第棕','brun Birkenstock'),('棕褐','brun tabac'),('灰棕','gris-brun'),('棕','marron'),('褐','brun'),('石褐','brun pierre'),('焦糖','caramel'),('苏木','bois de sappan'),
('啡','café'),('咖啡','café'),('深咖','café foncé'),('暗咖','café sombre'),('浅咖','café clair'),('灰咖','gris café'),('米咖','beige café'),('黑咖','noir café'),('咖','café'),('驼','camel'),('卡其驼','kaki camel'),('卡其','kaki'),
('奶茶杏','abricot thé au lait'),('米杏','beige abricot'),('灰杏','gris abricot'),('浅杏','abricot clair'),('黑杏','noir abricot'),('杏','abricot'),('小麦','blé'),('砂','sable'),('纱','sable'),('沙','sable'),
('米白','blanc cassé'),('象牙白','ivoire'),('牙白','ivoire'),('石膏白','blanc plâtre'),('雾霾白','blanc brume'),('灰白','gris-blanc'),('白灰','blanc-gris'),('白花灰','gris chiné clair'),('影白','blanc ombre'),('白','blanc'),('米灰','gris beige'),('米','beige'),
('燕麦灰','gris avoine'),('寂静灰','gris silence'),('深邃灰','gris profond'),('水泥灰','gris ciment'),('铁灰','gris fer'),('烟灰','gris fumée'),('碳灰','gris carbone'),('沥灰','gris asphalte'),('泥灰','gris argile'),
('花灰','gris chiné'),('浅灰','gris clair'),('深灰','gris foncé'),('中灰','gris moyen'),('灰迷彩','camo gris'),('灰','gris'),
('迷彩杏','camo abricot'),('绿迷彩','camo vert'),('粉迷彩','camo rose'),('豹纹迷彩','camo léopard'),('黑影','ombre noire'),('雾黑','noir brume'),('黑','noir'),('FOG绿','vert FOG'),('色','')]
def color(t):
    t=t.replace('颜色','').strip('：: ')
    suf=''
    m=re.search(r'-?(FG)$',t)
    if m: t=t[:m.start()]; suf=' (FG)'
    pre=''
    for k,v in PRE:
        if t.startswith(k) and len(t)>len(k): pre+=v; t=t[len(k):]
        if t.startswith(k) and len(t)>len(k): pre+=v; t=t[len(k):]
    for k,v in PRE:
        if t.startswith(k) and len(t)>len(k): pre+=v; t=t[len(k):]
    out=t
    for k,v in sorted(BASE,key=lambda x:-len(x[0])):
        if k and k in out: out=out.replace(k,' '+v+' ')
    out=re.sub(r'\s+',' ',out).strip()
    res=(pre+out).strip()+suf
    return res[:1].upper()+res[1:] if res else ''
def fabric(s):
    for k,v in [('聚酯纤维','polyester'),('聚酯钎维','polyester'),('聚脂钎维','polyester'),('涤纶','polyester'),('涤','polyester'),('氨纶','élasthanne'),('粘纤','viscose'),('粘胶','viscose'),('腈纶','acrylique'),
                ('薄荷抗菌索罗娜','Sorona menthe antibactérien'),('薄荷SORONA','Sorona menthe'),('索罗娜','Sorona'),('秘鲁棉','coton péruvien'),('重磅空气棉','coton aéré épais'),('棉','coton'),('+',' · '),
                ('智能纺织功能性coton面料(吸湿速干/凉感/抗菌)','coton technique (séchage rapide / frais / antibactérien)')]:
        s=s.replace(k,v)
    s=re.sub(r'(\d)\s*%\s*',r'\1 % ',s); s=re.sub(r'\s{2,}',' · ',s.strip()); s=re.sub(r'(coton|polyester|Sorona)(\d)',r'\1 · \2',s)
    return s
def ptype(t,cats):
    if '帽' in t: return 'Casquettes'
    if '汇总' in t or '视频' in t: return 'Catalogues'
    if '背心' in t or '马甲' in t: return 'Débardeurs'
    if '短裤' in t or '拳击裤' in t or '中裤' in t: return 'Shorts'
    if re.search(r'裤',t) and '配套' not in t.split('裤')[0][-3:] and not re.search(r'卫衣|T恤|t恤|短袖|长袖|外套',t.split('（')[0].split('(')[0].split('搭')[0].split('与')[0]): return 'Pantalons'
    head=re.split(r'[（(]|搭配|与\d|套装',t)[0]
    if re.search(r'外套|开衫',head) or ('拉链' in head and '卫衣' in head and 'Polo' not in head): return 'Vestes & sweats zippés'
    if '卫衣' in head or '上衣' in head: return 'Sweats & hoodies'
    if re.search(r'长袖|长t|长T|打底',head): return 'Manches longues'
    return 'T-shirts'
def ftype(n):
    for k,v in [('Catalogue','Catalogues'),('Vidéos','Catalogues'),('Casquette','Casquettes'),('Débardeur','Débardeurs'),('Gilet','Débardeurs'),('Short','Shorts'),
                ('Pantalon','Pantalons'),('Jogging','Pantalons'),('Veste','Vestes & zippés'),('Hoodie zippé','Vestes & zippés'),('Sweat zippé','Vestes & zippés'),
                ('Hoodie','Sweats & hoodies'),('Sweat','Sweats & hoodies'),('Haut','Sweats & hoodies'),('Manches longues','Manches longues'),('T-shirt manches longues','Manches longues'),
                ('Sous-pull','Manches longues'),('Polo manches longues','Manches longues'),('Ensemble polo','T-shirts & polos'),('Polo','T-shirts & polos'),('T-shirt','T-shirts & polos')]:
        if n.startswith(k): return v
    return 'Autres'
refs={}
prods=[]
for i,p in enumerate(d['prods']):
    t=p['title']; desc=p['desc']
    m=re.search(r'([A-Z]{0,3}\d{2,5})\s*#',t) or re.search(r'#\s*([A-Z]{0,3}\d{2,5})',t) or re.search(r'([A-Z]{0,3}\d{3,5})',t)
    ref=m.group(1) if m else ''
    f=dict(colors=[],sizes='',fabric='',weight='',base='',custom=[],notes=[])
    for l in desc.split('\n'):
        mm=re.match(r'\s*([^：:]{1,20})[：:]\s*(.*)',l)
        if not mm: continue
        k,v=mm.group(1).strip(),mm.group(2).strip()
        if k.endswith('颜色') and v and not f['colors']:
            f['colors']=[c for c in (color(x) for x in re.split(r'[\s,，、/]+',v) if x) if c]
        elif k in('码数','尺码','5个码数') and not f['sizes']: f['sizes']=' · '.join(re.split(r'[\s/，,]+',v.replace('码','')))
        elif k in('面料','成份','面料与克重','面料克重') and not f['fabric'] and len(v)<60 and re.search(r'\d|棉',v):
            w=re.search(r'(\d{3})\s*[gG克]',v)
            if w and not f['weight']: f['weight']=w.group(1)
            v2=re.sub(r'[，,]?\s*\d{3}\s*[gG克]','',v)
            f['fabric']=fabric(v2)
        elif k in('克重',) and not f['weight']:
            w=re.search(r'(\d{3})',v); f['weight']=w.group(1) if w else ''
        elif re.match(r'(现货)?(空白|光版|光板)?底(衫|板|版)(款)?$|现货(光版|光板|底板|底版|款号)',k):
            b=re.search(r'([A-Z]{0,3}\d{3,5})',v); f['base']=b.group(1) if b else ''
        elif k.startswith('支持'):
            if '丝印' in v: f['custom'].append('Changement d\'étiquette, sérigraphie, broderie — dès 50 pièces')
            elif '烫图' in v and '直喷' in v and '起定' in v: f['custom'].append('Changement d\'étiquette, transfert thermocollé, impression DTG — dès 30 pièces')
            elif '换标-印花' in v: f['custom'].append('Marque perso : étiquette, impression, broderie, transfert, DTG')
            elif '改版型' in k or '改版型' in v:
                n=re.search(r'≈\s*(\d+)',v); f['custom'].append('Modifs de coupe / couleurs / tailles : min. 1 rouleau par couleur et 100 pièces au total'+(f' (1 rouleau ≈ {n.group(1)} pièces)' if n else ''))
            elif '小批量' in v: f['custom'].append('Petites séries : impression perso, changement de marque et d\'emballage')
        if '来图定制' in l: f['custom'].append('Impression de votre propre visuel — dès 30 pièces')
    if not f['weight']:
        w=re.search(r'(\d{3})\s*[gG克]',t); f['weight']=w.group(1) if w else ''
    if not f['base']:
        b=re.search(r'(?:底衫|光板|底板|光版)[：:\s]*([A-Z]{0,3}\d{3,5})',t+desc); f['base']=b.group(1) if b else ''
    sets=[x for x in re.findall(r'([A-Z]{0,3}\d{3,5})',' '.join(re.findall(r'(?:搭配|搭|与|套装|配套|上衣|裤子|可搭|长裤)[^。\n]{0,30}',t))) if x!=ref]
    cats=[CATS[c][0] for c in p['cats'] if c in CATS]
    ty=ftype(fr.get(i,''))
    if '5142871' in p['cats']: ty='Casquettes'
    prod=dict(id=p['id'],ref=ref,name=fr.get(i,t),zh=t,type=ty,cats=cats,n=p['n'],
        printed=bool(re.search(r'印花|印花|直喷|图案',t)) or any(c in p['cats'] for c in('4608718','4634948','5260588')),
        best=bool(re.search(r'爆|货源足|不断货|主推',t)) or any(c in p['cats'] for c in('5110939','4608702')),
        women=bool(re.search(r'女|辣妹',t)) or '5095298' in p['cats'],
        basic=bool(re.search(r'基础|空白|纯色',t)),
        season=next((CATS[c][0] for c in p['cats'] if CATS.get(c,('',''))[1]=='col'),''),
        nimg=min(8,len(p['photos'])),desc=desc,sets=list(dict.fromkeys(sets)),order=i,**f)
    prod['custom']=list(dict.fromkeys(prod['custom']))
    prods.append(prod)
    refs.setdefault(ref,p['id'])
bases={p['base'] for p in prods if p['base']}
for p in prods:
    if p['ref'] in bases and not p['printed']: p['basic']=True
for p in prods: p['sets']=[[r,refs[r]] for r in p['sets'] if r in refs]
print(collections.Counter(p['type'] for p in prods))
json.dump(prods,open('prods.json','w'),ensure_ascii=False)
open('/Users/krikachali/Documents/Clothing/catalogue/data.js','w').write('window.PRODUCTS='+json.dumps(prods,ensure_ascii=False)+';')
# QA
import random;random.seed(3)
for p in random.sample(prods,8): print(p['ref'],p['type'],'|',p['name'],'|',p['colors'][:6],p['sizes'],p['fabric'],p['weight'],p['base'],p['sets'],p['custom'][:1])
