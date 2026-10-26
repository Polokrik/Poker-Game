// Intelligence des bots : trois niveaux. Preflop par score de Chen + position, postflop par équité.
const OPEN_MIN = { UTG: 8, MP: 7, CO: 6, BTN: 5, SB: 6, BB: 99 };
const PAIR_OPEN = { UTG: 4, MP: 3, CO: 0, BTN: 0, SB: 0, BB: 99 }; // rang minimal de paire (0 = 22)

const LEVELS = {
  beginner:     { name: 'Débutant',      loose: -2.5, agg: 0.25, callMargin: -0.10, bluff: 0.02, sims: 250, opp: 0.00 },
  intermediate: { name: 'Intermédiaire', loose: 0.5,    agg: 0.6,  callMargin: 0.02,  bluff: 0.06, sims: 450, opp: 0.04 },
  advanced:     { name: 'Avancé',        loose: 1.5,  agg: 0.85, callMargin: 0.01,  bluff: 0.14, sims: 700, opp: 0.07 }
};

function botDecide(g, p) {
  const lv = LEVELS[g.level], L = legal(g, p), r = Math.random;
  const potNow = pot(g);
  const clampRaise = to => ['raise', Math.max(L.minTo, Math.min(Math.round(to), L.maxTo))];
  const callOrCheck = () => [L.canCheck ? 'check' : 'call'];
  const pos = posOf(g, p);

  if (g.street === 'preflop') {
    const [a, b] = p.cards, sc = chen(a, b), pair = a.r === b.r;
    const raises = countRaises(g);
    if (raises === 0) {
      // personne n'a relancé : ouvrir ou limper (selon niveau) ou check la BB
      let min = OPEN_MIN[pos] - lv.loose;
      const openable = pair ? a.r >= PAIR_OPEN[pos] - (lv.loose < 0 ? 2 : 0) : sc >= min;
      if (pos === 'BB' && L.canCheck) return r() < lv.agg * 0.3 && sc >= 9 ? clampRaise(g.bb * 3) : ['check'];
      if (openable) {
        if (g.level === 'beginner' && r() > lv.agg) return callOrCheck(); // limp
        const mult = 2.5 + (g.currentBet > g.bb ? 1 : 0) + r() * 0.6;
        return clampRaise(g.bb * mult + (g.currentBet - g.bb));
      }
      if (L.canCheck) return ['check'];
      // limp rare des bots débutants avec une main moyenne
      if (g.level === 'beginner' && sc >= 3 && L.toCall <= g.bb && r() < 0.5) return ['call'];
      return ['fold'];
    }
    const facing = L.toCall / g.bb;
    if (raises === 1) {
      if (sc >= 10 - lv.loose / 2 && r() < lv.agg + 0.2) return clampRaise(g.currentBet * 3);
      if (sc >= 8 + (facing > 6 ? 2 : 0) - lv.loose || (pair && facing <= 5)) return ['call'];
      if (g.level === 'advanced' && sc >= 6 && sc <= 9 && a.s === b.s && r() < lv.bluff) return clampRaise(g.currentBet * 3);
      return ['fold'];
    }
    // 3-bet ou plus : on ne continue qu'avec des mains fortes
    if (sc >= 12 && r() < lv.agg + 0.1) return clampRaise(g.currentBet * 2.3);
    if (sc >= 10 - lv.loose / 2) return ['call'];
    return ['fold'];
  }

  // Postflop : décision fondée sur l'équité contre des mains aléatoires
  const opps = Math.max(1, live(g).length - 1);
  let eq = equity(p.cards, g.board, opps, lv.sims).equity;
  const board = g.board, facing = L.toCall > 0;
  if (!facing) {
    const wet = boardWetness(board);
    const size = potNow * (wet > 1 ? 0.66 + r() * 0.3 : 0.33 + r() * 0.25);
    if (eq > 0.68) return r() < lv.agg + 0.1 ? clampRaise(size) : ['check'];
    if (eq > 0.5) return r() < lv.agg * 0.7 ? clampRaise(size * 0.8) : ['check'];
    if (eq > 0.28 && g.street !== 'river' && r() < lv.bluff * 2) return clampRaise(size);
    if (r() < lv.bluff * 0.5 && opps === 1) return clampRaise(size);
    return ['check'];
  }
  const need = L.toCall / (potNow + L.toCall);
  eq -= lv.opp * (1 + (L.toCall / Math.max(1, potNow)));
  if (eq > 0.8 && L.canRaise && r() < lv.agg) return clampRaise(g.currentBet + potNow * (0.7 + r() * 0.5));
  if (eq > need + lv.callMargin) return ['call'];
  if (g.level === 'advanced' && L.canRaise && eq > 0.2 && eq < 0.35 && r() < lv.bluff * 0.4) return clampRaise(g.currentBet * 2.7);
  return ['fold'];
}

function countRaises(g) {
  // approximation : combien de relances au-dessus de la BB (via le montant à suivre)
  const c = g.currentBet / g.bb;
  return c <= 1 ? 0 : c <= 5 ? 1 : 2;
}

// 0 = sec, 1 = moyen, 2 = humide
function boardWetness(board) {
  if (board.length < 3) return 0;
  const suits = {}; board.forEach(c => suits[c.s] = (suits[c.s] || 0) + 1);
  const ranks = board.map(c => c.r).sort((a, b) => a - b);
  let w = 0;
  if (Math.max(...Object.values(suits)) >= 3) w += 1.5; else if (Math.max(...Object.values(suits)) === 2) w += 0.5;
  for (let i = 1; i < ranks.length; i++) if (ranks[i] - ranks[i - 1] <= 2) w += 0.5;
  return w;
}
