# No More Sleeping In 🔔⚡

> A PWA that prevents dozing off after your alarm. Place your phone on the bed — if you roll over, a loud alarm fires immediately.

[![CI](https://github.com/Iwashita-Nao/no-more-sleeping-in/actions/workflows/deploy.yml/badge.svg)](https://github.com/Iwashita-Nao/no-more-sleeping-in/actions/workflows/deploy.yml)

---

## Features

- ⏱️ **Timer presets** — 5 / 15 / 20 / 30 / 45 / 60 minutes
- 📡 **Motion monitoring** — real-time accelerometer via `DeviceMotionEvent`
- 🎚️ **Sensitivity slider** — tune the threshold to your mattress
- 🚨 **Alarm** — full-screen red overlay + layered Web Audio synth (no files needed)
- 🔒 **Wake Lock** — screen stays on using the Wake Lock API
- ☀️ **Success screen** — shown when timer expires without any movement
- 📱 **PWA** — installable on iOS & Android home screens

---

## Quick Start (GitHub CLI + Local Dev)

```bash
# 1. Clone using GitHub CLI
gh repo clone Iwashita-Nao/no-more-sleeping-in

# 2. Enter the directory
cd no-more-sleeping-in

# 3. Install dependencies  (requires Node.js 18+)
npm install

# 4. Start the dev server
npm run dev
```

Open http://localhost:5173 in your browser.

> ⚠️ **Sensors require HTTPS or localhost.**  
> The dev server on `localhost` works fine. To test on your phone over the network, use a tunnel:
> ```bash
> npx localtunnel --port 5173
> ```

---

## Deploy to Vercel

### Option A — Vercel CLI (one command)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite and uses the settings in `vercel.json`.

### Option B — Vercel GitHub Integration (recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the repo `Iwashita-Nao/no-more-sleeping-in`
3. Click **Deploy** — that's it

Every push to `main`/`master` triggers a new deployment automatically.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript |
| Styling | Tailwind CSS v3 |
| PWA | `vite-plugin-pwa` (Workbox) |
| Audio | Web Audio API (synthesized, no files) |
| Sensors | `DeviceMotionEvent` |
| Screen Lock | Wake Lock API |
| CI | GitHub Actions |
| Hosting | Vercel |

---

## iOS Notes

- Safari on **iOS 13+** requires a user gesture to access `DeviceMotionEvent` — handled automatically on the Start button press.
- Install via **Share → Add to Home Screen** for the best standalone PWA experience.

---

## Project Structure

```
src/
├── App.tsx                    # State machine: setup → monitoring → alarm → success
├── components/
│   ├── TimerSetup.tsx         # Timer picker + sensitivity slider + start CTA
│   ├── ActiveMonitor.tsx      # Animated circular countdown + live sensor status
│   ├── AlarmScreen.tsx        # Full-screen red alarm overlay
│   └── SuccessScreen.tsx      # Completion screen with session stats
└── hooks/
    ├── useMotionSensor.ts     # DeviceMotionEvent + rolling-average noise filter
    ├── useWakeLock.ts         # Wake Lock API + re-acquire on tab visibility change
    └── useAlarmAudio.ts       # Web Audio API alarm synthesizer
```

---

## License

MIT
