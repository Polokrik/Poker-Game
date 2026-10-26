const assert = require('assert');
const load = require('./load');
process.env.EXPORTS = 'RANKS,HAND_NAMES,best,cmp,equity,equityVs,parseCard,chen,handLabel,newGame,startHand,act,legal,botDecide,pot,sidePots,analyze,fullDeck,cardKey,live';
const E = load(['engine.js', 'game.js', 'bots.js']);
const h = s => s.split(' ').map(E.parseCard);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };

t('classement des mains', () => {
  const cat = s => E.best(h(s))[0];
  assert.equal(cat('As Ks Qs Js Ts 2d 3c'), 8);
  assert.equal(cat('9s 9h 9d 9c 2d 3c 4h'), 7);
  assert.equal(cat('9s 9h 9d 2c 2d 3c 4h'), 6);
  assert.equal(cat('As 5s 9s 2s Ks 3c 4h'), 5);
  assert.equal(cat('As 2d 3c 4h 5s Kd 9c'), 4); // roue
  assert.equal(cat('As Ad Kc Qh Js 2d 9c'), 1);
  assert.equal(cat('As Kd 7c 5h 3s 2d 9c'), 0);
});
t('départage par kicker', () => {
  assert(E.cmp(E.best(h('As Kd 2c 2h 5s 7d 9c')), E.best(h('Ah Qd 2c 2d 5s 7d 9c'))) > 0);
  assert.equal(E.cmp(E.best(h('As Ks Qs Js 9s 2d 3c')), E.best(h('Ah Kd Qc Jh 9d 2s 3h'))) > 0, true);
});
t('équité connue', () => {
  const aa = E.equityVs(h('As Ah'), h('Kh Kd'), [], 20000).equity;
  assert(aa > 0.80 && aa < 0.84, aa);
  const flip = E.equityVs(h('Ts Th'), h('Ah Kd'), [], 20000).equity;
  assert(flip > 0.52 && flip < 0.60, flip);
});
t('score de Chen', () => {
  assert.equal(E.chen(...h('As Ah')), 20);
  assert(E.chen(...h('7s 2h')) < 0);
});
t('side pots', () => {
  const P = (total, folded = false) => ({ total, folded });
  const pots = E.sidePots([P(100), P(300), P(300), P(50, true)]);
  assert.deepEqual(pots.map(p => p.amount), [200, 150, 400]);
  assert.deepEqual(pots.map(p => p.eligible.length), [3, 3, 2]);
  assert.equal(pots.reduce((s, p) => s + p.amount, 0), 750);
});
t('simulation bots-vs-bots : conservation des jetons, pas de blocage', () => {
  for (const level of ['beginner', 'intermediate', 'advanced']) {
    const g = E.newGame(level);
    const total = g.players.reduce((s, p) => s + p.stack, 0);
    let rebuys = 0;
    const hands = 50;
    for (let i = 0; i < hands; i++) {
      const before = g.players.reduce((s, p) => s + p.stack, 0);
      E.startHand(g);
      const startTotal = g.players.reduce((s, p) => s + p.stack + p.total, 0);
      let steps = 0;
      while (!g.over) {
        if (++steps > 200) throw new Error('boucle infinie');
        const p = g.players[g.toAct];
        const [type, amt] = E.botDecide(g, p);
        E.act(g, p, type, amt);
      }
      const after = g.players.reduce((s, p) => s + p.stack, 0);
      assert.equal(after, startTotal, 'jetons perdus en main ' + g.hand + ' (' + level + ')');
      assert(g.players.every(p => p.stack >= 0));
    }
  }
});
console.log(`${n} tests passés`);
