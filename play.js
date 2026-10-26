/* ---------- MODE JEU ---------- */
const SEAT_XY = [[50, 88], [17, 68], [17, 26], [50, 7], [83, 26], [83, 68]];
const play = { g: null, timer: null, analysis: null, hint: false, dec: null };

function viewPlay() {
  clearTimeout(play.timer);
  if (!play.g) return playMenu();
  renderTable();
  stepGame();
}

function playMenu() {
  const st = store.get('play', { hands: 0, net: 0, ok: 0, near: 0, leak: 0 });
  $app.innerHTML = `<h1>Jouer</h1>
    <p>Cash game à 6 joueurs, blinds 10/20, tapis de départ 2 000 (100 BB). Vous affrontez 5 bots. Un coach optionnel vous donne l'équité de votre main et la cote du pot, et chaque main se termine par une revue de vos décisions.</p>
    <div class="levels">${Object.entries(LEVELS).map(([k, v]) => `<button class="lvl" data-l="${k}"><b>${v.name}</b><span>${{
      beginner: 'Joueurs larges et passifs : ils suivent beaucoup, relancent peu. Ne les bluffez pas, value-bettez.',
      intermediate: 'Joueurs solides et agressifs : peu de mains mais bien jouées. Respectez leurs relances.',
      advanced: 'Joueurs larges et agressifs : volent les blinds, 3-bettent en bluff, mettent la pression.' }[k]}</span></button>`).join('')}</div>
    ${st.hands ? `<h2>Votre bilan</h2><div class="stats"><div><b>${st.hands}</b><span>mains</span></div><div><b>${st.net >= 0 ? '+' : ''}${(st.net / 20).toFixed(1)}</b><span>big blinds</span></div><div><b>${st.ok}</b><span>décisions correctes</span></div><div><b>${st.leak}</b><span>erreurs</span></div></div>` : ''}`;
  document.querySelectorAll('.lvl').forEach(b => b.onclick = () => { play.g = newGame(b.dataset.l); play.dec = []; startNext(); });
}

function startNext() {
  play.g._saved = false; startHand(play.g); play.analysis = null; play.hint = false; play.dec = [];
  play.stackStart = play.g.players[0].stack + play.g.players[0].total;
  viewPlay();
}

function seatHTML(g, p) {
  const [x, y] = SEAT_XY[p.id];
  const turn = g.toAct === p.id && !g.over;
  const show = p.human || (g.over && p.shown) ;
  const cards = p.cards.length ? p.cards.map(c => show ? cardHTML(cardKey(c), 'sm') : '<span class="card sm back"></span>').join('') : '';
  const win = g.over && g.result && g.result.winners.find(w => w.id === p.id);
  return `<div class="seat ${p.folded ? 'folded' : ''} ${turn ? 'turn' : ''} ${win ? 'win' : ''}" style="left:${x}%;top:${y}%">
    <div class="sname">${p.name}<em>${posOf(g, p)}</em>${g.button === p.id ? '<i class="dealer">D</i>' : ''}</div>
    <div class="cards">${cards}</div>
    <div class="sstack">${p.stack}</div>
    ${p.bet ? `<div class="sbet">${p.bet}</div>` : ''}
    ${p.last ? `<div class="slast">${p.last}</div>` : ''}
    ${win ? `<div class="slast win">+${win.amount}</div>` : ''}</div>`;
}

function renderTable() {
  const g = play.g, me = g.players[0];
  const board = [0, 1, 2, 3, 4].map(i => g.board[i] ? cardHTML(cardKey(g.board[i])) : '<span class="card empty"></span>').join('');
  $app.innerHTML = `<div class="row" style="justify-content:space-between"><span class="pill">${LEVELS[g.level].name}</span><span class="pill">Main n°${g.hand}</span><button class="btn ghost" id="quit">Quitter</button></div>
    <div class="felt">${g.players.map(p => seatHTML(g, p)).join('')}
      <div class="center"><div class="potv">Pot ${pot(g)}</div><div class="cards">${board}</div></div></div>
    <div id="ctl"></div><div id="coach"></div><div id="rev"></div>
    <details class="logbox"><summary>Historique de la main</summary>${g.log.map(l => `<div>${l}</div>`).join('')}</details>`;
  document.getElementById('quit').onclick = () => { clearTimeout(play.timer); play.g = null; viewPlay(); };
}

function stepGame() {
  const g = play.g;
  if (g.over) return endOfHand();
  const p = g.players[g.toAct];
  if (!p.human) {
    play.timer = setTimeout(() => { const [t, a] = botDecide(g, p); act(g, p, t, a); renderTable(); stepGame(); }, 650);
    return;
  }
  humanControls();
  play.analysis = null;
  setTimeout(() => { if (play.g === g && g.toAct === 0 && !g.over) { play.analysis = analyze(g, g.players[0]); if (play.hint) showCoach(); } }, 30);
}

function humanControls() {
  const g = play.g, me = g.players[0], L = legal(g, me), box = document.getElementById('ctl');
  const potNow = pot(g);
  const rangeInput = L.canRaise ? `<div class="raise"><input type="range" id="rs" min="${L.minTo}" max="${L.maxTo}" step="10" value="${Math.min(L.maxTo, Math.max(L.minTo, Math.round(g.currentBet + (potNow + L.toCall) * 0.66)))}">
      <div class="row"><button class="btn ghost sm" data-f="0.5">½ pot</button><button class="btn ghost sm" data-f="0.75">¾ pot</button><button class="btn ghost sm" data-f="1">Pot</button><button class="btn ghost sm" data-f="max">Tapis</button></div></div>` : '';
  box.innerHTML = `<div class="actions">
      <button class="btn ghost" id="a-fold">Se coucher</button>
      <button class="btn" id="a-call">${L.canCheck ? 'Checker' : 'Suivre ' + L.toCall}</button>
      ${L.canRaise ? `<button class="btn gold" id="a-raise"></button>` : ''}
    </div>${rangeInput}<p><button class="btn ghost sm" id="hint">${play.hint ? 'Masquer le conseil' : 'Conseil du coach'}</button></p>`;
  const rs = document.getElementById('rs'), rb = document.getElementById('a-raise');
  const label = () => { if (rb) rb.textContent = `${g.currentBet === 0 ? 'Miser' : 'Relancer à'} ${rs.value}${+rs.value >= L.maxTo ? ' (tapis)' : ''}`; };
  if (rs) {
    label(); rs.oninput = label;
    box.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
      const f = b.dataset.f;
      rs.value = f === 'max' ? L.maxTo : Math.round((g.currentBet + (potNow + L.toCall) * +f) / 10) * 10;
      label();
    });
  }
  const go = (type, amt) => humanAct(type, amt);
  document.getElementById('a-fold').onclick = () => go('fold');
  document.getElementById('a-call').onclick = () => go(L.canCheck ? 'check' : 'call');
  if (rb) rb.onclick = () => go('raise', +rs.value);
  document.getElementById('hint').onclick = () => { play.hint = !play.hint; humanControls(); if (play.hint) showCoach(); else document.getElementById('coach').innerHTML = ''; };
  if (play.hint) showCoach();
}

function showCoach() {
  const g = play.g, me = g.players[0], box = document.getElementById('coach');
  if (!box || g.toAct !== 0) return;
  if (g.street === 'preflop') {
    const adv = preflopAdvice(posOf(g, me), me.cards, countRaises(g));
    box.innerHTML = `<div class="key"><b>Coach (preflop) : ${adv.label} en ${posOf(g, me)}</b><br>Action conseillée : <b>${adv.action === 'check' ? 'Checker' : ACTION_NAMES[adv.action]}</b>.<br>${adv.text}</div>`;
    return;
  }
  const a = play.analysis;
  if (!a) { box.innerHTML = '<div class="key">Calcul de l\'équité…</div>'; return; }
  const adj = Math.max(0, a.eq - 0.05);
  const verdict = a.toCall === 0
    ? (a.eq > 0.6 ? 'Vous êtes probablement devant : misez pour la valeur.' : a.eq > 0.4 ? 'Main moyenne : checker ou petite mise de contrôle.' : 'Main faible : checkez, ou bluffez seulement avec une bonne raison (position, blockers, peu d\'adversaires).')
    : (adj > a.need + 0.05 ? 'La cote est favorable : suivre est rentable.' : adj > a.need - 0.03 ? 'Décision serrée.' : 'Équité insuffisante pour payer : se coucher.');
  box.innerHTML = `<div class="key"><b>Coach</b><br>Équité contre ${a.opps} main(s) aléatoire(s) : <b>${(a.eq * 100).toFixed(0)} %</b>${a.toCall ? ` · équité nécessaire pour suivre : <b>${(a.need * 100).toFixed(0)} %</b> (${a.toCall} à payer pour un pot de ${a.pot + a.toCall})` : ''}.<br>${verdict}<br><small>L'équité est calculée contre des mains aléatoires : face à quelqu'un qui mise, son vrai range est plus fort, retirez 5 à 10 points.</small></div>`;
}

function humanAct(type, amt) {
  const g = play.g, me = g.players[0], L = legal(g, me);
  const snap = { street: g.street, pos: posOf(g, me), cards: me.cards.slice(), board: g.board.slice(), toCall: L.toCall, pot: pot(g), type, raises: countRaises(g), eq: play.analysis ? play.analysis.eq : null, need: play.analysis ? play.analysis.need : null };
  play.dec.push(snap);
  play.hint = false;
  act(g, me, type, amt);
  document.getElementById('coach').innerHTML = '';
  renderTable(); stepGame();
}

// Jugement d'une décision : 'ok' | 'near' | 'leak'
function judge(d) {
  const mine = d.type === 'raise' ? 'raise' : d.type === 'fold' ? 'fold' : 'call';
  if (d.street === 'preflop') {
    const adv = preflopAdvice(d.pos, d.cards, d.raises);
    const want = adv.action === 'check' ? 'call' : adv.action;
    if (mine === want) return { v: 'ok', t: `${adv.label} : ${ACTION_NAMES[want] || 'Checker'} était l'action standard.` };
    if (d.raises === 0 && mine === 'call' && d.pos !== 'BB' && want === 'raise') return { v: 'leak', t: `${adv.label} : limper est presque toujours une erreur, il fallait relancer.` };
    if ((mine === 'raise' && want === 'call') || (mine === 'call' && want === 'raise')) return { v: 'near', t: `${adv.label} : ${ACTION_NAMES[want]} était plus standard, ${ACTION_NAMES[mine].toLowerCase()} se défend.` };
    return { v: 'leak', t: `${adv.label} en ${d.pos} : ${ACTION_NAMES[want]} était recommandé, vous avez choisi ${ACTION_NAMES[mine].toLowerCase()}.` };
  }
  if (d.eq == null) return { v: 'near', t: 'Décision prise avant la fin du calcul d\'équité, non évaluée.' };
  const adj = d.eq - 0.05, e = Math.round(d.eq * 100), n = Math.round((d.need || 0) * 100);
  if (d.toCall > 0) {
    if (mine === 'fold' && adj > d.need + 0.1) return { v: 'leak', t: `Couché avec ${e} % d'équité alors que ${n} % suffisaient.` };
    if (mine !== 'fold' && adj < d.need - 0.08) return { v: 'leak', t: `Payé avec ${e} % d'équité alors qu'il en fallait ${n} %.` };
    return { v: 'ok', t: `${e} % d'équité pour ${n} % nécessaires : décision cohérente.` };
  }
  if (mine === 'call' && d.eq > 0.72) return { v: 'near', t: `Check avec ${e} % d'équité : vous laissez de la valeur sur la table.` };
  if (mine === 'raise' && d.eq < 0.3) return { v: 'near', t: `Mise avec ${e} % d'équité : un bluff, rentable seulement si l'adversaire se couche assez.` };
  return { v: 'ok', t: `${e} % d'équité : ligne raisonnable.` };
}

function endOfHand() {
  const g = play.g, me = g.players[0], res = g.result;
  renderTable();
  const net = me.stack - play.stackStart;
  const rows = play.dec.map(judge);
  const st = store.get('play', { hands: 0, net: 0, ok: 0, near: 0, leak: 0 });
  if (!g._saved) {
    g._saved = true;
    st.hands++; st.net += net; rows.forEach(r => st[r.v]++); store.set('play', st);
  }
  g._saved = true;
  const winners = res.winners.map(w => `${g.players[w.id].name} +${w.amount}${w.hand ? ' (' + w.hand + ')' : ''}`).join(', ');
  document.getElementById('ctl').innerHTML = `<div class="q"><b>${net > 0 ? 'Main gagnée' : net < 0 ? 'Main perdue' : 'Main neutre'} : ${net >= 0 ? '+' : ''}${net}</b> <span class="pill">${winners}</span>
    <p class="row"><button class="btn" id="next">Main suivante</button>${me.stack <= 0 ? '' : ''}</p></div>`;
  const labels = { ok: 'Correct', near: 'Discutable', leak: 'Erreur' };
  document.getElementById('rev').innerHTML = rows.length ? `<h2>Revue de vos décisions</h2><table>${rows.map((r, i) => {
    const d = play.dec[i];
    return `<tr><td><span class="tag ${r.v}">${labels[r.v]}</span></td><td>${d.street}${d.board.length ? ' · ' + d.board.map(c => cardHTML(cardKey(c), 'sm')).join('') : ''}<br><small>${r.t}</small></td></tr>`;
  }).join('')}</table>` : '';
  document.getElementById('next').onclick = startNext;
}
