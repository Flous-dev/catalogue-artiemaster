(() => {
  const P = window.PRODUCTS.filter(p => p.type !== 'Catalogues').concat(window.PRODUCTS.filter(p => p.type === 'Catalogues'));
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ALBUM = id => `https://artiemaster.x.yupoo.com/albums/${id}?uid=1`;
  const cover = p => `img/${p.id}_c.jpg`;

  const TYPES = ['T-shirts & polos', 'Manches longues', 'Sweats & hoodies', 'Vestes & zippés', 'Pantalons', 'Shorts', 'Débardeurs', 'Casquettes', 'Catalogues'];
  const SEASONS = ['Automne-Hiver 2026', 'Printemps-Été 2026', 'Automne-Hiver 2025', 'Printemps-Été 2025'];
  const WEIGHTS = [['light', 'Léger', '< 220 g', w => w < 220], ['mid', 'Standard', '220–300 g', w => w >= 220 && w <= 300], ['heavy', 'Épais', '> 300 g', w => w > 300]];
  const COLORS = [['noir', 'Noir'], ['gris', 'Gris'], ['blanc', 'Blanc / crème'], ['beige', 'Beige / abricot / sable'], ['marron', 'Marron / café'], ['vert', 'Vert'], ['bleu', 'Bleu'], ['rouge', 'Rouge / bordeaux'], ['rose', 'Rose'], ['violet', 'Violet'], ['jaune', 'Jaune / orange']];
  const colorFam = c => {
    c = c.toLowerCase();
    const f = [];
    if (/noir/.test(c)) f.push('noir');
    if (/gris|argile|asphalte|carbone|fumée/.test(c)) f.push('gris');
    if (/blanc|ivoire|crème/.test(c)) f.push('blanc');
    if (/beige|abricot|sable|kaki|camel|blé/.test(c)) f.push('beige');
    if (/café|marron|brun|caramel|chocolat/.test(c)) f.push('marron');
    if (/vert|olive|menthe/.test(c)) f.push('vert');
    if (/bleu|marine|indigo|klein/.test(c)) f.push('bleu');
    if (/rouge|bordeaux|brique/.test(c)) f.push('rouge');
    if (/rose/.test(c)) f.push('rose');
    if (/violet|prune|pervenche/.test(c)) f.push('violet');
    if (/jaune|orange|curcuma/.test(c)) f.push('jaune');
    return f;
  };
  P.forEach(p => {
    p.w = +p.weight || 0;
    p.fams = new Set(p.colors.flatMap(colorFam));
    p.c30 = p.custom.some(c => /30 pièces|DTG/.test(c));
    p.c50 = p.custom.some(c => /50 pièces|broderie/.test(c));
    p.hay = [p.ref, p.name, p.zh, p.type, p.season, ...p.colors, p.fabric, p.weight && p.weight + 'g', p.base].join(' ').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  });

  // ---- state
  const st = { type: 'all', q: '', seasons: new Set(), flags: new Set(), weights: new Set(), colors: new Set(), sort: 'order', onlySel: false };
  let sel = [];
  try { sel = JSON.parse(localStorage.getItem('sel') || '[]'); } catch (e) {}
  const saveSel = () => { try { localStorage.setItem('sel', JSON.stringify(sel)); } catch (e) {} $('#selCount').textContent = sel.length; };

  // ---- filters UI
  const FLAGS = {
    basic: p => p.basic, best: p => p.best, printed: p => p.printed, noprint: p => !p.printed, women: p => p.women,
    set: p => p.sets.length > 0, c30: p => p.c30, c50: p => p.c50,
  };
  const FLAG_LABEL = { basic: 'Basiques unis', best: 'Best-sellers', printed: 'Imprimés', noprint: 'Sans imprimé', women: 'Femme', set: 'Ensembles', c30: 'Logo dès 30', c50: 'Sérigraphie dès 50' };

  function matches(p, skip) {
    if (st.onlySel && !sel.includes(p.id)) return false;
    if (skip !== 'type' && st.type !== 'all' && p.type !== st.type) return false;
    if (st.q) {
      const words = st.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean);
      if (!words.every(w => p.hay.includes(w))) return false;
    }
    if (skip !== 'season' && st.seasons.size && !st.seasons.has(p.season)) return false;
    for (const f of st.flags) if (!FLAGS[f](p)) return false;
    if (skip !== 'weight' && st.weights.size && !WEIGHTS.some(([k, , , fn]) => st.weights.has(k) && p.w && fn(p.w))) return false;
    if (skip !== 'color' && st.colors.size && ![...st.colors].some(c => p.fams.has(c))) return false;
    return true;
  }

  function renderTypes() {
    const base = P.filter(p => matches(p, 'type'));
    const counts = {};
    base.forEach(p => counts[p.type] = (counts[p.type] || 0) + 1);
    $('#types').innerHTML = `<button class="tab star ${st.flags.has('basic') ? 'on' : ''}" data-basic>★ Basiques à personnaliser</button>` + [['all', 'Tout', base.length], ...TYPES.filter(t => counts[t]).map(t => [t, t, counts[t]])]
      .map(([k, l, n]) => `<button class="tab ${st.type === k ? 'on' : ''}" data-type="${esc(k)}">${esc(l)} <span>${n}</span></button>`).join('');
  }
  function renderSide() {
    const bs = P.filter(p => matches(p, 'season'));
    $('#fSeason').innerHTML = SEASONS.map(s => {
      const n = bs.filter(p => p.season === s).length;
      return `<label class="chk"><input type="checkbox" data-season="${s}" ${st.seasons.has(s) ? 'checked' : ''}> ${s}<span class="n">${n}</span></label>`;
    }).join('');
    const bw = P.filter(p => matches(p, 'weight'));
    $('#fWeight').innerHTML = WEIGHTS.map(([k, l, r, fn]) => {
      const n = bw.filter(p => p.w && fn(p.w)).length;
      return `<label class="chk"><input type="checkbox" data-weight="${k}" ${st.weights.has(k) ? 'checked' : ''}> ${l} <small style="display:inline">${r}</small><span class="n">${n}</span></label>`;
    }).join('');
    $('#fColors').innerHTML = '<div class="pills">' + COLORS.map(([k, l]) =>
      `<button class="pill ${st.colors.has(k) ? 'on' : ''}" data-color="${k}">${l}</button>`).join('') + '</div>';
    document.querySelectorAll('[data-flag]').forEach(i => i.checked = st.flags.has(i.dataset.flag));
  }
  function renderActive() {
    const chips = [];
    if (st.onlySel) chips.push(['sel', '', 'Ma sélection']);
    if (st.q) chips.push(['q', '', `« ${st.q} »`]);
    st.seasons.forEach(s => chips.push(['season', s, s]));
    st.flags.forEach(f => chips.push(['flag', f, FLAG_LABEL[f]]));
    st.weights.forEach(w => chips.push(['weight', w, WEIGHTS.find(x => x[0] === w)[1]]));
    st.colors.forEach(c => chips.push(['color', c, COLORS.find(x => x[0] === c)[1]]));
    $('#active').innerHTML = chips.map(([k, v, l]) => `<button data-rm="${k}" data-v="${esc(v)}">${esc(l)} ×</button>`).join('');
  }

  let list = [];
  function render() {
    list = P.filter(p => matches(p));
    const s = st.sort;
    if (s === 'ref') list.sort((a, b) => a.ref.localeCompare(b.ref, 'fr', { numeric: true }));
    else if (s === 'wdesc') list.sort((a, b) => b.w - a.w);
    else if (s === 'wasc') list.sort((a, b) => (a.w || 999) - (b.w || 999));
    else if (s === 'colors') list.sort((a, b) => b.colors.length - a.colors.length);
    $('#count').textContent = `${list.length} produit${list.length > 1 ? 's' : ''}`;
    $('#grid').innerHTML = list.map(card).join('');
    $('#empty').hidden = list.length > 0;
    renderTypes(); renderSide(); renderActive();
  }
  function card(p) {
    const tags = [];
    if (p.best) tags.push('<span class="tag best">Best-seller</span>');
    if (p.basic) tags.push('<span class="tag">Basique</span>');
    if (p.women) tags.push('<span class="tag">Femme</span>');
    const meta = [];
    if (p.w) meta.push(`${p.w} g`);
    if (p.colors.length) meta.push(`${p.colors.length} coloris`);
    return `<article class="card" data-id="${p.id}">
      <div class="ph"><img loading="lazy" src="${cover(p)}" alt="" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='img/${p.id}_0.jpg'}else{this.style.opacity=0}">
        ${p.ref ? `<span class="ref">${esc(p.ref)}</span>` : ''}
        <button class="fav ${sel.includes(p.id) ? 'on' : ''}" data-fav="${p.id}" title="Ajouter à ma sélection">♥</button>
        <div class="tags">${tags.join('')}</div></div>
      <div class="body"><div class="name">${esc(p.name)}</div><div class="meta">${meta.map(esc).join('<span>·</span>')}${p.sizes ? `<span class="sz-sep">·</span><span class="sz">${esc(p.sizes.replace(/ · /g, '–').replace(/^(\S+?)–.*–(\S+)$/, '$1–$2'))}</span>` : ''}</div></div>
    </article>`;
  }

  // ---- product sheet
  let cur = null, gi = 0;
  function imgs(p) {
    const a = [cover(p)];
    for (let i = 0; i < p.nimg; i++) a.push(`img/${p.id}_${i}.jpg`);
    return a;
  }
  function showImg(i) {
    const a = imgs(cur);
    gi = (i + a.length) % a.length;
    $('#gImg').src = a[gi];
    $('#gCount').textContent = `${gi + 1} / ${a.length}`;
    document.querySelectorAll('#gThumbs img').forEach((t, k) => t.classList.toggle('on', k === gi));
    const on = document.querySelector('#gThumbs img.on');
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function open(id) {
    const p = byId[id]; if (!p) return;
    cur = p;
    const a = imgs(p);
    $('#gThumbs').innerHTML = a.map((s, k) => `<img src="${s}" data-g="${k}" alt="" onerror="this.style.display='none'">`).join('');
    $('#gPrev').hidden = $('#gNext').hidden = a.length < 2;
    showImg(0);
    const specs = [
      ['Catégorie', p.type], ['Collection', p.season], ['Grammage', p.w ? `${p.w} g` : ''], ['Matière', p.fabric],
      ['Tailles', p.sizes], ['T-shirt de base', p.base ? `<a href="#" data-ref="${esc(p.base)}">${esc(p.base)}</a>` : ''],
    ].filter(x => x[1]);
    const baseP = p.base && P.find(x => x.ref === p.base);
    if (baseP) specs.find(x => x[0] === 'T-shirt de base')[1] = `<a href="#" data-open="${baseP.id}">${esc(p.base)} — voir le modèle vierge</a>`;
    else if (p.base) specs.find(x => x[0] === 'T-shirt de base')[1] = esc(p.base);
    const inSel = sel.includes(p.id);
    const gt = 'https://translate.google.com/?sl=zh-CN&tl=fr&op=translate&text=' + encodeURIComponent((p.zh + '\n' + p.desc).slice(0, 4500));
    $('#info').innerHTML = `
      ${p.ref ? `<span class="refbig">Réf. ${esc(p.ref)}</span>` : ''}
      <h1>${esc(p.name)}</h1>
      <div class="zh"><span>${esc(p.zh)}</span><button data-copy="${esc(p.zh)}">Copier</button></div>
      <dl class="specs">${specs.map(([k, v]) => `<dt>${k}</dt><dd>${k === 'T-shirt de base' ? v : esc(v)}</dd>`).join('')}</dl>
      ${p.colors.length ? `<div class="sec"><h3>${p.colors.length} coloris</h3><div class="colors">${p.colors.map(c => `<span>${esc(c)}</span>`).join('')}</div></div>` : ''}
      ${p.sets.length ? `<div class="sec"><h3>Se porte en ensemble avec</h3><div class="chips">${p.sets.map(([r, id]) => `<a href="#" data-open="${id}">${esc(r)} · ${esc(byId[id]?.type || '')}</a>`).join('')}</div></div>` : ''}
      ${p.custom.length ? `<div class="sec"><h3>Minimums de commande</h3><ul class="custom">${p.custom.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}
      <p class="price-note"><strong>Prix :</strong> non publié par le fournisseur, à demander sur WeChat (bouton « Copier » ci-dessus pour la référence).</p>
      <div class="actions">
        <button class="btn" data-fav="${p.id}">${inSel ? '♥ Dans ma sélection' : '♡ Ajouter à ma sélection'}</button>
        <a class="btn ghost" href="${ALBUM(p.id)}" target="_blank" rel="noopener">Album d'origine (${p.n} photos)</a>
      </div>
      ${p.desc ? `<details><summary>Fiche complète du fournisseur (chinois)</summary><pre>${esc(p.desc)}</pre>
        <p><a href="${gt}" target="_blank" rel="noopener">Traduire avec Google Traduction ↗</a></p></details>` : ''}
    `;
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#modal .sheet').scrollTop = 0;
    history.replaceState(null, '', '#p=' + id);
  }
  function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.hidden = true);
    document.body.style.overflow = '';
    if (location.hash) history.replaceState(null, '', location.pathname);
  }

  // ---- selection
  function toggleSel(id) {
    sel = sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id];
    saveSel();
    document.querySelectorAll(`[data-fav="${id}"]`).forEach(b => {
      b.classList.toggle('on', sel.includes(id));
      if (b.classList.contains('btn')) b.textContent = sel.includes(id) ? '♥ Dans ma sélection' : '♡ Ajouter à ma sélection';
    });
    if (st.onlySel) render();
    if (!$('#selModal').hidden) renderSel();
  }
  function renderSel() {
    $('#selList').innerHTML = sel.length ? sel.map(id => byId[id]).filter(Boolean).map(p => `
      <div class="sel-item"><img src="${cover(p)}" alt=""><div><b>${esc(p.ref)} — ${esc(p.name)}</b><small>${esc(p.zh)}</small></div>
      <button data-fav="${p.id}" title="Retirer">×</button></div>`).join('') : '<p class="muted">Aucun produit pour l\'instant. Clique sur ♥ sur une fiche pour l\'ajouter.</p>';
  }
  function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 1800); }
  async function copy(t) {
    try { await navigator.clipboard.writeText(t); toast('Copié'); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Copié'); }
  }

  // ---- events
  document.addEventListener('click', e => {
    const t = e.target;
    const fav = t.closest('[data-fav]');
    if (fav) { e.stopPropagation(); toggleSel(fav.dataset.fav); return; }
    const op = t.closest('[data-open]');
    if (op) { e.preventDefault(); open(op.dataset.open); return; }
    const c = t.closest('.card');
    if (c) { open(c.dataset.id); return; }
    if (t.closest('[data-close]')) { closeModals(); return; }
    if (t.closest('[data-basic]')) { st.flags.has('basic') ? st.flags.delete('basic') : st.flags.add('basic'); render(); return; }
    const tab = t.closest('[data-type]');
    if (tab) { st.type = tab.dataset.type; render(); window.scrollTo({ top: 0 }); return; }
    const col = t.closest('[data-color]');
    if (col) { const k = col.dataset.color; st.colors.has(k) ? st.colors.delete(k) : st.colors.add(k); render(); return; }
    const rm = t.closest('[data-rm]');
    if (rm) {
      const k = rm.dataset.rm, v = rm.dataset.v;
      if (k === 'q') { st.q = ''; $('#q').value = ''; }
      else if (k === 'sel') st.onlySel = false;
      else ({ season: st.seasons, flag: st.flags, weight: st.weights, color: st.colors })[k].delete(v);
      render(); return;
    }
    const cp = t.closest('[data-copy]');
    if (cp) { copy(cp.dataset.copy); return; }
    const g = t.closest('[data-g]');
    if (g) { showImg(+g.dataset.g); return; }
  });
  document.addEventListener('change', e => {
    const i = e.target;
    if (i.dataset.season) i.checked ? st.seasons.add(i.dataset.season) : st.seasons.delete(i.dataset.season);
    else if (i.dataset.flag) i.checked ? st.flags.add(i.dataset.flag) : st.flags.delete(i.dataset.flag);
    else if (i.dataset.weight) i.checked ? st.weights.add(i.dataset.weight) : st.weights.delete(i.dataset.weight);
    else return;
    render();
  });
  let qt;
  $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { st.q = e.target.value.trim(); render(); }, 120); });
  $('#sort').addEventListener('change', e => { st.sort = e.target.value; render(); });
  const reset = () => { Object.assign(st, { type: 'all', q: '', onlySel: false }); ['seasons', 'flags', 'weights', 'colors'].forEach(k => st[k].clear()); $('#q').value = ''; render(); };
  $('#reset').onclick = reset; $('#reset2').onclick = reset;
  $('#gPrev').onclick = () => showImg(gi - 1);
  $('#gNext').onclick = () => showImg(gi + 1);
  $('#btnSel').onclick = () => { renderSel(); $('#selModal').hidden = false; document.body.style.overflow = 'hidden'; };
  $('#btnGloss').onclick = () => { $('#glossModal').hidden = false; document.body.style.overflow = 'hidden'; };
  $('#copySel').onclick = () => copy(sel.map(id => byId[id]).filter(Boolean).map(p => `${p.zh}\n${ALBUM(p.id)}`).join('\n\n'));
  $('#showSel').onclick = () => { st.onlySel = true; closeModals(); render(); };
  $('#clearSel').onclick = () => { if (confirm('Vider la sélection ?')) { sel = []; saveSel(); renderSel(); render(); } };
  $('#btnFilters').onclick = () => $('#filters').classList.add('open');
  const fh = $('.filters-head');
  fh.insertAdjacentHTML('beforeend', '<button class="btn only-mobile" id="closeF">Voir les produits</button>');
  $('#closeF').onclick = () => $('#filters').classList.remove('open');
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModals();
    if (!$('#modal').hidden) { if (e.key === 'ArrowLeft') showImg(gi - 1); if (e.key === 'ArrowRight') showImg(gi + 1); }
  });
  // swipe on gallery
  let sx = null;
  $('.main-img').addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  $('.main-img').addEventListener('touchend', e => { if (sx == null) return; const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 40) showImg(gi + (d < 0 ? 1 : -1)); sx = null; });

  saveSel();
  render();
  const m = location.hash.match(/p=(\d+)/);
  if (m) open(m[1]);
})();
