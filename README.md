# Liliana's Favor: a Love Letter game

A browser version of the board game **Love Letter**, reskinned in the Magic:
The Gathering universe around **Liliana Vess**. Play solo against deductive
bots in 2-, 3-, or 4-player tables. Built to match the visual theme of the
VessArchive site.

**▶ Play it here: [vessarchive.com/play](https://vessarchive.com/play)**

## Stack

Vite + React 19 + TypeScript + Tailwind CSS v4. Fully client-side, no backend.

## Commands

```
npm install
npm run dev       # local dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
npm run test      # engine + bot unit tests (Vitest)
```

## Cards

The 8 Love Letter roles map onto the MTG art in `public/cards/`:

| Value | Role | Card | Effect |
|------|------|------|--------|
| 1 | Guard | Zombie | Name a card 2-8; a matching rival is cast out |
| 2 | Priest | Dark Confidant | Look at a rival's hand |
| 3 | Baron | Deadly Assassin | Compare hands; the lesser is cast out |
| 4 | Handmaid | Grave Titan | Untargetable until your next turn |
| 5 | Prince | The Raven Man | A player discards and redraws |
| 6 | King | Nicol Bolas | Trade hands with a rival |
| 7 | Countess | Griselbrand | Must discard if held with King or Prince |
| 8 | Princess | Liliana Vess | Discard her and you are cast out |

## Tables

Pick a table before a match. The favor target follows the official Love Letter
thresholds:

| Table | Bots | Favors to win |
|-------|------|---------------|
| 2 players | 1 | 7 |
| 3 players | 2 | 5 |
| 4 players | 3 | 4 |

In the 2-player table, three cards are dealt face-up at the start of each round
(the official variant rule).

## Settings

- **Bot difficulty**: Easy (random legal moves), Medium (smart with occasional
  slips, the default), or Hard (best move every time).
- **Sound effects**: card plays, Guard hits, favors, and victory.
- **Insight mode**: logs each bot's reasoning and probabilities in the Chronicle.
- **Step through bot turns**: pause on each bot's move and press Continue to
  advance.

A Grimoire button opens a reference of every card and how many are in the deck.

## Layout

- `src/game/`: pure, framework-free game engine, rules, and bot AI (unit tested)
- `src/lib/useGameController.ts`: React hook driving the turn loop and bot pacing
- `src/lib/`: sound (Web Audio) and localStorage-backed settings
- `src/components/`: themed UI (table, cards, prompts, log, screens)

## Credits & assets

- **Card art** (`public/cards/`): temporary placeholders generated with Google
  Gemini. The intent is to replace them with original artwork commissioned from
  real artists down the line.
- **Sound effects** (`public/sfx/`): from [Kenney](https://kenney.nl) (CC0).

## Disclaimer

This is a non-commercial fan project. *Love Letter* is a game designed by Seiji
Kanai. *Magic: The Gathering* and its characters (Liliana Vess, Nicol Bolas,
Griselbrand, and others) are trademarks and property of Wizards of the Coast.
This project is not affiliated with or endorsed by either.

## License

The **source code** is released under the [MIT License](LICENSE). This does not
extend to the third-party assets and intellectual property referenced above.
