# 💪 FitQuest — Gamified Fitness Tracker

A mobile-first PWA fitness tracker with XP, streaks, ranks, and multi-user support.

## Features
- 👤 Multi-user profiles (anyone can create their own account)
- 🔥 Daily streak tracking
- ⚔️ 6 ranks to unlock (Couch Warrior → Bangalore Alpha)
- 💛 XP for workouts + daily habits
- ⚖️ Weight logging with history
- 🍽️ Personalised meal plan based on your stats
- 📱 Installable as a PWA (Add to Home Screen)

## Deploy to Vercel (Free, 5 minutes)

### Option A: Vercel CLI
```bash
npm install -g vercel
cd fitquest
npm install
vercel
```
Follow the prompts. Your app will be live at `yourname.vercel.app`

### Option B: Vercel Website (No coding needed)
1. Go to https://vercel.com and sign up free
2. Click "Add New Project"
3. Upload this folder or connect your GitHub repo
4. Click Deploy — done!

### Option C: Netlify
1. Go to https://netlify.com
2. Drag and drop the `build/` folder (after running `npm run build`)
3. Your app is live instantly

## Local Development
```bash
npm install
npm start
```

## Tech Stack
- React 18
- localStorage for per-user data persistence
- PWA manifest for installability
- No backend needed — fully client-side
