/* ---------- SITUATIONS : DU PLUS COURANT AU PLUS RARE ---------- */
const TIERS = ['Courant', 'Assez fréquent', 'Rare', 'Très rare', 'Légendaire'];
const SITUATIONS = [
{ tier: 0, t: 'La course : paire contre deux overcards', hero: '7h 7d', vil: 'As Kd', board: '', freq: 'Une paire de poche est servie 1 main sur 17 (5,9 %).',
  lesson: 'C\'est le « coin flip » le plus connu. La paire est légèrement favorite, mais très loin d\'un gain assuré. Conséquence pratique : avec peu de jetons, accepter cette course est souvent correct ; avec beaucoup, on évite de mettre sa soirée en jeu pour 55 %.' },
{ tier: 0, t: 'Domination : AK contre AQ', hero: 'As Kd', vil: 'Ah Qc', board: '', freq: 'AK (toutes versions) est servi 1 main sur 83 ; AQ aussi. Les mains dominées par un As sont l\'une des fuites les plus coûteuses.',
  lesson: 'Les deux joueurs partagent l\'As : AK gagne presque tout le temps, et AQ ne s\'en sort guère qu\'en touchant une Dame sans qu\'un Roi tombe. Les mains « presque bonnes » (A9, KJ, QT…) perdent le plus de jetons : elles ne gagnent que petit mais perdent gros.' },
{ tier: 0, t: 'Même paire, meilleur kicker', hero: 'As Kd', vil: 'Ah Tc', board: 'Ad 7c 2h', freq: 'Arrive tout le temps avec les As : la situation la plus classique de « top paire ».',
  lesson: 'Les deux ont une paire d\'As, le kicker décide. Hero est très favori, et l\'autre joueur, qui paie en croyant être devant, n\'a au mieux que 3 outs.' },
{ tier: 1, t: 'Tirage couleur contre top paire', hero: 'Qh Jh', vil: 'Ac 9d', board: '9h 5h 2c', freq: 'Toucher exactement 2 cartes de votre couleur au flop avec une main assortie : 1 fois sur 9 (10,9 %).',
  lesson: 'Un tirage couleur avec des overcards est presque un coin flip contre une paire : c\'est ce qui rend le semi-bluff si puissant. Vous gagnez de deux façons : l\'adversaire se couche, ou vous touchez.' },
{ tier: 1, t: 'Tirage quinte ouvert contre sur-paire', hero: '8s 7d', vil: 'Qs Qd', board: '9d 6c 2h', freq: 'Un tirage ouvert fait 8 outs. On y touche environ 1 flop sur 8 avec une main connectée.',
  lesson: 'Même contre une grosse paire, un tirage ouvert à deux cartes à venir n\'est pas loin de 1 chance sur 3. Combiné avec les enchères futures (cotes implicites), il justifie souvent de payer.' },
{ tier: 2, t: 'Brelan contre sur-paire', hero: '7h 7d', vil: 'As Ad', board: '7c Ks 2d', freq: 'Toucher un brelan avec une paire de poche au flop : 1 fois sur 8,5 (11,8 %).',
  lesson: 'C\'est tout l\'intérêt du « set mining » : payer cher avec une petite paire pour toucher un brelan 1 fois sur 8 et prendre le tapis adverse. Il faut donc des adversaires qui paient gros derrière (cotes implicites).' },
{ tier: 2, t: 'La deuxième meilleure couleur', hero: 'Kh Qh', vil: 'Ah Th', board: '2h 7h Jh 4c', freq: 'Toucher une couleur avec une main assortie : 1 fois sur 119 au flop (0,84 %).',
  lesson: 'Le coup qui ruine le plus de joueurs : une couleur à Roi perd contre la couleur à As, et l\'on ne le voit pas venir. Dès que le board offre une couleur, la hauteur de votre carte compte autant que la couleur.' },
{ tier: 2, t: 'Brelan contre brelan', hero: '5h 5d', vil: '9h 9d', board: '9c 5s 2d', freq: 'Deux brelans au même flop : de l\'ordre de 1 fois sur plusieurs milliers pour deux joueurs donnés.',
  lesson: 'Le « set over set » est le cooler type : on ne peut rien faire de mieux que payer avec la meilleure main possible… et perdre. Un bon joueur sait que c\'est le prix du jeu, pas une erreur.' },
{ tier: 3, t: 'AA contre KK avant le flop', hero: 'As Ah', vil: 'Ks Kh', board: '', freq: 'Deux joueurs donnés reçoivent AA et KK à la même main : environ 1 fois sur 22 500.',
  lesson: 'La meilleure main de départ gagne ici plus de 4 fois sur 5. Quand elle perd, c\'est un bad beat, pas une mauvaise décision : l\'équité était excellente. C\'est le principe « process over results » du chapitre 6.' },
{ tier: 3, t: 'Drawing dead : plus aucune carte pour vous', hero: 'As Qs', vil: 'Kc 7s', board: 'Ks Kd 7c 7d', freq: 'Un full contre deux paires sur un board pairé : rare, mais ça arrive à tous les niveaux.',
  lesson: 'Quand l\'équité est de 0 %, aucune mise adverse ne justifie un call. Savoir reconnaître « je ne peux plus gagner », c\'est économiser ses jetons sur les boards pairés.' },
{ tier: 3, t: 'Quand le board joue : pot partagé', hero: '2d 3d', vil: '4c 5c', board: 'As Ks Qs Js Ts', freq: 'Une quinte flush royale sur le board : 1 chance sur 30 940 par main de 7 cartes.',
  lesson: 'Quand le board offre la meilleure main possible, tous ceux qui sont encore là se partagent le pot. Ça arrive aussi avec des « board plays » moins extrêmes (une quinte au milieu, par exemple).' },
{ tier: 4, t: 'Le jackpot : quinte flush contre carré', hero: '9s 8s', vil: '5h 5c', board: '7s 6s 5s 5d', freq: 'Une quinte flush (royale incluse) : 1 chance sur 3 217 de 7 cartes. Les casinos paient des « bad beat jackpots » pour un carré battu.',
  lesson: 'Les deux joueurs ont une main de rêve, et seul un des deux la gagne. Ces mains sont la raison pour laquelle on ne parle jamais de « main imbattable » tant qu\'on n\'a pas vu les cartes adverses.' },
{ tier: 4, t: 'Royale contre quinte flush', hero: 'Ah Kh', vil: '9h 8h', board: 'Qh Jh Th 2c', freq: 'Une quinte flush royale : 1 chance sur 30 940 de 7 cartes, soit 0,0032 %.',
  lesson: 'La main absolue, battue seulement par elle-même. Si vous la tenez, la question n\'est plus « gagner » mais « comment se faire payer » : jouer lentement pour extraire le maximum.' }
];

const sitState = { open: -1, res: {} };
function viewSituations() {
  $app.innerHTML = `<h1>Situations, du plus courant au plus rare</h1>
    <p>Treize situations classées par fréquence. Pour chacune, lancez la simulation (6 000 tirages) pour voir l'équité réelle, puis lisez la leçon. Les fréquences indiquées sont des probabilités calculées par combinatoire, ou à défaut des ordres de grandeur.</p>
    ${TIERS.map((tn, ti) => `<h2>${ti + 1}. ${tn}</h2>${SITUATIONS.map((s, i) => s.tier === ti ? sitHTML(s, i) : '').join('')}`).join('')}`;
  document.querySelectorAll('.simbtn').forEach(b => b.onclick = () => {
    const i = +b.dataset.i, s = SITUATIONS[i];
    b.disabled = true; b.textContent = 'Calcul…';
    setTimeout(() => { sitState.res[i] = equityVs(s.hero.split(' ').map(parseCard), s.vil.split(' ').map(parseCard), s.board ? s.board.split(' ').map(parseCard) : [], 6000); viewSituations(); window.scrollTo(0, document.getElementById('s' + i).offsetTop - 70); }, 20);
  });
}
function sitHTML(s, i) {
  const cs = str => str ? `<span class="cards">${str.split(' ').map(t => cardHTML(t, 'sm')).join('')}</span>` : '<span class="meta">aucun (préflop)</span>';
  const r = sitState.res[i];
  return `<div class="legend" id="s${i}"><h3>${s.t}</h3>
    <div class="row sitcards"><div><label>Vous</label><br>${cs(s.hero)}</div><div><label>Adversaire</label><br>${cs(s.vil)}</div><div><label>Board</label><br>${cs(s.board)}</div></div>
    <p class="meta">${s.freq}</p>
    ${r ? `<div class="eqbar"><div class="w" style="width:${r.win * 100}%">${(r.win * 100).toFixed(0)} %</div><div class="t" style="width:${r.tie * 100}%"></div><div class="l" style="width:${r.lose * 100}%">${(r.lose * 100).toFixed(0)} %</div></div>
    <p class="meta">Vous gagnez ${(r.win * 100).toFixed(1)} % · égalité ${(r.tie * 100).toFixed(1)} % · vous perdez ${(r.lose * 100).toFixed(1)} %</p><div class="key"><b>Leçon :</b> ${s.lesson}</div>` : `<button class="btn ghost simbtn" data-i="${i}">Simuler l'équité</button>`}</div>`;
}

/* ---------- PROBABILITÉS RÉELLES ---------- */
const THEORY7 = [['Quinte flush (royale incluse)', 0.0311], ['Carré', 0.168], ['Full', 2.60], ['Couleur', 3.03], ['Quinte', 4.62], ['Brelan', 4.83], ['Double paire', 23.50], ['Paire', 43.82], ['Carte haute', 17.41]];
const HAND_IDX = [8, 7, 6, 5, 4, 3, 2, 1, 0];
const probs = { n: 0, counts: new Array(9).fill(0), running: false };
function viewProbas() {
  const tot = Math.max(1, probs.n);
  $app.innerHTML = `<h1>Probabilités réelles</h1>
    <p>Avec 7 cartes (vos 2 + 5 du board), quelle main finissez-vous par avoir ? Lancez la simulation : l'application distribue des milliers de mains au hasard et compte. Les valeurs mesurées convergent vers la théorie.</p>
    <p class="row"><button class="btn" id="go">${probs.running ? 'Arrêter' : probs.n ? 'Continuer' : 'Lancer la simulation'}</button><button class="btn ghost" id="rst">Remettre à zéro</button><span class="pill">${probs.n.toLocaleString('fr-FR')} mains</span></p>
    <table><tr><th>Main finale (7 cartes)</th><th>Mesuré</th><th>Théorie</th><th>1 fois sur</th></tr>
    ${THEORY7.map(([name, th], i) => { const m = probs.counts[HAND_IDX[i]] / tot * 100; return `<tr><td>${name}</td><td>${probs.n ? m.toFixed(m < 1 ? 3 : 2) + ' %' : '·'}</td><td>${th} %</td><td>${Math.round(100 / th).toLocaleString('fr-FR')}</td></tr>`; }).join('')}</table>
    <h2>Les chiffres du départ</h2>
    <table><tr><th>Événement</th><th>Probabilité</th></tr>
    <tr><td>Recevoir une paire de poche</td><td>5,88 % (1 sur 17)</td></tr>
    <tr><td>Recevoir AA (ou n'importe quelle paire précise)</td><td>0,45 % (1 sur 221)</td></tr>
    <tr><td>Recevoir AK, assorti ou non</td><td>1,21 % (1 sur 83)</td></tr>
    <tr><td>Recevoir deux cartes assorties</td><td>23,5 % (environ 1 sur 4)</td></tr>
    <tr><td>Toucher un brelan au flop avec une paire de poche</td><td>11,8 % (1 sur 8,5)</td></tr>
    <tr><td>Toucher au moins une paire au flop avec deux cartes non paires</td><td>32,4 % (1 sur 3)</td></tr>
    <tr><td>Flop avec exactement 2 cartes de votre couleur (tirage couleur)</td><td>10,9 % (1 sur 9)</td></tr>
    <tr><td>Toucher la couleur directement au flop avec une main assortie</td><td>0,84 % (1 sur 119)</td></tr></table>
    <div class="key"><b>À retenir :</b> les mains monstres sont très rares. La plupart du temps, vous finissez avec une paire ou rien : c'est pour cela qu'on se couche beaucoup préflop et qu'un bluff bien placé rapporte.</div>`;
  document.getElementById('rst').onclick = () => { probs.n = 0; probs.counts.fill(0); probs.running = false; viewProbas(); };
  document.getElementById('go').onclick = () => { probs.running = !probs.running; if (probs.running) probLoop(); viewProbas(); };
}
function probLoop() {
  if (!probs.running || !document.getElementById('go')) { probs.running = false; return; }
  const t0 = performance.now();
  while (performance.now() - t0 < 40) {
    const hand = shuffle(fullDeck()).slice(0, 7);
    probs.counts[best(hand)[0]]++; probs.n++;
  }
  // mise à jour légère du tableau sans reconstruire les boutons
  const rows = document.querySelectorAll('table')[0].querySelectorAll('tr');
  THEORY7.forEach((_, i) => { const m = probs.counts[HAND_IDX[i]] / probs.n * 100; rows[i + 1].children[1].textContent = m.toFixed(m < 1 ? 3 : 2) + ' %'; });
  document.querySelector('.pill').textContent = probs.n.toLocaleString('fr-FR') + ' mains';
  requestAnimationFrame(probLoop);
}
