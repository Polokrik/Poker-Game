# Texas Hold'em Learning App — Design & Knowledge Prompt

> Use this prompt to build an interactive, visually polished single-page React application that teaches Texas Hold'em poker and quizzes the user on their knowledge. The app should feel like a premium poker coaching tool — dark, cinematic, card-table aesthetic with felt textures, gold accents, and sharp typography.

---

## 🎯 APP OBJECTIVE

Build an interactive learning app with two core modes:

1. **LEARN MODE** — A structured, progressive curriculum split into 6 chapters (see Knowledge Base below). Each chapter has expandable lessons with clear explanations, visual examples (card suits via Unicode ♠♥♦♣), and key takeaways.

2. **QUIZ MODE** — A test-your-knowledge engine with multiple question types:
   - **Multiple choice** (4 options)
   - **True / False**
   - **Scenario-based** (given a hand + board + situation → pick the best action)
   - **Ordering / ranking** (e.g., rank these hands from strongest to weakest)

The user should be able to pick a chapter to study, then quiz themselves on that chapter or take a mixed quiz across all chapters. Track score, show correct/incorrect with explanations.

---

## 🎨 DESIGN DIRECTION

- **Aesthetic**: Casino noir — dark emerald felt background, matte black cards, gold/amber accents, subtle card suit watermarks
- **Typography**: Use a sharp serif display font (e.g., "Playfair Display" or "DM Serif Display") for headings, and a clean sans-serif (e.g., "DM Sans" or "Outfit") for body text
- **Cards**: Render poker cards as styled divs with suit symbols (♠ ♥ ♦ ♣) — red for hearts/diamonds, white for spades/clubs on dark backgrounds
- **Animations**: Smooth transitions between sections, card flip animations for quiz reveals, progress bar for quiz completion
- **Layout**: Single-page app with a sidebar navigation for chapters, main content area, and a floating quiz launcher

---

## 📚 KNOWLEDGE BASE (embed this as the app's content engine)

### CHAPTER 1: FUNDAMENTALS

#### 1.1 — Game Overview
Texas Hold'em is played with 2–10 players using a standard 52-card deck. Each player receives 2 private cards ("hole cards") and shares 5 community cards. The goal: make the best 5-card hand using any combination of your hole cards and the board.

#### 1.2 — Betting Rounds
A hand unfolds over 4 betting rounds:
- **Preflop**: Each player gets 2 hole cards. Betting begins left of the Big Blind.
- **Flop**: 3 community cards are dealt face-up. New betting round.
- **Turn**: 1 additional community card. New betting round.
- **River**: The 5th and final community card. Final betting round.
- **Showdown**: If 2+ players remain, the best hand wins the pot.

#### 1.3 — Hand Rankings (strongest → weakest)
1. **Royal Flush** — A♣ K♣ Q♣ J♣ T♣ (top 5 cards of one suit)
2. **Straight Flush** — Five consecutive cards of the same suit (e.g., J♣ T♣ 9♣ 8♣ 7♣)
3. **Four of a Kind** — Four cards of the same rank (e.g., 4♣ 4♠ 4♦ 4♥)
4. **Full House** — Three of a kind + a pair (e.g., 3♣ 3♠ 3♦ 7♥ 7♣)
5. **Flush** — Five cards of the same suit, not consecutive (e.g., K♦ J♦ 7♦ 5♦ 3♦)
6. **Straight** — Five consecutive cards of mixed suits (e.g., 6♠ 5♠ 4♦ 3♦ 2♥)
7. **Three of a Kind** — Three cards of the same rank
8. **Two Pair** — Two different pairs (e.g., Q♣ Q♠ 2♣ 2♥)
9. **One Pair** — A single pair
10. **High Card** — No combination; highest card plays

**Tiebreaker rule**: Suits have NO hierarchical value. Kickers (side cards) break ties between identical hand types.

#### 1.4 — Table Positions
Position is arguably the most important concept in poker. Acting later = more information.
- **UTG (Under the Gun)**: First to act preflop. Hardest position — requires strong hands.
- **Middle Position (MP)**: Moderate hand range.
- **Cutoff (CO)**: Second-to-last preflop. Strong position.
- **Button (BTN)**: Last to act postflop. The most profitable seat at the table.
- **Small Blind (SB)**: Posts a forced half-bet. Acts second-to-last preflop but FIRST postflop.
- **Big Blind (BB)**: Posts a forced full bet. Acts last preflop but second postflop.

#### 1.5 — Core Actions
- **Check**: Pass without betting (only if no bet is pending).
- **Call**: Match the current bet.
- **Raise**: Increase the current bet.
- **Fold**: Discard your hand and forfeit the pot.

---

### CHAPTER 2: PREFLOP STRATEGY

#### 2.1 — Hand Selection Discipline
A winning strategy means folding preflop more than 70% of the time. Discipline and patience are non-negotiable.

#### 2.2 — Opening Ranges by Position
- **UTG (tight)**: Only premium pairs (77+), strong broadways (AK, AQ, KTs+).
- **MP**: Slightly wider — add AJs, KQs, TT+.
- **CO**: Open wider — suited connectors (76s+), more broadways.
- **BTN (widest)**: Open very wide vs. blinds — suited aces, connectors (43s+), hands like K9o, J7s+.

#### 2.3 — Hand Categories
- **Premium Pairs (AA, KK, QQ, JJ, TT)**: Always raise from any position. Pocket Aces is the best starting hand — never fold it preflop.
- **Medium Pairs (99–66)**: Playable in most positions; aim for set-mining (hitting three of a kind on the flop).
- **Small Pairs (55–22)**: Best played in late position for set-mining.
- **Suited Connectors (e.g., 87s, 76s)**: Great for making straights and flushes. Better in position.
- **Trash Hands (e.g., Q5o, J6o, 72o)**: The weakest hands. Never open them.

#### 2.4 — Playing the Blinds
Playing from the blinds is inherently disadvantaged (out of position postflop).
- **SB vs. an open**: Prefer 3-betting (re-raising) or folding over flat-calling.
- **BB defense**: You already have money invested; defend wider but selectively.

#### 2.5 — Key Preflop Concepts
- **Limping** (just calling the big blind) is almost always a mistake — raise or fold.
- **3-Bet**: A re-raise over an initial raise. Used for value (strong hands) or as a bluff (light 3-bet).
- **Open-raise sizing**: Standard is 2.5–3x the big blind from most positions.

---

### CHAPTER 3: POSTFLOP STRATEGY

#### 3.1 — Reading Board Texture
- **Wet/Connected boards** (e.g., 9♥ 8♥ 7♣): Many possible draws (straights, flushes). Bet large for value and protection.
- **Dry boards** (e.g., K♠ 7♦ 2♣): Few draws possible. Smaller bets (½ pot) are effective since opponents rarely have strong draws.

#### 3.2 — Bet Sizing Principles
- Size bets to deny profitable drawing odds to opponents.
- On wet boards: bet ⅔ to full pot.
- On dry boards: bet ⅓ to ½ pot.
- **Overbetting** (1.2–1.3x pot): A polarizing move — represents either the nuts or a bluff. Effective against good players.

#### 3.3 — C-Betting (Continuation Betting)
A c-bet is a bet made by the preflop aggressor on the flop. Standard play when the board favors your perceived range. Don't c-bet 100% of the time — pick spots based on board texture and opponent tendencies.

#### 3.4 — Value Bet vs. Bluff
- **Value Bet**: Betting with a strong hand to extract chips from weaker hands that will call.
- **Bluff**: Betting with a weak hand to make stronger hands fold.
- **Semi-Bluff**: Betting with a drawing hand (e.g., flush draw) that can improve. Best bluffing option because you have two ways to win.

#### 3.5 — Adapting to Opponent Types
- **vs. Calling Stations** (call too much): Eliminate bluffs. Bet big with strong hands for maximum value.
- **vs. Nits** (overly tight): Bluff more often. Fold your medium hands when they show aggression.
- **Blockers**: Cards in your hand that reduce the likelihood of your opponent holding specific hands. A key tool for selecting profitable bluff spots.

---

### CHAPTER 4: POKER MATH

#### 4.1 — Pot Odds
The price you must pay relative to what's in the pot.
**Formula**: Call Amount ÷ (Pot + Call Amount) = Break-even %
*Example*: Pot is $150, opponent bets $50. You must call $50 to win $200. → 50 / 200 = 25%. You need >25% equity to call profitably.

#### 4.2 — The Rule of 2 and 4
Quick method to estimate your chance of completing a draw:
- **Flop** (2 cards to come): Outs × 4 = approximate equity %
- **Turn** (1 card to come): Outs × 2 = approximate equity %

**Common outs**:
- Flush draw: 9 outs (~36% on flop, ~18% on turn)
- Open-ended straight draw: 8 outs (~32% on flop, ~16% on turn)
- Gutshot straight draw: 4 outs (~16% on flop, ~8% on turn)
- Two overcards: 6 outs (~24% on flop, ~12% on turn)

#### 4.3 — Expected Value (EV)
**Formula**: EV = (Win% × $Won) − (Loss% × $Lost)
Every decision should aim to be +EV (positive expected value) over the long run. A single hand outcome is irrelevant — only long-term EV matters.

#### 4.4 — Implied Odds
An extension of pot odds that accounts for future money you could win on later streets if you hit your draw. Justifies calling with slightly worse immediate odds when:
- Your opponent is likely to pay off big if you hit.
- You have a disguised hand (e.g., set with a small pair).

#### 4.5 — Combinatorics
There are 1,326 possible starting hand combinations in Hold'em.
- **Unpaired hands (e.g., AKo)**: 16 combos (12 offsuit + 4 suited)
- **Pocket pairs (e.g., QQ)**: 6 combos
- **Rule of 6-3-1 for pairs**: No blocker = 6 combos. One blocker on board = 3 combos. Two blockers = 1 combo.

#### 4.6 — MDF (Minimum Defense Frequency)
The minimum % of your range you must continue with (call or raise) to prevent opponents from profiting with any two cards as a bluff.
**Formula**: MDF = Pot Size ÷ (Pot Size + Bet Size)

#### 4.7 — SPR (Stack-to-Pot Ratio)
Your remaining stack divided by the pot size after the flop. Guides commitment decisions:
- **Low SPR (<4)**: Likely committed — willing to go all-in with top pair+.
- **Medium SPR (4–10)**: Flexible — proceed with caution with marginal hands.
- **High SPR (>10)**: Rarely committed — need very strong hands to stack off.

---

### CHAPTER 5: ADVANCED CONCEPTS

#### 5.1 — Player Types & Reads
- **TAG (Tight-Aggressive)**: Strong, standard players. Aggressive with good hands. Hardest to exploit.
- **LAG (Loose-Aggressive)**: Wide range, lots of bluffs, constant pressure. Counter by trapping with strong hands.
- **Calling Station (Loose-Passive)**: Plays many hands, rarely folds. Never bluff them — value bet relentlessly.
- **Nit (Tight-Passive)**: Plays few hands, rarely bluffs. Steal their blinds. Fold when they raise.
- **Maniac**: Hyper-aggressive, erratic. Let them hang themselves — play solid hands and let them bluff into you.

#### 5.2 — GTO vs. Exploitative Play
- **GTO (Game Theory Optimal)**: A mathematically balanced, unexploitable strategy. Used as a baseline against unknown or strong opponents.
- **Exploitative**: An offensive style that deviates from GTO to attack specific opponent weaknesses. Best approach at low stakes where players make large, frequent mistakes.
- **Practical approach**: Start with GTO fundamentals, then exploit when you identify a leak.

#### 5.3 — Sklansky's Fundamental Theorem of Poker
"Every time you play a hand differently from the way you would have played it if you could see all your opponents' cards, they gain; every time you play it the same way, they lose." The entire game reduces to making fewer mistakes than your opponents.

#### 5.4 — Tournament Concepts (MTT)
- **ICM (Independent Chip Model)**: In tournaments, chips have non-linear monetary value. ICM dictates tighter play near pay jumps.
- **The Bubble**: The point where the next elimination gets nothing, while all remaining players cash. Exploit tight players; protect your stack if short.
- **Push/Fold**: With <10 big blinds, your only moves are all-in or fold. No limping, no min-raising.

#### 5.5 — Rake & Rakeback
Rake is the house commission on each pot (cash) or entry fee (tournament). It erodes your winrate — factor it in. Tighten hand selection at micro-stakes where rake is proportionally higher. Seek rakeback deals to offset.

#### 5.6 — Other Popular Variants
- **PLO (Pot-Limit Omaha)**: 4 hole cards. Must use exactly 2 from hand + exactly 3 from board.
- **Short Deck (6+)**: 36-card deck (2–5 removed). Flush beats Full House. Dramatically different probabilities.

---

### CHAPTER 6: MINDSET & BANKROLL

#### 6.1 — Tilt Management
Tilt = emotional frustration overriding logical decision-making. It is the #1 profit killer.
- **Process over results**: Judge yourself on decision quality (+EV), not outcomes.
- **Take breaks**: After a big loss, step away. Even 5–10 minutes of reset prevents chasing losses.
- **Recognize triggers**: Bad beats, coolers, extended downswings. Knowing your tilt triggers lets you catch it early.

#### 6.2 — Bankroll Management (BRM)
You cannot win if you go broke. Protect your bankroll at all costs.
- **Cash games**: Maintain 50 buy-ins for your current stake.
- **Tournaments**: Maintain 100+ buy-ins.
- **Moving up**: Take shots at higher stakes only when your bankroll supports it. If you lose, move back down immediately.
- **Never play scared money**: If losing your buy-in would cause real financial stress, you're playing too high.

#### 6.3 — Study Routine (Kaizen Method)
Continuous improvement through small, consistent efforts:
1. Play a session (1–2 hours)
2. Study one concept or training resource
3. Play another session, applying what you learned
4. Review your session — filter biggest losing hands
5. Repeat

#### 6.4 — Session Review Best Practices
- **Biggest losers filter**: Review your largest losing pots. Ask: "Was there information I ignored? Would I play it differently now?"
- **Missed opportunities**: Check hands you folded to 3-bets — was a 4-bet or call mathematically justified?
- **Use software**: PokerTracker 4, Hold'em Manager 3 for tracking stats (VPIP, PFR, etc.). Flopzilla / Equilab for equity analysis. GTO Wizard / PioSolver for advanced solver work.

#### 6.5 — Live Poker Etiquette
- **Announce actions verbally** ("I call", "Raise to 40") before moving chips to avoid string-bet penalties.
- **Don't splash the pot** — place chips neatly in front of you.
- **Let the dealer manage the pot** — don't reach into the center.

---

## 🧪 QUIZ ENGINE SPECIFICATION

Generate questions dynamically from the knowledge base above. Each question should include:

```json
{
  "chapter": 1-6,
  "difficulty": "beginner" | "intermediate" | "advanced",
  "type": "multiple_choice" | "true_false" | "scenario" | "ordering",
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "explanation": "Why this is the correct answer..."
}
```

### Sample Questions per Chapter:

**Chapter 1 (Fundamentals)**
- Q: "Which hand beats a Full House?" → Four of a Kind ✓
- Q: "True or False: Suits determine tiebreakers in Hold'em" → False ✓
- Q: "Rank these hands: Flush, Straight, Full House, Two Pair" → Full House > Flush > Straight > Two Pair ✓

**Chapter 2 (Preflop)**
- Q: "You're UTG with J♠ 7♦. What should you do?" → Fold ✓
- Q: "What % of hands should you fold preflop in a winning strategy?" → >70% ✓
- Q: "True or False: Limping into pots is generally a strong play" → False ✓

**Chapter 3 (Postflop)**
- Q: "The board is 9♥ 8♥ 7♣. This is a..." → Wet/connected board ✓
- Q: "Your opponent is a known Calling Station. You have top pair. You should..." → Value bet large ✓
- Q: "What is a semi-bluff?" → Betting with a draw that can improve ✓

**Chapter 4 (Math)**
- Q: "Pot is $100, opponent bets $50. What are your pot odds?" → 25% (50/200) ✗ → 33% (50/150) ... Actually: Call $50 to win $200 total → 50/200 = 25% ✓
- Q: "You have a flush draw on the flop (9 outs). Using the Rule of 4, your equity is approximately..." → 36% ✓
- Q: "How many combos does a pocket pair have?" → 6 ✓

**Chapter 5 (Advanced)**
- Q: "Which player type should you NEVER bluff?" → Calling Station ✓
- Q: "What does ICM stand for?" → Independent Chip Model ✓
- Q: "GTO strategy is best described as..." → Mathematically balanced and unexploitable ✓

**Chapter 6 (Mindset)**
- Q: "How many buy-ins should you have for cash games?" → 50 ✓
- Q: "True or False: A bad result on a single hand means you made a bad decision" → False ✓
- Q: "What should you do after losing a big pot to a bad beat?" → Take a short break ✓

---

## 🏗️ APP STRUCTURE

```
┌─────────────────────────────────────────────┐
│  🃏  HOLD'EM ACADEMY            [Learn][Quiz] │
├──────────┬──────────────────────────────────┤
│ Ch.1 ▸   │                                  │
│ Ch.2 ▸   │   [Main Content Area]            │
│ Ch.3 ▸   │                                  │
│ Ch.4 ▸   │   - Lesson text + card visuals   │
│ Ch.5 ▸   │   - Key takeaway boxes           │
│ Ch.6 ▸   │   - Interactive examples          │
│          │                                  │
│──────────│   [Quiz Mode]                    │
│ Progress │   - Question card with flip      │
│ ████░░   │   - Score tracker                │
│ 4/6 done │   - Explanation on reveal        │
└──────────┴──────────────────────────────────┘
```

### Feature Requirements:
- **Progress tracking**: Mark chapters as read, track quiz scores per chapter
- **Quiz filters**: By chapter, by difficulty, or mixed
- **Card rendering**: Visual poker card components with suit colors
- **Responsive**: Works on both desktop and mobile
- **State management**: Use React useState/useReducer for all state (no localStorage)
- **Instant feedback**: Show correct/incorrect immediately with explanation
- **Score summary**: End-of-quiz results screen with breakdown by chapter

---

## ⚙️ TECHNICAL CONSTRAINTS

- Single-file React component (.jsx)
- Tailwind CSS utility classes only (pre-defined, no compiler)
- No external dependencies beyond: React, lucide-react for icons
- All content embedded in the component (no API calls needed for base version)
- Use CSS variables for theming
- No localStorage — use React state only
