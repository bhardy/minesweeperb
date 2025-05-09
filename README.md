## Todo

- [x] reveal state after loss needs to show clicked bomb and not show the adjacent cells
- [x] better event handling for clicking for mobile
- [ ] quick reveal mode
- [x] color adjacent counts
- [x] store best time for each difficulty
- [x] disable clicking on flagged items
- [ ] use custom svgs, not emojis
- [x] reveal should not reveal a flagged mine
- [x] add custom hook to handle long press
- [x] usePressHandler should not fire the event if the user drags
- [x] fix right clicking
- [x] update focus styling
- [x] animate mine placement
- [x] fix mobile layout
- [x] lock the game once you're in a win state (currently the user can click an unflagged mine and move from a win to a loss)
- [x] improve UX on clicking quick -- currently some clicks are being lost
- [ ] mobile styles -- lock the chrome to the viewport
- [ ] reveal state after a loss should show incorrect flags
- [ ] update all colors in .minesweeper to use css custom properties
- [x] add seeded mode
- [ ] seeded mode should account for difficulty
- [ ] adjust mine generation to always use a seed -- if one isn't passed it should generate the seed first (random string?)
- [ ] supply seed when game complete
- [x] only update high score for non-seeded rounds
- [ ] re-enable dismissing the new best time dialog
- [ ] add daily challenge mode, using seeds

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
