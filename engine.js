// Moteur de poker : évaluation de mains et simulation d'équité (Monte-Carlo).
const RANKS = '23456789TJQKA';
const SUITS = ['s', 'h', 'd', 'c'];
const SUIT_SYM = { s: '♠', h: '♥', d: '♦', c: '♣' };
const HAND_NAMES = ['Carte haute', 'Paire', 'Double paire', 'Brelan', 'Quinte', 'Couleur', 'Full', 'Carré', 'Quinte flush'];

const fullDeck = () => {
  const d = [];
  for (const s of SUITS) for (let r = 0; r < 13; r++) d.push({ r, s });
  return d;
};
const cardKey = c => RANKS[c.r] + c.s;
const parseCard = t => ({ r: RANKS.indexOf(t[0]), s: t[1] });

// Évalue 5 cartes -> tableau comparable [catégorie, ...départages]
function eval5(cs) {
  const ranks = cs.map(c => c.r).sort((a, b) => b - a);
  const flush = cs.every(c => c.s === cs[0].s);
  const counts = {};
  ranks.forEach(r => (counts[r] = (counts[r] || 0) + 1));
  const groups = Object.entries(counts).map(([r, n]) => [n, +r]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  let straightHigh = -1;
  const uniq = [...new Set(ranks)];
  if (uniq.length === 5) {
    if (uniq[0] - uniq[4] === 4) straightHigh = uniq[0];
    else if (uniq.join() === '12,3,2,1,0') straightHigh = 3; // A-2-3-4-5
  }
  if (straightHigh >= 0 && flush) return [8, straightHigh];
  if (groups[0][0] === 4) return [7, groups[0][1], groups[1][1]];
  if (groups[0][0] === 3 && groups[1][0] === 2) return [6, groups[0][1], groups[1][1]];
  if (flush) return [5, ...ranks];
  if (straightHigh >= 0) return [4, straightHigh];
  if (groups[0][0] === 3) return [3, groups[0][1], ...groups.slice(1).map(g => g[1])];
  if (groups[0][0] === 2 && groups[1][0] === 2) return [2, groups[0][1], groups[1][1], groups[2][1]];
  if (groups[0][0] === 2) return [1, groups[0][1], ...groups.slice(1).map(g => g[1])];
  return [0, ...ranks];
}

const cmp = (a, b) => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
};

// Meilleure main de 5 parmi 5 à 7 cartes
function best(cards) {
  let top = null;
  const n = cards.length;
  const pick = [];
  (function rec(start) {
    if (pick.length === 5) {
      const v = eval5(pick);
      if (!top || cmp(v, top) > 0) top = v;
      return;
    }
    for (let i = start; i < n; i++) { pick.push(cards[i]); rec(i + 1); pick.pop(); }
  })(0);
  return top;
}

// Équité de `hero` (2 cartes) contre `opps` adversaires aléatoires, avec `board` (0-5 cartes)
function equity(hero, board, opps, iters = 6000) {
  const used = new Set([...hero, ...board].map(cardKey));
  const pool = fullDeck().filter(c => !used.has(cardKey(c)));
  let win = 0, tie = 0;
  for (let i = 0; i < iters; i++) {
    // Fisher-Yates partiel
    const need = 5 - board.length + opps * 2;
    for (let k = 0; k < need; k++) {
      const j = k + Math.floor(Math.random() * (pool.length - k));
      [pool[k], pool[j]] = [pool[j], pool[k]];
    }
    const full = board.concat(pool.slice(0, 5 - board.length));
    const hv = best(hero.concat(full));
    let off = 5 - board.length, state = 1; // 1 = win, 0.5 = tie, 0 = lose
    for (let o = 0; o < opps && state > 0; o++) {
      const ov = best([pool[off + o * 2], pool[off + o * 2 + 1]].concat(full));
      const c = cmp(hv, ov);
      if (c < 0) state = 0; else if (c === 0) state = 0.5;
    }
    if (state === 1) win++; else if (state === 0.5) tie++;
  }
  return { win: win / iters, tie: tie / iters, equity: (win + tie / 2) / iters };
}

const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Équité de `hero` contre une main adverse connue
function equityVs(hero, villain, board, iters = 4000) {
  const used = new Set([...hero, ...villain, ...board].map(cardKey));
  const pool = fullDeck().filter(c => !used.has(cardKey(c)));
  const need = 5 - board.length;
  let win = 0, tie = 0;
  for (let i = 0; i < iters; i++) {
    for (let k = 0; k < need; k++) { const j = k + Math.floor(Math.random() * (pool.length - k)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
    const full = board.concat(pool.slice(0, need));
    const c = cmp(best(hero.concat(full)), best(villain.concat(full)));
    if (c > 0) win++; else if (c === 0) tie++;
  }
  return { win: win / iters, tie: tie / iters, lose: 1 - (win + tie) / iters, equity: (win + tie / 2) / iters };
}

// Libellé de main de départ : "AKs", "QQ", "T9o"
function handLabel(a, b) {
  const hi = a.r >= b.r ? a : b, lo = hi === a ? b : a;
  if (hi.r === lo.r) return RANKS[hi.r] + RANKS[lo.r];
  return RANKS[hi.r] + RANKS[lo.r] + (hi.s === lo.s ? 's' : 'o');
}

// Score de Chen : approximation classique de la force d'une main de départ
function chen(a, b) {
  const pts = r => r === 12 ? 10 : r === 11 ? 8 : r === 10 ? 7 : r === 9 ? 6 : (r + 2) / 2;
  const hi = a.r >= b.r ? a : b, lo = hi === a ? b : a;
  let s = pts(hi.r);
  if (hi.r === lo.r) return Math.max(5, Math.ceil(s * 2));
  if (hi.s === lo.s) s += 2;
  const gap = hi.r - lo.r - 1;
  s -= gap === 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 2 : gap === 3 ? 4 : 5;
  if (gap <= 1 && hi.r < 10) s += 1;
  return Math.ceil(s);
}
