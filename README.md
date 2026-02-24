# OpenGradient IQ Board

A production-ready gamified IQ + protocol literacy quiz. Answer 12 randomized questions, get scored, and generate a shareable OpenGradient-branded PFP card.

## Tech stack

- **Next.js** (App Router), **React**, **TypeScript**
- **TailwindCSS**, **Framer Motion**
- **Canvas API** for 1024×1024 card generation
- Local **JSON** question dataset (`/data/questions.json`)

## Features

- **Quiz**: 12 questions per session, 40% easy / 40% medium / 20% hard, no duplicates
- **7-minute** countdown; auto-submit when time runs out
- **Scoring** with rank tiers: Gradient Architect, Neural Elite, Protocol Scholar, Data Explorer, Model Initiate
- **User input**: X (Twitter) username + optional image upload; avatar from [unavatar.io](https://unavatar.io) or gradient fallback
- **PFP card**: Dark UI, purple/blue gradients, glassmorphism; **Download PNG** and **Share to X**

## Getting started

```bash
cd opengradient-iq-board
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint

## Project structure

```
/app
  layout.tsx, page.tsx, globals.css
/components
  Quiz/, UserInput/, Card/
/data
  questions.json
/utils
  randomizer.ts, scoring.ts, cardGenerator.ts
```

## Future extensions (placeholders)

- Wallet connect
- Leaderboard
- NFT credential mint
- Onchain score storage

## License

MIT
