// Contenu pédagogique. Les cartes s'écrivent [As] [Kh] [Td]... et sont rendues par app.js
const CHAPTERS = [
{ id: 1, title: 'Les bases', lessons: [
  { t: 'Principe du jeu', h: `<p>Texas Hold'em se joue de 2 à 10 joueurs avec 52 cartes. Chacun reçoit 2 cartes privées et partage 5 cartes communes. Le but : faire la meilleure main de 5 cartes parmi les 7 disponibles.</p>
   <p>Le tour se déroule en 4 phases : <b>preflop</b> (2 cartes privées), <b>flop</b> (3 cartes), <b>turn</b> (1 carte), <b>river</b> (1 carte), puis <b>showdown</b> s'il reste au moins 2 joueurs.</p>` },
  { t: 'Classement des mains', h: `<ol>
   <li>Quinte flush royale <span class="cards"> [Ac][Kc][Qc][Jc][Tc]</span></li>
   <li>Quinte flush <span class="cards">[Jc][Tc][9c][8c][7c]</span></li>
   <li>Carré <span class="cards">[4c][4s][4d][4h]</span></li>
   <li>Full <span class="cards">[3c][3s][3d][7h][7c]</span></li>
   <li>Couleur <span class="cards">[Kd][Jd][7d][5d][3d]</span></li>
   <li>Quinte <span class="cards">[6s][5s][4d][3d][2h]</span></li>
   <li>Brelan</li><li>Double paire</li><li>Paire</li><li>Carte haute</li></ol>
   <div class="key"><b>À retenir :</b> les couleurs n'ont aucune hiérarchie. À main égale, ce sont les kickers (cartes d'accompagnement) qui départagent.</div>` },
  { t: 'Les positions', h: `<p>Agir en dernier = avoir plus d'informations. C'est l'avantage le plus durable au poker.</p>
   <ul><li><b>UTG</b> : premier à parler preflop, position la plus dure.</li><li><b>MP</b> : position intermédiaire.</li><li><b>CO (cutoff)</b> : avant-dernier, bonne position.</li><li><b>BTN (bouton)</b> : parle en dernier après le flop, siège le plus rentable.</li><li><b>SB / BB</b> : blinds forcées. Elles parlent en dernier preflop (la BB) mais en premier après le flop.</li></ul>` },
  { t: 'Les actions', h: `<ul><li><b>Check</b> : passer, seulement si personne n'a misé.</li><li><b>Call</b> : suivre la mise.</li><li><b>Raise</b> : relancer.</li><li><b>Fold</b> : se coucher.</li></ul>` }
]},
{ id: 2, title: 'Stratégie preflop', lessons: [
  { t: 'Discipline de sélection', h: `<p>Une stratégie gagnante se couche plus de 70 % des mains preflop. La patience est la première compétence à acquérir.</p>` },
  { t: 'Ranges d\'ouverture par position', h: `<ul><li><b>UTG</b> : paires 77+, AK, AQ, KTs+. Très serré.</li><li><b>MP</b> : ajoute AJs, KQs, TT+.</li><li><b>CO</b> : ajoute connecteurs assortis (76s+) et plus de broadways.</li><li><b>BTN</b> : le plus large : as assortis, connecteurs dès 43s, K9o, J7s+.</li></ul>
   <div class="key"><b>À retenir :</b> plus on est proche du bouton, plus on peut jouer de mains, parce qu'on aura la position après le flop.</div>` },
  { t: 'Catégories de mains', h: `<ul><li><b>Grosses paires</b> (AA à TT) : on relance toujours. <span class="cards sm">[As][Ah]</span> ne se couche jamais preflop.</li><li><b>Paires moyennes</b> (99-66) : jouables presque partout, on vise le brelan au flop (set mining).</li><li><b>Petites paires</b> (55-22) : surtout en position tardive.</li><li><b>Connecteurs assortis</b> <span class="cards sm">[8h][7h]</span> : potentiel quinte/couleur, meilleurs en position.</li><li><b>Mains poubelles</b> (Q5o, J6o, 72o) : jamais d'ouverture.</li></ul>` },
  { t: 'Jouer les blinds', h: `<p>Les blinds sont hors position après le flop. Contre une ouverture, la SB privilégie la 3-bet ou le fold plutôt que le simple call. La BB défend plus large car elle a déjà investi, mais de façon sélective.</p>` },
  { t: 'Limp, 3-bet, sizing', h: `<ul><li><b>Limper</b> (suivre la BB sans relancer) est presque toujours une erreur : relancez ou couchez-vous.</li><li><b>3-bet</b> : relance après une ouverture, pour la valeur ou en bluff.</li><li><b>Ouverture standard</b> : 2,5 à 3 big blinds.</li></ul>` }
]},
{ id: 3, title: 'Stratégie postflop', lessons: [
  { t: 'Texture du board', h: `<p><b>Board humide</b> (connecté, assorti) : <span class="cards sm">[9h][8h][7c]</span>. Beaucoup de tirages possibles. Misez gros pour faire payer les tirages.</p>
   <p><b>Board sec</b> : <span class="cards sm">[Ks][7d][2c]</span>. Peu de tirages. Une petite mise (⅓ à ½ pot) suffit.</p>` },
  { t: 'Tailles de mise', h: `<ul><li>Misez pour que les tirages ne soient pas rentables pour l'adversaire.</li><li>Board humide : ⅔ pot à pot.</li><li>Board sec : ⅓ à ½ pot.</li><li><b>Overbet</b> (120-130 % du pot) : polarisant, soit les noix, soit un bluff.</li></ul>` },
  { t: 'La c-bet', h: `<p>Mise de continuation : le relanceur preflop mise au flop. Utile quand le board favorise votre range. Ne misez pas systématiquement : choisissez selon la texture et l'adversaire.</p>` },
  { t: 'Value, bluff, semi-bluff', h: `<ul><li><b>Value bet</b> : miser une main forte pour être payé par plus faible.</li><li><b>Bluff</b> : miser une main faible pour faire coucher mieux.</li><li><b>Semi-bluff</b> : miser avec un tirage. Deux façons de gagner : l'adversaire se couche, ou vous touchez.</li></ul>` },
  { t: 'S\'adapter à l\'adversaire', h: `<ul><li><b>Calling station</b> (paie trop) : zéro bluff, grosses value bets.</li><li><b>Nit</b> (trop serré) : volez ses blinds, couchez-vous quand il relance.</li><li><b>Blockers</b> : vos cartes réduisent les mains que l'adversaire peut avoir. Précieux pour choisir ses bluffs.</li></ul>` }
]},
{ id: 4, title: 'Mathématiques', lessons: [
  { t: 'Cotes du pot', h: `<p>Équité nécessaire = Call ÷ (Pot + Call).</p>
   <div class="key"><b>Exemple :</b> pot 150, adversaire mise 50. Vous payez 50 pour gagner 200 : 50/200 = <b>25 %</b>. Si votre équité dépasse 25 %, le call est rentable.</div>` },
  { t: 'Règle du 2 et du 4', h: `<p>Au flop : outs × 4. Au turn : outs × 2.</p>
   <ul><li>Tirage couleur : 9 outs, ~36 % au flop, ~18 % au turn</li><li>Tirage quinte ouvert : 8 outs, ~32 % / ~16 %</li><li>Tirage quinte ventral : 4 outs, ~16 % / ~8 %</li><li>Deux overcards : 6 outs, ~24 % / ~12 %</li></ul>` },
  { t: 'Espérance de gain (EV)', h: `<p>EV = (% gain × gain) − (% perte × perte). Visez des décisions +EV. Le résultat d'une seule main ne prouve rien, seul le long terme compte.</p>` },
  { t: 'Cotes implicites', h: `<p>On y ajoute l'argent gagné aux tours suivants si on touche. Justifie un call légèrement non rentable quand l'adversaire paie gros ou quand votre main est déguisée (brelan avec petite paire).</p>` },
  { t: 'Combinatoire', h: `<p>1 326 combinaisons de départ. Une paire = 6 combos, une main non pairée = 16 (4 assortis + 12 dépareillés). Une carte de la paire sur le board : il reste 3 combos, deux : 1 combo.</p>` },
  { t: 'MDF et SPR', h: `<p><b>MDF</b> = Pot ÷ (Pot + Mise) : part minimale de votre range à continuer pour ne pas se faire bluffer à profit.</p>
   <p><b>SPR</b> = tapis restant ÷ pot au flop. &lt;4 : engagé avec top paire+. 4 à 10 : prudence avec les mains marginales. &gt;10 : il faut du très fort pour mettre tout son tapis.</p>` }
]},
{ id: 5, title: 'Concepts avancés', lessons: [
  { t: 'Profils de joueurs', h: `<ul><li><b>TAG</b> (serré-agressif) : le standard solide.</li><li><b>LAG</b> (large-agressif) : beaucoup de bluffs. Piégez-le avec des mains fortes.</li><li><b>Calling station</b> : ne bluffez jamais, value bet sans pitié.</li><li><b>Nit</b> : respectez ses relances.</li><li><b>Maniac</b> : laissez-le se battre tout seul avec des mains solides.</li></ul>` },
  { t: 'GTO et exploitation', h: `<p>La <b>GTO</b> est une stratégie équilibrée et inexploitable, un socle contre l'inconnu. L'<b>exploitation</b> s'écarte de la GTO pour punir une faiblesse précise, très payante aux petites limites. Approche pratique : maîtrisez les fondamentaux, puis exploitez les fuites repérées.</p>` },
  { t: 'Théorème fondamental de Sklansky', h: `<p>Chaque fois que vous jouez une main autrement que vous le feriez en voyant les cartes adverses, ils gagnent. Chaque fois que vous la jouez pareil, ils perdent. Tout le jeu se résume à faire moins d'erreurs que les autres.</p>` },
  { t: 'Tournois', h: `<ul><li><b>ICM</b> : en tournoi, les jetons ont une valeur non linéaire. Jouez plus serré près des paliers de gains.</li><li><b>Bulle</b> : le prochain éliminé ne gagne rien. Attaquez les joueurs serrés.</li><li><b>Push/fold</b> : sous 10 big blinds, tapis ou fold.</li></ul>` },
  { t: 'Rake et variantes', h: `<p>Le rake est la commission prélevée sur chaque pot. Il pèse lourd aux micro-limites : jouez un peu plus serré.</p>
   <p><b>PLO</b> : 4 cartes privées, exactement 2 utilisées avec exactement 3 du board. <b>Short deck</b> : 36 cartes, la couleur bat le full.</p>` }
]},
{ id: 6, title: 'Mental et bankroll', lessons: [
  { t: 'Le tilt', h: `<p>Le tilt, c'est la frustration qui prend le pas sur la logique. Premier destructeur de gains.</p>
   <ul><li>Jugez vos décisions, pas vos résultats.</li><li>Après une grosse perte, faites 5 à 10 minutes de pause.</li><li>Repérez vos déclencheurs : bad beats, coolers, mauvaises séries.</li></ul>` },
  { t: 'Gestion de bankroll', h: `<ul><li>Cash game : 50 buy-ins pour votre limite.</li><li>Tournois : 100 buy-ins et plus.</li><li>Montez de limite seulement si la bankroll le permet, redescendez si ça tourne mal.</li><li>Ne jouez jamais avec de l'argent dont vous avez besoin.</li></ul>` },
  { t: 'Routine d\'étude', h: `<ol><li>Jouez une session (1-2 h).</li><li>Étudiez un seul concept.</li><li>Rejouez en l'appliquant.</li><li>Revoyez vos plus gros pots perdus.</li><li>Recommencez.</li></ol>
   <div class="key"><b>Revue de session :</b> pour chaque grosse perte, demandez-vous quelle information vous avez ignorée.</div>` },
  { t: 'Étiquette en live', h: `<ul><li>Annoncez votre action à voix haute avant de bouger les jetons.</li><li>Ne lancez pas vos jetons dans le pot.</li><li>Laissez le croupier gérer le pot.</li></ul>` }
]}
];

// type: mc | tf | ordering. correct = index (mc), booléen (tf) ou liste d'items dans le bon ordre (ordering)
const QUESTIONS = [
{ c:1, d:'beginner', type:'mc', q:'Quelle main bat un full ?', o:['Couleur','Carré','Quinte','Brelan'], a:1, e:'Un carré est au-dessus du full dans le classement.' },
{ c:1, d:'beginner', type:'tf', q:'Les couleurs (♠♥♦♣) servent à départager deux mains égales.', a:false, e:'Les couleurs n\'ont aucune valeur hiérarchique. Ce sont les kickers qui départagent.' },
{ c:1, d:'beginner', type:'ordering', q:'Classez de la plus forte à la plus faible.', items:['Full','Couleur','Quinte','Double paire'], e:'Full > Couleur > Quinte > Double paire.' },
{ c:1, d:'intermediate', type:'mc', q:'Quelle est la meilleure position après le flop ?', o:['UTG','Grosse blind','Bouton','Petite blind'], a:2, e:'Le bouton parle en dernier à chaque tour après le flop.' },
{ c:1, d:'beginner', type:'mc', q:'Combien de cartes communes en tout ?', o:['3','4','5','7'], a:2, e:'3 au flop, 1 au turn, 1 à la river.' },
{ c:1, d:'intermediate', type:'mc', q:'Qui parle en premier après le flop ?', o:['UTG','La petite blind (si encore dans le coup)','Le bouton','La grosse blind toujours'], a:1, e:'Après le flop, le premier joueur encore en jeu à gauche du bouton parle d\'abord, donc la SB en général.' },
{ c:2, d:'beginner', type:'mc', q:'Vous êtes UTG avec [Js][7d]. Que faites-vous ?', o:['Relancer','Limper','Se coucher','Tapis'], a:2, e:'J7 dépareillé est une main poubelle, surtout UTG.' },
{ c:2, d:'beginner', type:'mc', q:'Quel pourcentage de mains une stratégie gagnante couche-t-elle preflop ?', o:['Moins de 30 %','Environ 50 %','Plus de 70 %','Presque aucune'], a:2, e:'La discipline preflop est la base du jeu gagnant.' },
{ c:2, d:'beginner', type:'tf', q:'Limper est généralement une bonne stratégie.', a:false, e:'Presque toujours une erreur : relancez ou couchez-vous.' },
{ c:2, d:'intermediate', type:'mc', q:'Quelle taille d\'ouverture standard ?', o:['Min-raise','2,5 à 3 BB','8 BB','Tapis'], a:1, e:'2,5 à 3 big blinds depuis la plupart des positions.' },
{ c:2, d:'intermediate', type:'mc', q:'Face à une ouverture, que privilégie la SB ?', o:['Call','3-bet ou fold','Limp','Check'], a:1, e:'Hors position, le simple call est souvent perdant.' },
{ c:2, d:'beginner', type:'mc', q:'Que faire avec [As][Ah] preflop ?', o:['Se coucher face à une relance','Toujours jouer fort','Limper pour piéger systématiquement','Dépend du bouton'], a:1, e:'Meilleure main de départ, on ne la couche jamais preflop.' },
{ c:3, d:'beginner', type:'mc', q:'Le board est [9h][8h][7c]. C\'est un board...', o:['Sec','Humide / connecté','Pairé','Vide'], a:1, e:'Beaucoup de tirages quinte et couleur.' },
{ c:3, d:'intermediate', type:'mc', q:'Vous avez top paire face à une calling station. Vous...', o:['Bluffez','Misez gros en value','Checkez toujours','Vous couchez'], a:1, e:'Elle paie trop : maximisez la value.' },
{ c:3, d:'beginner', type:'mc', q:'Qu\'est-ce qu\'un semi-bluff ?', o:['Un bluff avec rien','Miser un tirage qui peut s\'améliorer','Un check-raise','Une mise minimum'], a:1, e:'Deux façons de gagner : fold adverse ou amélioration.' },
{ c:3, d:'intermediate', type:'mc', q:'Board sec [Ks][7d][2c] : quelle mise est efficace ?', o:['Overbet','⅓ à ½ pot','Tapis','Pas de mise'], a:1, e:'Peu de tirages : une petite mise suffit.' },
{ c:3, d:'advanced', type:'tf', q:'Il faut c-bet 100 % des flops.', a:false, e:'Choisissez vos spots selon la texture et l\'adversaire.' },
{ c:4, d:'beginner', type:'mc', q:'Le pot est de 100, l\'adversaire mise 50. Quelle équité faut-il pour payer ?', o:['25 %','33 %','50 %','20 %'], a:0, e:'Le pot contient 150 après sa mise. Vous payez 50 pour gagner 200 au total : 50/200 = 25 %.' },
{ c:4, d:'beginner', type:'mc', q:'Tirage couleur au flop (9 outs), règle du 4 :', o:['~18 %','~27 %','~36 %','~45 %'], a:2, e:'9 × 4 = 36 %.' },
{ c:4, d:'beginner', type:'mc', q:'Combien de combos pour une paire de dames ?', o:['4','6','12','16'], a:1, e:'6 combinaisons.' },
{ c:4, d:'intermediate', type:'mc', q:'Mise de la moitié du pot. MDF ?', o:['33 %','50 %','67 %','75 %'], a:2, e:'Pot / (Pot + Mise) = 1 / 1,5 ≈ 67 %.' },
{ c:4, d:'intermediate', type:'mc', q:'SPR de 2 au flop avec top paire. Vous êtes...', o:['Peu engagé','Probablement engagé','Obligé de se coucher','Aucun lien'], a:1, e:'SPR bas : top paire+ suffit généralement pour aller au tapis.' },
{ c:4, d:'advanced', type:'mc', q:'Combien de combos pour AKo ?', o:['4','6','12','16'], a:2, e:'12 dépareillés. Avec les 4 assortis, AK fait 16 combos.' },
{ c:5, d:'beginner', type:'mc', q:'Quel profil ne faut-il JAMAIS bluffer ?', o:['Nit','Calling station','TAG','LAG'], a:1, e:'Elle ne se couche pas.' },
{ c:5, d:'beginner', type:'mc', q:'ICM signifie :', o:['Independent Chip Model','Internal Chip Method','Instant Cash Mode','Initial Card Matrix'], a:0, e:'Independent Chip Model.' },
{ c:5, d:'intermediate', type:'mc', q:'La GTO est :', o:['Un style de bluff','Une stratégie équilibrée, inexploitable','Réservée aux tournois','Un logiciel'], a:1, e:'Un socle de défense contre l\'inconnu.' },
{ c:5, d:'intermediate', type:'mc', q:'Sous 10 BB en tournoi :', o:['Limper','Min-raise','Tapis ou fold','Toujours call'], a:2, e:'Push/fold.' },
{ c:5, d:'advanced', type:'mc', q:'Au PLO, vous utilisez :', o:['0 à 2 cartes privées','Exactement 2 privées + 3 du board','Exactement 1 privée','Toutes les privées'], a:1, e:'Règle 2 + 3 obligatoire.' },
{ c:6, d:'beginner', type:'mc', q:'Combien de buy-ins en cash game ?', o:['5','20','50','500'], a:2, e:'Environ 50 buy-ins de votre limite.' },
{ c:6, d:'beginner', type:'tf', q:'Un mauvais résultat sur une main prouve une mauvaise décision.', a:false, e:'Jugez le processus, pas le résultat.' },
{ c:6, d:'beginner', type:'mc', q:'Après un gros bad beat, vous devriez :', o:['Rejouer plus gros','Faire une courte pause','Changer de table sans réfléchir','Boire un coup'], a:1, e:'5 à 10 minutes de recul évitent le tilt.' },
{ c:6, d:'intermediate', type:'mc', q:'Quelles mains revoir en priorité ?', o:['Les plus gros pots perdus','Les mains gagnées','Aucune','Seulement les all-in'], a:0, e:'C\'est là que se cachent les plus grosses fuites.' }
];

const LEGENDS = [
{ n:'Doyle Brunson, 10-2', y:'1976 et 1977', who:'WSOP Main Event',
  s:'Brunson remporte le Main Event deux années de suite en gagnant la dernière main avec 10-2, la main que certains appellent aujourd\'hui « la main Doyle Brunson ».',
  l:'Une main faible peut gagner, mais ce n\'est pas ce qui la rend jouable. À reproduire hors position, elle perdrait à long terme. Les légendes se souviennent de leur chance, pas de leurs fuites.' },
{ n:'Johnny Chan contre Erik Seidel', y:'1988', who:'WSOP Main Event, heads-up',
  s:'Chan ralentit une main très forte face à Seidel, le laisse miser, puis le paie en relançant. La scène a été reprise dans le film Rounders.',
  l:'Le piège et la patience : ralentir une main forte pour faire payer plus gros.' },
{ n:'Stu Ungar, trois Main Events', y:'1980, 1981, 1997', who:'WSOP',
  s:'Ungar remporte trois fois le Main Event, un record que seul son jeu agressif et ses lectures permettaient. Sa vie personnelle s\'est terminée en difficulté.',
  l:'Le talent brut ne remplace ni l\'équilibre mental ni la gestion de bankroll, deux sujets du chapitre 6.' },
{ n:'Chris Moneymaker', y:'2003', who:'WSOP Main Event',
  s:'Amateur, qualifié via un satellite en ligne à 86 $, Moneymaker gagne le Main Event et déclenche le « boom du poker ». Un de ses bluffs les plus célèbres : miser gros sur la river face à Sam Farha avec une main invendable.',
  l:'Le bluff fonctionne parce qu\'il raconte une histoire cohérente avec le reste de la main.' },
{ n:'Tom Dwan, « durrrr »', y:'2000s-2010s', who:'Parties en ligne à très gros enjeux',
  s:'Dwan est devenu célèbre pour un style ultra-agressif en ligne, avec des bluffs à très haute variance.',
  l:'L\'agressivité maximale exige une compréhension solide des ranges adverses. Sans cela, c\'est juste du risque.' },
{ n:'Phil Ivey', y:'2000s-2020s', who:'Multiple bracelets WSOP, cash games',
  s:'Considéré par beaucoup comme l\'un des plus complets : lectures de joueurs, flexibilité, sens du jeu.',
  l:'L\'adaptation : un joueur complet change de plan selon l\'adversaire plutôt que de suivre un seul style.' }
];
