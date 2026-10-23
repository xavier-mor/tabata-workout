# Tabata

A hand-drawn Tabata interval timer. Pick exercises by body part, set your own work / rest / rounds, and follow the animated figure.

![icon](public/icon-192.png)

- **34 exercises** across Legs, Upper body, Core, Cardio and Park (bar-park moves: rows, dips, hangs, knee raises, bench sit-ups), each drawn as a two-frame stick-figure loop on a boiling ink line.
- **Beginner plans** for an outdoor bar park — Pull, Push, Legs & core, plus a week-4 test — one tap to load.
- **Proper Tabata structure** — a block is one exercise held for every round. Classic is 20s on / 10s off × 8 = 4:00.
- **Adjustable intervals** — work 10–60s, rest 5–60s, 4–12 rounds, up to 6 blocks.
- **Screen Wake Lock** so the phone doesn't sleep mid-workout.
- **Cue beeps** built to cut through music, with a volume control and vibration on Android.
- Installable as a PWA.

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Railway

1. Push this repo to GitHub (see below).
2. In Railway: **New Project → Deploy from GitHub repo** and pick it.
3. Railway reads `railway.json`: Nixpacks runs `npm run build`, then `npm start` serves `dist/` on `$PORT`.
4. **Settings → Networking → Generate Domain** to get a `*.up.railway.app` URL.

### Custom domain

1. **Settings → Networking → Custom Domain**, enter e.g. `tabata.yourdomain.com`.
2. Railway gives you a CNAME target. Add it at your DNS provider.
   - Subdomain → `CNAME` to the target Railway shows.
   - Apex/root → use ALIAS/ANAME, or Cloudflare with the record proxied.
3. TLS is issued automatically once DNS resolves. Wake Lock needs HTTPS, so wait for the certificate before testing on a phone.

## Stack

Vite + React 18. No CSS framework, no UI library — all styling is inline, all illustration is inline SVG. `serve` handles static hosting in production as a single dependency.

## Licence

MIT
