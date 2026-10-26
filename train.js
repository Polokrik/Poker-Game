/* ---------- GRILLE DE RANGES ---------- */
const chart = { spot: 'open', pos: 'BTN', sel: null };
function viewRanges() {
  const grid = rangeGrid(chart.spot, chart.spot === 'open' ? chart.pos : 'BTN');
  const pct = rangePct(chart.spot, chart.spot === 'open' ? chart.pos : 'BTN');
  const sel = chart.sel && grid.flat().find(c => c.label === chart.sel);
  $app.innerHTML = `<h1>Ranges preflop</h1>
    <p>Quelles mains jouer, et comment. Grille 13×13 : la diagonale = paires, au-dessus = mains assorties (s), en dessous = dépareillées (o). Ces ranges sont une approximation pédagogique d'un 6-max à 100 BB, pas une sortie de solveur.</p>
    <div class="row"><div><label>Situation</label><br><select id="sp">${Object.entries(SPOT_NAMES).map(([k, v]) => `<option value="${k}" ${k === chart.spot ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    ${chart.spot === 'open' ? `<div><label>Position</label><br><select id="ps">${['UTG', 'MP', 'CO', 'BTN', 'SB'].map(p => `<option ${p === chart.pos ? 'selected' : ''}>${p}</option>`).join('')}</select></div>` : ''}
    <div><label>Part des mains jouées</label><br><b class="eq" style="font-size:1.4rem">${pct.toFixed(0)} %</b></div></div>
    <div class="rgrid">${grid.map(row => row.map(c => `<button class="rc ${c.action} ${c.label === chart.sel ? 'sel' : ''}" data-l="${c.label}">${c.label}</button>`).join('')).join('')}</div>
    <div class="row legendrow"><span><i class="sw raise"></i>${chart.spot === 'open' ? 'Relancer' : chart.spot === 'vsOpen' ? '3-bet' : '4-bet'}</span>${chart.spot === 'open' ? '' : '<span><i class="sw call"></i>Suivre</span>'}<span><i class="sw fold"></i>Se coucher</span></div>
    ${sel ? `<div class="key"><b>${sel.label}</b> · ${ACTION_NAMES[sel.action]}<br>${explainRange(chart.spot, chart.pos, sel.label, sel.action)}</div>` : '<p class="meta">Touchez une case pour voir pourquoi.</p>'}`;
  document.getElementById('sp').onchange = e => { chart.spot = e.target.value; chart.sel = null; viewRanges(); };
  const ps = document.getElementById('ps'); if (ps) ps.onchange = e => { chart.pos = e.target.value; viewRanges(); };
  document.querySelectorAll('.rc').forEach(b => b.onclick = () => { chart.sel = b.dataset.l; viewRanges(); });
}

/* ---------- ENTRAÎNEUR PREFLOP ---------- */
const pre = { q: null, streak: 0, best: 0, n: 0, ok: 0 };
function newPreSpot() {
  const roll = Math.random();
  const spot = roll < 0.6 ? 'open' : roll < 0.9 ? 'vsOpen' : 'vs3bet';
  const pos = spot === 'open' ? ['UTG', 'MP', 'CO', 'BTN', 'SB'][Math.floor(Math.random() * 5)] : 'BTN';
  let cards, label, tries = 0;
  const thr = spot === 'open' ? OPEN_MIN[pos] : spot === 'vsOpen' ? 9 : 11;
  do {
    cards = shuffle(fullDeck()).slice(0, 2); label = handLabel(cards[0], cards[1]); tries++;
  } while (tries < 300 && !(Math.abs(labelScore(label) - thr) <= 3 || (Math.random() < 0.3)));
  return { spot, pos, cards, label, answer: rangeAction(spot, pos, label) };
}
function viewPre() {
  if (!pre.q) pre.q = newPreSpot();
  const q = pre.q, opts = q.spot === 'open' ? ['fold', 'raise'] : ['fold', 'call', 'raise'];
  const ctx = { open: `Tout le monde s'est couché avant vous. Vous êtes en <b>${q.pos}</b>.`, vsOpen: 'Un joueur a ouvert à 3 BB avant vous. Vous êtes au <b>bouton</b>.', vs3bet: 'Vous avez ouvert, un joueur vous 3-bet. Vous êtes au <b>bouton</b>.' }[q.spot];
  const raiseName = q.spot === 'open' ? 'Relancer' : q.spot === 'vsOpen' ? '3-bet' : '4-bet';
  $app.innerHTML = `<h1>Entraînement preflop</h1>
    <div class="row"><span class="pill">Série ${pre.streak}</span><span class="pill">Record ${pre.best}</span><span class="pill">${pre.n ? Math.round(pre.ok / pre.n * 100) : 0} % de réussite (${pre.n})</span></div>
    <div class="q" style="margin-top:1rem"><p>${ctx}</p><div class="center-cards"><span class="cards">${q.cards.map(c => cardHTML(cardKey(c))).join('')}</span></div>
    <div id="opts">${opts.map(o => `<button class="opt" data-a="${o}">${o === 'raise' ? raiseName : ACTION_NAMES[o]}</button>`).join('')}</div><div id="fb"></div></div>
    <p class="meta">60 % des spots sont des ouvertures, 30 % des réponses à une ouverture, 10 % des réponses à une 3-bet, proportions proches de la vraie vie. Les mains limites sont sur-représentées pour vous entraîner là où ça compte.</p>`;
  document.querySelectorAll('#opts .opt').forEach(b => b.onclick = () => {
    const ok = b.dataset.a === q.answer;
    pre.n++; if (ok) { pre.ok++; pre.streak++; pre.best = Math.max(pre.best, pre.streak); } else pre.streak = 0;
    document.querySelectorAll('#opts .opt').forEach(x => { x.disabled = true; if (x.dataset.a === q.answer) x.classList.add('good'); });
    if (!ok) b.classList.add('bad');
    document.getElementById('fb').innerHTML = `<div class="fb"><b style="color:var(--${ok ? 'green' : 'red'})">${ok ? 'Correct' : 'Incorrect'}</b> · ${q.label}<br>${explainRange(q.spot, q.pos, q.label, q.answer)}</div><p><button class="btn" id="nx">Suivant</button></p>`;
    document.getElementById('nx').onclick = () => { pre.q = null; viewPre(); };
  });
}

/* ---------- EXERCICES DE CALCUL ---------- */
const drill = { q: null, streak: 0, n: 0, ok: 0, kind: 'mix' };
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function mkOptions(correct, spread, fmt) {
  const set = new Set([correct]);
  let guard = 0;
  while (set.size < 4 && guard++ < 50) { const v = Math.max(0, correct + (rint(-3, 3) || 1) * spread); set.add(v); }
  return shuffle([...set]).map(v => ({ v, t: fmt(v), ok: v === correct }));
}
function newDrill(kind) {
  const kinds = ['odds', 'outs', 'combos', 'mdf', 'ev'];
  kind = kind === 'mix' ? kinds[rint(0, kinds.length - 1)] : kind;
  if (kind === 'odds') {
    const pot = rint(4, 30) * 10, bet = Math.round(pot * [0.33, 0.5, 0.66, 1][rint(0, 3)] / 5) * 5;
    const ans = Math.round(bet / (pot + 2 * bet) * 100);
    return { kind, q: `Le pot est de ${pot}. L'adversaire mise ${bet}. Quelle équité faut-il pour que payer soit rentable ?`, opts: mkOptions(ans, 4, v => v + ' %'), e: `Vous payez ${bet} pour gagner ${pot + 2 * bet} au total (pot ${pot} + sa mise ${bet} + votre call ${bet}) : ${bet} ÷ ${pot + 2 * bet} = <b>${ans} %</b>. Formule : Call ÷ (Pot + Mise + Call).` };
  }
  if (kind === 'outs') {
    const draws = [['un tirage couleur', 9], ['un tirage quinte ouvert', 8], ['un tirage quinte ventral', 4], ['deux overcards', 6], ['un tirage couleur + tirage quinte ventral', 12], ['une paire cherchant le brelan (set)', 2]];
    const [name, outs] = draws[rint(0, draws.length - 1)], street = Math.random() < 0.5 ? 'flop' : 'turn';
    const mult = street === 'flop' ? 4 : 2, ans = outs * mult;
    return { kind, q: `Vous avez ${name} (${outs} outs) au ${street}. Quelle est votre équité approximative (règle du ${mult}) ?`, opts: mkOptions(ans, 4, v => v + ' %'), e: `${outs} outs × ${mult} = <b>${ans} %</b>. Au flop on multiplie par 4 (deux cartes à venir), au turn par 2. La règle est approximative : elle surestime un peu au-delà de 8 outs.` };
  }
  if (kind === 'combos') {
    const sets = [
      ['une paire de poche (ex. QQ)', 6, 'Une paire : 6 combinaisons (choisir 2 couleurs parmi 4).'],
      ['AKs (assortis, toutes couleurs confondues)', 4, 'Une combinaison par couleur : 4.'],
      ['AKo (dépareillés)', 12, '4 × 3 = 12 façons de choisir un As et un Roi de couleurs différentes.'],
      ['AK (assortis ou non)', 16, '12 dépareillés + 4 assortis = 16.'],
      ['une paire de Rois quand un Roi est sur le board', 3, 'Il ne reste que 3 Rois, soit 3 combinaisons.'],
      ['une paire de Rois quand deux Rois sont sur le board', 1, 'Il ne reste que 2 Rois : 1 seule combinaison.'],
      ['AKo quand un As est sur le board', 9, 'Il reste 3 As et 4 Rois, mais les dépareillés : 3 × 4 − 3 couples assortis = 9.']
    ];
    const [name, ans, why] = sets[rint(0, sets.length - 1)];
    return { kind, q: `Combien de combinaisons pour ${name} ?`, opts: mkOptions(ans, ans > 6 ? 3 : 1, v => String(v)), e: `<b>${ans}</b>. ${why}` };
  }
  if (kind === 'mdf') {
    const pot = rint(2, 20) * 10, frac = [0.33, 0.5, 0.66, 1, 1.5][rint(0, 4)], bet = Math.round(pot * frac);
    const ans = Math.round(pot / (pot + bet) * 100);
    return { kind, q: `L'adversaire mise ${bet} dans un pot de ${pot}. Quelle part de votre range devez-vous défendre (MDF) ?`, opts: mkOptions(ans, 5, v => v + ' %'), e: `MDF = Pot ÷ (Pot + Mise) = ${pot} ÷ ${pot + bet} = <b>${ans} %</b>. Moins, et il gagne à coup sûr avec n'importe quel bluff.` };
  }
  const pot = rint(5, 20) * 10, bet = rint(2, 10) * 10, eq = rint(2, 8) * 10;
  const ans = Math.round(eq / 100 * pot - (1 - eq / 100) * bet);
  return { kind, q: `Le pot contient ${pot} (mise adverse comprise). Vous payez ${bet} avec ${eq} % d'équité, sans enchères futures. Quelle est l'espérance de gain (EV) du call ?`, opts: mkOptions(ans, Math.max(5, Math.round(bet / 4)), v => (v >= 0 ? '+' : '') + v), e: `EV = ${eq} % × ${pot} − ${100 - eq} % × ${bet} = <b>${ans >= 0 ? '+' : ''}${ans}</b>. ${ans >= 0 ? 'Call rentable.' : 'Call perdant à long terme.'}` };
}
function viewDrill() {
  if (!drill.q) drill.q = newDrill(drill.kind);
  const q = drill.q;
  $app.innerHTML = `<h1>Calculs rapides</h1>
    <p>Les chiffres qui reviennent à chaque décision. À force de répétition, ils deviennent automatiques.</p>
    <div class="row"><select id="dk">${[['mix', 'Mélange'], ['odds', 'Cotes du pot'], ['outs', 'Outs et règle du 2/4'], ['combos', 'Combinatoire'], ['mdf', 'MDF'], ['ev', 'Espérance de gain']].map(([k, n]) => `<option value="${k}" ${k === drill.kind ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <span class="pill">Série ${drill.streak}</span><span class="pill">${drill.n ? Math.round(drill.ok / drill.n * 100) : 0} % (${drill.n})</span></div>
    <div class="q" style="margin-top:1rem"><h2 style="margin-top:0">${q.q}</h2><div id="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}">${o.t}</button>`).join('')}</div><div id="fb"></div></div>`;
  document.getElementById('dk').onchange = e => { drill.kind = e.target.value; drill.q = null; viewDrill(); };
  document.querySelectorAll('#opts .opt').forEach(b => b.onclick = () => {
    const o = q.opts[+b.dataset.i];
    drill.n++; if (o.ok) { drill.ok++; drill.streak++; } else drill.streak = 0;
    document.querySelectorAll('#opts .opt').forEach((x, i) => { x.disabled = true; if (q.opts[i].ok) x.classList.add('good'); });
    if (!o.ok) b.classList.add('bad');
    document.getElementById('fb').innerHTML = `<div class="fb"><b style="color:var(--${o.ok ? 'green' : 'red'})">${o.ok ? 'Correct' : 'Incorrect'}</b><br>${q.e}</div><p><button class="btn" id="nx">Suivant</button></p>`;
    document.getElementById('nx').onclick = () => { drill.q = null; viewDrill(); };
  });
}
