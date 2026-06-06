# No More Sleeping In 🔔

> A PWA that prevents dozing off after your alarm. Place your phone on the bed — if you roll over, it sounds a loud alarm.

## Features

- ⏱️ **Timer Presets** — 5 / 15 / 20 / 30 / 45 / 60 minutes
- 📡 **Motion Monitoring** — Real-time gyroscope/accelerometer via `DeviceMotionEvent`
- 🚨 **Alarm** — Harsh multi-oscillator synthesized tone + full-screen red alert
- 🔒 **Wake Lock** — Screen stays on using the Wake Lock API
- 🏆 **Success Screen** — Shown when timer expires without triggering the alarm
- 📱 **PWA** — Installable on iOS and Android home screens

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS v3
- `vite-plugin-pwa` (Workbox)
- Web Audio API (no audio files required)
- Wake Lock API

## Getting Started

```bash
npm install
npm run dev
```

Then open on your phone (must be HTTPS or localhost for sensor + Wake Lock access).

## iOS Notes

- Safari on iOS 13+ requires a user gesture to request `DeviceMotionEvent` permission — this is handled automatically on the "Start" button press.
- Install via **Share → Add to Home Screen** for the best PWA experience.

## Deployment

```bash
npm run build
```

Upload the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages) with HTTPS.

## License

MIT
