# Robot Market Launcher

A modern, installable, **bilingual (Persian / English)** Progressive Web App
that launches the Robot Market Website, the Online Management Panel, and a
locally-configurable Offline Vending Machine Manager.

## Feature highlights

- 🌐 **Bilingual UI** — Persian (default, RTL) and English (LTR). Switch
  instantly from the header or Settings; the whole UI (text direction, Ant
  Design component mirroring, fonts, date/time formatting) updates live.
- 🎨 **Fixed brand color** — `#00a693` is used as the single accent color
  across every screen via Ant Design's theme tokens, alongside a Light/Dark
  mode switch.
- 🕒 **Live clock** — updates every second; shows the Persian (Jalali)
  calendar with Persian digits when the app is in Farsi, and a standard
  Gregorian clock in English.
- 📶 **Online/offline indicator** — a live badge in the header reflects the
  browser's network status in real time.
- 🏷️ **Brand identity** — the app logo/name appears in the header and on the
  About page.
- 📲 **In-app install option** — besides the one-time automatic prompt, an
  "Install app" button stays available in the header and in Settings for as
  long as the PWA isn't installed yet, so the user can trigger installation
  on demand.
- ⚙️ **Settings drawer** — offline device URL, install action, language, and
  theme mode, all in one place.

## Stack

- React 18 (JavaScript, no TypeScript)
- Vite 5
- Tailwind CSS (layout/spacing utilities only)
- Ant Design 5 (all UI components)
- React Router 6
- `vite-plugin-pwa` (Workbox-based service worker + manifest generation)

## Project structure

```
robot-market-launcher/
├── public/
│   └── icons/              # Generated app icons (all required sizes + maskable)
├── src/
│   ├── components/
│   │   ├── AppCard.jsx
│   │   ├── AppHeader.jsx
│   │   ├── Brand.jsx              # Logo + app name
│   │   ├── ConnectionBadge.jsx    # Online/offline indicator
│   │   ├── InstallPromptModal.jsx
│   │   ├── LiveClock.jsx          # Live, locale-aware clock
│   │   └── SettingsDrawer.jsx     # General + Appearance settings
│   ├── hooks/
│   │   ├── useInstallPrompt.js       # beforeinstallprompt / standalone detection
│   │   ├── useLanguage.js            # fa/en + translator `t()` + text direction
│   │   ├── useLocalStorageState.js   # generic reactive LocalStorage state (no Context API)
│   │   ├── useOnlineStatus.js        # navigator.onLine + online/offline events
│   │   └── useThemeMode.js           # light/dark mode
│   ├── i18n/
│   │   └── translations.js       # Persian + English dictionaries
│   ├── pages/
│   │   ├── About.jsx
│   │   └── Home.jsx
│   ├── utils/
│   │   └── storage.js            # LocalStorage helpers (all keys in one place)
│   ├── App.jsx
│   ├── main.jsx
│   ├── theme.js                  # Fixed brand color (#00a693)
│   └── index.css
├── index.html
├── vite.config.js                # VitePWA manifest + Workbox config
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

No Context API, no Redux, no Axios. Global settings (language, theme mode,
accent color) are shared across components with a small custom hook
(`useLocalStorageState`) that reads/writes LocalStorage and re-syncs every
subscriber via a `CustomEvent` (same tab) and the native `storage` event
(other tabs) — no provider tree required.

## LocalStorage keys

| Key                                | Purpose                                                           |
|-------------------------------------|---------------------------------------------------------------------|
| `offline_url`                      | User-editable URL for the "Offline Vending Machine Manager" card    |
| `install_prompt_dismissed_until`   | Timestamp; install modal is hidden until this time ("Later")        |
| `app_installed`                    | Set once `appinstalled` fires, so the modal never returns           |
| `app_lang`                         | `fa` (default) or `en`                                              |
| `app_theme_mode`                   | `light` (default) or `dark`                                         |

## Install prompt behavior

1. On load, the app checks `window.matchMedia('(display-mode: standalone)')`
   and iOS's `navigator.standalone`, plus the `app_installed` flag.
2. If already installed → nothing happens.
3. If not installed and the browser fires `beforeinstallprompt`, the default
   mini-infobar is suppressed (`event.preventDefault()`) and a custom Ant
   Design modal is shown (unless the 7-day "Later" snooze is still active).
4. **Install** replays the captured event via `prompt()`; on success the
   modal closes and `app_installed` is stored so it never reappears.
5. **Later** closes the modal and stores `install_prompt_dismissed_until =
   now + 7 days`.
6. Browsers that never fire `beforeinstallprompt` (e.g. desktop/iOS Safari)
   simply never show the modal — iOS users install via the native
   Share → "Add to Home Screen" flow, which this app supports via the
   `apple-mobile-web-app-*` meta tags and `apple-touch-icon` links in
   `index.html`.

## Local development

```bash
npm install
npm run dev
```

This starts Vite's dev server (default `http://localhost:5173`). The service
worker is also enabled in dev (`devOptions.enabled: true`) so you can test
install/offline behavior without doing a full build.

## Production build

```bash
npm run build
```

Output is written to `dist/`. This generates:

- `dist/manifest.webmanifest` — the Web App Manifest
- `dist/sw.js` + `dist/workbox-*.js` — the generated service worker (precaches
  the app shell for offline use, and uses cache-first for images)
- Hashed, chunked JS/CSS (React/Router split from Ant Design for smaller
  initial loads)

Preview the production build locally before deploying:

```bash
npm run preview
```

## Deploying to `https://app.my-rm.com`

The app is a static build, so any static host works. Two common paths:

### Option A — Static file hosting (Nginx / Apache / any static host)

1. Build the app:
   ```bash
   npm install
   npm run build
   ```
2. Upload the **contents** of `dist/` to the web root served at
   `https://app.my-rm.com` (e.g. via `scp`, `rsync`, or your host's deploy
   tool):
   ```bash
   rsync -avz --delete dist/ user@your-server:/var/www/app.my-rm.com/
   ```
3. **HTTPS is required** for service workers/installability — make sure
   `app.my-rm.com` is served over TLS (e.g. via Let's Encrypt/Certbot, or
   your host's managed certificates).
4. Configure the server to fall back to `index.html` for unknown paths, so
   client-side routing (`/about`) works on refresh/direct link. Example for
   Nginx:
   ```nginx
   server {
     listen 443 ssl;
     server_name app.my-rm.com;

     root /var/www/app.my-rm.com;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     # Service worker must never be cached long-term
     location = /sw.js {
       add_header Cache-Control "no-cache";
     }
   }
   ```
5. Reload Nginx (`sudo nginx -s reload`) and visit `https://app.my-rm.com`.

### Option B — Static hosting platforms (Vercel / Netlify / Cloudflare Pages / S3+CloudFront)

1. Connect the repository, or upload the project.
2. Build command: `npm run build`
3. Output/publish directory: `dist`
4. Add a SPA rewrite rule (all paths → `/index.html`) — most of these
   platforms provide this out of the box or via a `_redirects` /
   `vercel.json` rewrite rule.
5. Point the `app.my-rm.com` DNS record (CNAME) at the platform, and enable
   HTTPS (usually automatic).

### Post-deploy checklist

- [ ] Site loads over `https://` (not `http://`) — required for install
      prompts and service workers.
- [ ] Open DevTools → Application → Manifest: confirm it loads with no
      errors and shows all icon sizes.
- [ ] Open DevTools → Application → Service Workers: confirm `sw.js` is
      registered and activated.
- [ ] Test "Add to Home Screen" on an Android device (Chrome) and an iOS
      device (Safari → Share → Add to Home Screen).
- [ ] Test the desktop install icon in Chrome/Edge's address bar.
- [ ] Turn off network in DevTools and reload — the app shell should still
      load (offline support).
- [ ] Open Settings, change the Offline Device URL, save, and confirm the
      "Offline Vending Machine Manager" card's Open button uses the new URL
      (check `localStorage.getItem('offline_url')`).
