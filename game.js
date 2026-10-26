// Moteur de partie Texas Hold'em à 6 joueurs (cash game, rebuy automatique des bots).
// Aucune dépendance au DOM : testable sous Node.
const POS_BY_OFFSET = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'];
const BOT_NAMES = ['Alice', 'Bruno', 'Chloé', 'Dan', 'Eva'];

function newGame(level = 'beginner', stack = 2000, bb = 20) {
  const players = [{ id: 0, name: 'Vous', human: true }].concat(
    BOT_NAMES.map((n, i) => ({ id: i + 1, name: n, human: false })));
  players.forEach(p => { p.stack = stack; p.cards = []; p.bet = 0; p.total = 0; p.folded = false; p.allin = false; p.acted = false; });
  return { level, bb, sb: bb / 2, startStack: stack, players, button: Math.floor(Math.random() * 6), hand: 0, board: [], street: 'idle', over: true, log: [], currentBet: 0, minRaise: bb, toAct: -1, result: null, decisions: [] };
}

const seatAt = (g, i) => g.players[((i % 6) + 6) % 6];
const posOf = (g, p) => POS_BY_OFFSET[(p.id - g.button + 6) % 6];
const pot = g => g.players.reduce((s, p) => s + p.total, 0);
const live = g => g.players.filter(p => !p.folded);
const canAct = g => g.players.filter(p => !p.folded && !p.allin);

function say(g, msg) { g.log.push(msg); }

function post(g, p, amt) {
  amt = Math.min(amt, p.stack);
  p.stack -= amt; p.bet += amt; p.total += amt;
  if (p.stack === 0) p.allin = true;
  return amt;
}

function startHand(g) {
  g.hand++;
  g.players.forEach(p => {
    if (p.stack <= 0) { p.stack = g.startStack; p.rebuys = (p.rebuys || 0) + 1; }
    p.cards = []; p.bet = 0; p.total = 0; p.folded = false; p.allin = false; p.acted = false; p.shown = false;
  });
  g.button = (g.button + 1) % 6;
  g.deck = shuffle(fullDeck());
  g.board = []; g.result = null; g.over = false; g.log = []; g.handDecisions = [];
  g.street = 'preflop';
  const sb = seatAt(g, g.button + 1), bb = seatAt(g, g.button + 2);
  post(g, sb, g.sb); post(g, bb, g.bb);
  say(g, `Main n°${g.hand}. ${sb.name} poste la petite blind (${g.sb}), ${bb.name} la grosse blind (${g.bb}).`);
  for (let r = 0; r < 2; r++) for (let i = 1; i <= 6; i++) seatAt(g, g.button + i).cards.push(g.deck.pop());
  g.currentBet = g.bb; g.minRaise = g.bb;
  g.toAct = seatAt(g, g.button + 3).id;
  if (g.players[g.toAct].allin) nextActor(g, g.toAct);
  return g;
}

function legal(g, p) {
  const toCall = Math.min(g.currentBet - p.bet, p.stack);
  const others = canAct(g).filter(o => o !== p).length;
  const canRaise = p.stack > g.currentBet - p.bet && others > 0;
  const maxTo = p.bet + p.stack;
  const minTo = Math.min(g.currentBet + g.minRaise, maxTo);
  return { toCall, canCheck: toCall === 0, canRaise, minTo, maxTo };
}

// type: 'fold' | 'check' | 'call' | 'raise' (amount = montant total de la mise sur ce tour)
function act(g, p, type, amount) {
  if (g.over || g.toAct !== p.id) throw new Error('Pas votre tour');
  const L = legal(g, p);
  if (type === 'check' && !L.canCheck) type = 'call';
  if (type === 'raise' && !L.canRaise) type = L.canCheck ? 'check' : 'call';
  if (type === 'call' && L.toCall === 0) type = 'check';
  if (type === 'fold') { p.folded = true; say(g, `${p.name} se couche.`); }
  else if (type === 'check') say(g, `${p.name} checke.`);
  else if (type === 'call') {
    const paid = post(g, p, L.toCall);
    say(g, `${p.name} suit ${paid}${p.allin ? ' (tapis)' : ''}.`);
  } else if (type === 'raise') {
    let to = Math.max(L.minTo, Math.min(Math.round(amount), L.maxTo));
    const size = to - g.currentBet;
    const verb = g.currentBet === 0 ? 'mise' : 'relance à';
    post(g, p, to - p.bet);
    const full = size >= g.minRaise;
    if (full) g.minRaise = size;
    g.currentBet = Math.max(g.currentBet, p.bet);
    g.players.forEach(o => { if (o !== p && !o.folded && !o.allin && (full || o.bet < g.currentBet)) o.acted = false; });
    say(g, `${p.name} ${verb} ${p.bet}${p.allin ? ' (tapis)' : ''}.`);
  }
  p.acted = true;
  return advance(g, p);
}

function nextActor(g, from) {
  for (let i = 1; i <= 6; i++) {
    const o = seatAt(g, from + i);
    if (!o.folded && !o.allin && (!o.acted || o.bet < g.currentBet)) { g.toAct = o.id; return true; }
  }
  return false;
}

function advance(g, last) {
  if (live(g).length === 1) return finishUncontested(g);
  if (nextActor(g, last.id)) return 'continue';
  // tour d'enchères terminé
  g.players.forEach(p => { p.bet = 0; p.acted = false; });
  g.currentBet = 0; g.minRaise = g.bb;
  while (true) {
    if (g.street === 'river') return showdown(g);
    const next = { preflop: 'flop', flop: 'turn', turn: 'river' }[g.street];
    g.street = next;
    const n = next === 'flop' ? 3 : 1;
    for (let i = 0; i < n; i++) g.board.push(g.deck.pop());
    say(g, `${{ flop: 'Flop', turn: 'Turn', river: 'River' }[next]} : ${g.board.map(c => cardKey(c)).join(' ')}`);
    if (canAct(g).length >= 2) {
      g.toAct = -1;
      const start = g.button;
      for (let i = 1; i <= 6; i++) { const o = seatAt(g, start + i); if (!o.folded && !o.allin) { g.toAct = o.id; break; } }
      return 'continue';
    }
    // tout le monde (sauf éventuellement un joueur) est à tapis : on déroule le board
  }
}

function sidePots(players) {
  const levels = [...new Set(players.filter(p => p.total > 0).map(p => p.total))].sort((a, b) => a - b);
  const pots = []; let prev = 0;
  for (const L of levels) {
    const amount = players.reduce((s, p) => s + Math.max(0, Math.min(p.total, L) - prev), 0);
    const eligible = players.filter(p => !p.folded && p.total >= L);
    if (amount > 0) { if (eligible.length) pots.push({ amount, eligible }); else if (pots.length) pots[pots.length - 1].amount += amount; }
    prev = L;
  }
  return pots;
}

function finishUncontested(g) {
  const w = live(g)[0], amount = pot(g);
  w.stack += amount;
  g.players.forEach(p => { p.bet = 0; });
  g.over = true; g.street = 'done'; g.toAct = -1;
  g.result = { showdown: false, winners: [{ id: w.id, amount, hand: null }], pots: [amount] };
  say(g, `${w.name} remporte ${amount} sans abattage.`);
  return 'over';
}

function showdown(g) {
  const contenders = live(g);
  const vals = {};
  contenders.forEach(p => { vals[p.id] = best(p.cards.concat(g.board)); p.shown = true; });
  const pots = sidePots(g.players);
  const won = {};
  for (const sp of pots) {
    let top = null, ws = [];
    sp.eligible.forEach(p => {
      const c = top ? cmp(vals[p.id], top) : 1;
      if (c > 0) { top = vals[p.id]; ws = [p]; } else if (c === 0) ws.push(p);
    });
    const share = Math.floor(sp.amount / ws.length);
    let rest = sp.amount - share * ws.length;
    ws.sort((a, b) => ((a.id - g.button + 6) % 6) - ((b.id - g.button + 6) % 6));
    ws.forEach(p => { const extra = rest > 0 ? 1 : 0; rest -= extra; won[p.id] = (won[p.id] || 0) + share + extra; });
  }
  g.players.forEach(p => { p.bet = 0; });
  const winners = Object.entries(won).map(([id, amount]) => ({ id: +id, amount, hand: HAND_NAMES[vals[id][0]] }));
  winners.forEach(w => { g.players[w.id].stack += w.amount; say(g, `${g.players[w.id].name} gagne ${w.amount} avec ${w.hand}.`); });
  g.over = true; g.street = 'done'; g.toAct = -1;
  g.result = { showdown: true, winners, pots: pots.map(p => p.amount), hands: Object.fromEntries(contenders.map(p => [p.id, HAND_NAMES[vals[p.id][0]]])) };
  return 'over';
}

// Aide à la décision : équité contre des mains aléatoires, cote du pot, SPR.
function analyze(g, p, iters = 1500) {
  const opps = live(g).length - 1;
  const eq = equity(p.cards, g.board, Math.max(1, opps), iters).equity;
  const L = legal(g, p);
  const potNow = pot(g);
  const need = L.toCall > 0 ? L.toCall / (potNow + L.toCall) : 0;
  const spr = g.board.length ? p.stack / Math.max(1, potNow) : null;
  return { eq, toCall: L.toCall, pot: potNow, need, spr, opps };
}
