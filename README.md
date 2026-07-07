# Liliana's Favor — a Love Letter game

A browser version of the board game **Love Letter**, reskinned in the Magic:
The Gathering universe around **Liliana Vess**. Play solo against three
deductive bots. Built to match the visual theme of the vess-archive site.

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
| 1 | Guard | Zombie | Name a card 2–8; a matching rival is cast out |
| 2 | Priest | Dark Confidant | Look at a rival's hand |
| 3 | Baron | Deadly Assassin | Compare hands; the lesser is cast out |
| 4 | Handmaid | Grave Titan | Untargetable until your next turn |
| 5 | Prince | The Raven Man | A player discards and redraws |
| 6 | King | Nicol Bolas | Trade hands with a rival |
| 7 | Countess | Griselbrand | Must discard if held with King or Prince |
| 8 | Princess | Liliana Vess | Discard her and you are cast out |

First player to 4 favors wins the match.

## Layout

- `src/game/` — pure, framework-free game engine, rules, and bot AI (unit tested)
- `src/lib/useGameController.ts` — React hook driving the turn loop and bot pacing
- `src/components/` — themed UI (table, cards, prompts, log, screens)
