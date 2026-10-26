// Ranges preflop (approximation par score de Chen, calibrée sur des ranges 6-max classiques).
const GRID = RANKS.split('').reverse(); // A K Q ... 2

function sampleCards(label) {
  const hi = RANKS.indexOf(label[0]), lo = RANKS.indexOf(label[1]);
  if (hi === lo) return [{ r: hi, s: 's' }, { r: lo, s: 'h' }];
  return label[2] === 's' ? [{ r: hi, s: 's' }, { r: lo, s: 's' }] : [{ r: hi, s: 's' }, { r: lo, s: 'h' }];
}
const labelScore = label => { const [a, b] = sampleCards(label); return chen(a, b); };
const comboCount = l => l.length === 2 ? 6 : l[2] === 's' ? 4 : 12;

// Action recommandée. spot : 'open' | 'vsOpen' | 'vs3bet'
function rangeAction(spot, pos, label) {
  const sc = labelScore(label), pair = label[0] === label[1];
  if (spot === 'open') {
    const ok = pair ? RANKS.indexOf(label[0]) >= PAIR_OPEN[pos] : sc >= OPEN_MIN[pos];
    return ok ? 'raise' : 'fold';
  }
  if (spot === 'vsOpen') {
    if (sc >= 10) return 'raise';              // 3-bet
    if (sc >= 8 || (pair && sc >= 5)) return 'call';
    return 'fold';
  }
  if (sc >= 12) return 'raise';               // 4-bet
  if (sc >= 10) return 'call';
  return 'fold';
}

function rangeGrid(spot, pos) {
  return GRID.map((r1, i) => GRID.map((r2, j) => {
    const label = i === j ? r1 + r2 : i < j ? r1 + r2 + 's' : r2 + r1 + 'o';
    return { label, action: rangeAction(spot, pos, label) };
  }));
}
function rangePct(spot, pos) {
  let n = 0;
  rangeGrid(spot, pos).flat().forEach(c => { if (c.action !== 'fold') n += comboCount(c.label); });
  return n / 1326 * 100;
}

const SPOT_NAMES = { open: 'Ouvrir le pot (personne n\'a relancé)', vsOpen: 'Face à une ouverture', vs3bet: 'Face à une 3-bet (après avoir ouvert)' };
const ACTION_NAMES = { raise: 'Relancer', call: 'Suivre', fold: 'Se coucher' };

function explainRange(spot, pos, label, action) {
  const sc = labelScore(label);
  const base = `${label} vaut ${sc} au score de Chen (échelle : AA = 20, 72o = −1).`;
  if (spot === 'open') {
    const need = PAIR_OPEN[pos] !== undefined && label[0] === label[1] ? '' : ` Seuil d'ouverture en ${pos} : ${OPEN_MIN[pos]}.`;
    if (action === 'raise') return `${base}${need} Assez fort pour ouvrir depuis ${pos}, à 2,5-3 BB. Limper n'est jamais le bon choix.`;
    return `${base}${need} Trop faible pour ouvrir depuis ${pos} : plus on est tôt, plus il reste de joueurs derrière qui peuvent avoir mieux.`;
  }
  if (spot === 'vsOpen') {
    if (action === 'raise') return `${base} Main premium : on 3-bet pour la valeur et pour isoler l'ouvreur.`;
    if (action === 'call') return `${base} Assez bonne pour voir un flop, pas assez pour 3-bet. Les paires se jouent pour toucher un brelan (set mining).`;
    return `${base} Contre une relance, la barre monte. Cette main domine rarement et se retrouve vite hors position.`;
  }
  if (action === 'raise') return `${base} Contre une 3-bet, seules les meilleures mains 4-bettent.`;
  if (action === 'call') return `${base} Assez forte pour payer, trop moyenne pour relancer.`;
  return `${base} Après une 3-bet, l'adversaire représente une main forte : on abandonne.`;
}

// Conseil preflop pour le mode jeu : raises = nombre de relances avant vous (0, 1, 2+)
function preflopAdvice(pos, cards, raises) {
  const label = handLabel(cards[0], cards[1]);
  if (pos === 'BB' && raises === 0) return { label, action: 'check', text: 'Option gratuite : vous checkez, ou relancez avec une main premium.' };
  const spot = raises === 0 ? 'open' : raises === 1 ? 'vsOpen' : 'vs3bet';
  const action = rangeAction(spot, pos === 'BB' ? 'CO' : pos, label);
  return { label, action, text: explainRange(spot, pos, label, action) };
}
