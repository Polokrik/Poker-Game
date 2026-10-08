const $app = document.getElementById('app');
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('ha:' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('ha:' + k, JSON.stringify(v)); } catch {} }
};
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function cardHTML(t, cls = '') {
  const c = parseCard(t), red = c.s === 'h' || c.s === 'd';
  const r = c.r === 8 ? '10' : RANKS[c.r];
  return `<span class="card ${red ? 'r' : ''} ${cls}">${r}<i>${SUIT_SYM[c.s]}</i></span>`;
}
// Remplace [As] par une carte ; hérite de la classe sm si le conteneur la porte
const rich = html => html
  .replace(/<span class="cards( sm)?">([\s\S]*?)<\/span>(?!<\/span>)/g, (m, sm, inner) =>
    `<span class="cards">${inner.replace(/\[([2-9TJQKA][shdc])\]/g, (_, t) => cardHTML(t, sm ? 'sm' : ''))}</span>`)
  .replace(/\[([2-9TJQKA][shdc])\]/g, (_, t) => cardHTML(t, 'sm'));

const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- COURS ---------- */
function viewLearn(id) {
  const ch = CHAPTERS.find(c => c.id === +id) || CHAPTERS[0];
  const done = store.get('read', {});
  $app.innerHTML = `<div class="layout">
    <aside class="side">${CHAPTERS.map(c => `<a href="#/learn/${c.id}" class="${c.id === ch.id ? 'on' : ''}">${c.id}. ${c.title}${done[c.id] ? '<span class="ok">✓</span>' : ''}</a>`).join('')}</aside>
    <section><h1>${ch.id}. ${ch.title}</h1>
      ${ch.lessons.map((l, i) => `<div class="lesson"><h3>${ch.id}.${i + 1} ${l.t}</h3>${rich(l.h)}</div>`).join('')}
      <div class="row" style="margin-top:1.5rem">
        <button class="btn" id="mark">${done[ch.id] ? 'Chapitre lu ✓' : 'Marquer comme lu'}</button>
        <a class="btn ghost" href="#/quiz/${ch.id}" style="text-decoration:none">Quiz de ce chapitre</a>
      </div></section></div>`;
  document.getElementById('mark').onclick = () => { done[ch.id] = true; store.set('read', done); viewLearn(ch.id); };
}

/* ---------- QUIZ ---------- */
let quiz = null;
function viewQuiz(chapter) {
  if (!quiz) {
    const scores = store.get('scores', {});
    $app.innerHTML = `<h1>Quiz</h1><div class="q">
      <div class="row"><div><label>Chapitre</label><br><select id="qc"><option value="0">Tous (mixte)</option>${CHAPTERS.map(c => `<option value="${c.id}" ${+chapter === c.id ? 'selected' : ''}>${c.id}. ${c.title}</option>`).join('')}</select></div>
      <div><label>Niveau</label><br><select id="qd"><option value="">Tous</option><option value="beginner">Débutant</option><option value="intermediate">Intermédiaire</option><option value="advanced">Avancé</option></select></div></div>
      <p style="margin-top:1rem"><button class="btn" id="go">Commencer</button></p></div>
      ${Object.keys(scores).length ? `<h2>Meilleurs scores</h2><table>${CHAPTERS.map(c => scores[c.id] ? `<tr><td>${c.id}. ${c.title}</td><td>${scores[c.id]} %</td></tr>` : '').join('')}</table>` : ''}`;
    document.getElementById('go').onclick = () => {
      const c = +document.getElementById('qc').value, d = document.getElementById('qd').value;
      let pool = QUESTIONS.filter(q => (!c || q.c === c) && (!d || q.d === d));
      if (!pool.length) pool = QUESTIONS.filter(q => !c || q.c === c);
      quiz = { list: shuffle(pool).slice(0, 12), i: 0, score: 0, byCh: {}, chapter: c };
      viewQuiz();
    };
    return;
  }
  if (quiz.i >= quiz.list.length) return quizResult();
  const q = quiz.list[quiz.i];
  let body = '';
  if (q.type === 'mc') {
    const order = shuffle(q.o.map((t, i) => i));
    body = order.map(i => `<button class="opt" data-i="${i}">${rich(esc(q.o[i]).replace(/\[/g, '[').replace(/&amp;/g, '&'))}</button>`).join('');
  } else if (q.type === 'tf') {
    body = `<button class="opt" data-i="1">Vrai</button><button class="opt" data-i="0">Faux</button>`;
  } else {
    q._pick = [];
    body = `<p class="pill">Touchez dans l'ordre, du plus fort au plus faible</p>${shuffle(q.items).map(t => `<button class="opt" data-t="${esc(t)}">${esc(t)}</button>`).join('')}`;
  }
  $app.innerHTML = `<div class="row" style="justify-content:space-between"><span class="pill">Question ${quiz.i + 1}/${quiz.list.length}</span><span class="pill">Score ${quiz.score}</span></div>
    <div class="bar" style="margin:.6rem 0 1rem"><div style="width:${quiz.i / quiz.list.length * 100}%"></div></div>
    <div class="q"><h2 style="margin-top:0">${rich(q.q)}</h2><div id="opts">${body}</div><div id="fb"></div></div>`;
  const finish = ok => {
    if (ok) quiz.score++;
    const b = (quiz.byCh[q.c] ||= { ok: 0, n: 0 }); b.n++; if (ok) b.ok++;
    document.getElementById('fb').innerHTML = `<div class="fb"><b style="color:var(--${ok ? 'green' : 'red'})">${ok ? 'Correct' : 'Incorrect'}</b><br>${rich(q.e)}</div><p><button class="btn" id="next">${quiz.i + 1 === quiz.list.length ? 'Résultats' : 'Suivant'}</button></p>`;
    document.getElementById('next').onclick = () => { quiz.i++; viewQuiz(); };
  };
  const btns = [...document.querySelectorAll('.opt')];
  if (q.type === 'ordering') {
    btns.forEach(b => b.onclick = () => {
      if (b.classList.contains('picked')) return;
      q._pick.push(b.dataset.t); b.classList.add('picked'); b.textContent = q._pick.length + '. ' + b.dataset.t;
      if (q._pick.length === q.items.length) {
        btns.forEach(x => x.disabled = true);
        finish(q._pick.join('|') === q.items.join('|'));
      }
    });
  } else {
    btns.forEach(b => b.onclick = () => {
      const val = q.type === 'tf' ? b.dataset.i === '1' : +b.dataset.i;
      const right = q.type === 'tf' ? q.a === val : q.a === val;
      btns.forEach(x => {
        x.disabled = true;
        const xv = q.type === 'tf' ? x.dataset.i === '1' : +x.dataset.i;
        if (xv === q.a) x.classList.add('good');
      });
      if (!right) b.classList.add('bad');
      finish(right);
    });
  }
}
function quizResult() {
  const pct = Math.round(quiz.score / quiz.list.length * 100);
  const scores = store.get('scores', {});
  Object.entries(quiz.byCh).forEach(([c, v]) => { const p = Math.round(v.ok / v.n * 100); if ((scores[c] || 0) < p) scores[c] = p; });
  store.set('scores', scores);
  $app.innerHTML = `<h1>Résultat</h1><div class="q"><div class="eq">${quiz.score}/${quiz.list.length} · ${pct} %</div>
    <table>${Object.entries(quiz.byCh).map(([c, v]) => `<tr><td>${c}. ${CHAPTERS[c - 1].title}</td><td>${v.ok}/${v.n}</td></tr>`).join('')}</table>
    <p class="row" style="margin-top:1rem"><button class="btn" id="again">Rejouer</button><a class="btn ghost" style="text-decoration:none" href="#/learn/1">Revoir le cours</a></p></div>`;
  document.getElementById('again').onclick = () => { quiz = null; viewQuiz(); };
}

/* ---------- LÉGENDES ---------- */
function viewLegends() {
  $app.innerHTML = `<h1>Légendes du poker</h1><p>Des coups et des parcours qui ont marqué l'histoire, avec ce qu'on peut en retenir.</p>
    ${LEGENDS.map(l => `<div class="legend"><h3>${l.n}</h3><p class="meta">${l.y} · ${l.who}</p><p>${l.s}</p><div class="key"><b>Leçon :</b> ${l.l}</div></div>`).join('')}`;
}

/* ---------- SIMULATEUR ---------- */
const sim = { hero: [], board: [], opps: 1, result: null };
function viewSim() {
  const used = new Set([...sim.hero, ...sim.board].map(cardKey));
  const slot = (t, cls = '') => t ? cardHTML(cardKey(t), cls) : `<span class="card empty ${cls}"></span>`;
  const picker = SUITS.map(s => RANKS.split('').reverse().map(r => {
    const k = r + s, red = s === 'h' || s === 'd';
    return `<button data-k="${k}" class="${red ? 'r' : ''} ${used.has(k) ? 'used' : ''}">${r === 'T' ? '10' : r}${SUIT_SYM[s]}</button>`;
  }).join('')).join('');
  const heroFull = sim.hero.length === 2;
  let handName = '';
  if (heroFull && sim.board.length >= 3) handName = HAND_NAMES[best(sim.hero.concat(sim.board))[0]];
  $app.innerHTML = `<h1>Simulateur d'équité</h1>
    <p>Choisissez vos 2 cartes (et le board si vous voulez), puis lancez la simulation contre des adversaires aux mains aléatoires. L'équité est votre pourcentage de victoire (les égalités comptent pour moitié).</p>
    <div class="table">
      <div><label>Vos cartes</label><br><span class="cards">${slot(sim.hero[0])}${slot(sim.hero[1])}</span></div><br>
      <div><label>Board</label><br><span class="cards">${[0, 1, 2, 3, 4].map(i => slot(sim.board[i])).join('')}</span></div>
      ${handName ? `<p><span class="pill">Votre main : ${handName}</span></p>` : ''}
    </div>
    <p class="row" style="margin-top:1rem"><button class="btn ghost" id="rand">Main au hasard</button><button class="btn ghost" id="clear">Effacer</button>
      <label>Adversaires <input id="opps" type="number" min="1" max="9" value="${sim.opps}" style="width:4.5rem"></label>
      <button class="btn" id="run" ${heroFull ? '' : 'disabled'}>Simuler</button></p>
    <div id="res">${sim.result ? resultHTML() : ''}</div>
    <p><label>Touchez une carte : les 2 premières sont à vous, les suivantes vont sur le board (max 5).</label></p>
    <div class="picker">${picker}</div>`;
  document.querySelectorAll('.picker button').forEach(b => b.onclick = () => {
    if (b.classList.contains('used')) return;
    const c = parseCard(b.dataset.k);
    if (sim.hero.length < 2) sim.hero.push(c); else if (sim.board.length < 5) sim.board.push(c); else return;
    sim.result = null; viewSim();
  });
  document.getElementById('clear').onclick = () => { sim.hero = []; sim.board = []; sim.result = null; viewSim(); };
  document.getElementById('rand').onclick = () => { const d = shuffle(fullDeck()); sim.hero = d.slice(0, 2); sim.board = []; sim.result = null; viewSim(); };
  document.getElementById('opps').onchange = e => { sim.opps = Math.max(1, Math.min(9, +e.target.value || 1)); sim.result = null; viewSim(); };
  document.getElementById('run').onclick = () => {
    document.getElementById('res').innerHTML = '<p>Calcul…</p>';
    setTimeout(() => { sim.result = equity(sim.hero, sim.board, sim.opps); document.getElementById('res').innerHTML = resultHTML(); }, 20);
  };
}
function resultHTML() {
  const r = sim.result, fair = 1 / (sim.opps + 1);
  const verdict = r.equity > fair ? `au-dessus de la part « équitable » (${(fair * 100).toFixed(0)} % à ${sim.opps + 1} joueurs)` : `en dessous de la part équitable (${(fair * 100).toFixed(0)} % à ${sim.opps + 1} joueurs)`;
  return `<div class="q"><div class="eq">${(r.equity * 100).toFixed(1)} %</div>
    <p>Victoire ${(r.win * 100).toFixed(1)} % · Égalité ${(r.tie * 100).toFixed(1)} %<br>Équité ${verdict}.</p>
    <p class="meta">Pour payer une mise, comparez cette équité à Call ÷ (Pot + Call) (chapitre 4).</p></div>`;
}

/* ---------- ROUTEUR ---------- */
function route() {
  const [, r, p] = (location.hash || '#/learn/1').split('/');
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.r === r));
  if (r !== 'quiz') quiz = null;
  window.scrollTo(0, 0);
  if (r === 'quiz') viewQuiz(p);
  else if (r === 'legends') viewLegends();
  else if (r === 'sim') viewSim();
  else viewLearn(p);
}
addEventListener('hashchange', route);
route();
