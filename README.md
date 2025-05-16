## Todo

- [x] reveal state after loss needs to show clicked bomb and not show the adjacent cells
- [x] better event handling for clicking for mobile
- [x] quick reveal mode (chording)
- [x] color adjacent counts
- [x] store best time for each difficulty
- [x] disable clicking on flagged items
- [x] reveal should not reveal a flagged mine
- [x] add custom hook to handle long press
- [x] usePressHandler should not fire the event if the user drags
- [x] fix right clicking
- [x] update focus styling
- [x] animate mine placement
- [x] fix mobile layout
- [x] lock the game once you're in a win state (currently the user can click an unflagged mine and move from a win to a loss)
- [x] improve UX on clicking quick -- currently some clicks are being lost
- [x] add seeded mode
- [x] only update high score for non-seeded rounds
- [x] re-enable dismissing the new best time dialog
- [x] add daily challenge mode, using seeds
- [x] the win state should be composable (NewBestTime will become very gross very fast) - right now this shows a seed message on daily challenge win
- [x] determine if all menu options should be in the game dropdown or if they should be elsewhere. right now challenges are route based (including difficulty) so the select difficulty drop down is a bit weird. it could be updated so they can be overridden to transition routes
- [ ] use custom svgs, not emojis
- [ ] mobile styles -- lock the chrome to the viewport
- [ ] reveal state after a loss should show incorrect flags
- [ ] reveal state after a loss shouldn't show bombs in cells with correct flags
- [ ] update all colors in .minesweeper to use css custom properties
- [ ] adjust mine generation to always use a seed -- if one isn't passed it should generate the seed first (random string?)
- [ ] supply seed (& link) when game complete
- [ ] add difficulty tier to seed route
- [ ] update difficulty settings from daily challenge menu to update the page route
- [ ] add expanded mode -- mostly for mobile
- [ ] fix multi touch issue where you can accidentally flag if both fingers don't touch at exactly the same time
- [ ] add question marks
- [ ] enable chording on mobile
- [ ] address accidental flags while moving fast (with mouse)
- [ ] address stuck focus state on cells

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
