# Robot Fleet Manager — PWA Dashboard

A high-end, installable (PWA-only) hardware management dashboard for a robot
device fleet — **"Robot Market"**. React 18 + Tailwind CSS + Ant Design +
Redux Toolkit + Axios + react-i18next (Persian default / English), with
SHA-256 passcode lock and WebAuthn biometric unlock.

> Visual design is matched directly against the provided "Robot Market"
> concept: brand teal `#00A693` on `#f2fffd`, rounded-3xl white cards with
> soft shadows, a fingerprint-first passcode screen with rounded-square
> keys, a teal-line sales chart, and a donut-chart device breakdown. Colors
> live in one place: `tailwind.config.js` → `theme.extend.colors`.

## Quick start

```bash
npm install
cp .env.example .env      # then edit VITE_DEV_MODE / VITE_API_BASE_URL
npm run dev                # http://localhost:5173
```

Because the app is **PWA-only by design**, opening that URL in a normal
browser tab will show the **Install Gate**, not the dashboard. To actually
test the protected flow:

1. `npm run build && npm run preview`
2. Open the preview URL in Chrome/Edge
3. Install it (address-bar install icon, or the InstallGate's instructions)
4. Open the **installed** app — now the Splash → Auth → Hub → Dashboard flow
   runs normally.

(During `npm run dev` you can also temporarily comment out the
`isStandalone === false` check in `src/routes/AppRouter.jsx` to iterate on
UI without reinstalling every time — just remember to revert it.)

## Project structure

```
src/
├── api/                  # Axios instance, mock adapter, per-domain services
│   ├── axiosConfig.js     # ONE place that creates/configures axios + error handling
│   ├── mockAdapter.js      # axios-mock-adapter wiring (dev mode only)
│   ├── mockData.js         # fake dataset returned by the mock adapter
│   └── deviceService.js    # fetchDeviceOverview(), pingDevice() — used by thunks
├── components/
│   ├── auth/NumericKeypad.jsx     # the 6-digit passcode keypad (setup + unlock)
│   ├── common/                    # LanguageSwitcher, ThemeToggle
│   ├── dashboard/                 # StatCard, DeviceStatusBadge
│   └── layout/                    # Sidebar (desktop), MobileDrawer, DashboardLayout
├── hooks/
│   ├── usePWA.js           # standalone-mode detection (the PWA-only gate)
│   ├── useWebAuthn.js      # Face ID / fingerprint register + authenticate
│   └── useDarkMode.js      # syncs Redux darkMode -> <html class="dark">
├── i18n/                   # react-i18next config + fa.json / en.json
├── pages/                  # SplashScreen, InstallGate, AuthPage, MainHub, Dashboard
├── routes/AppRouter.jsx    # Splash -> Gateway -> Auth -> Hub -> Dashboard flow
├── store/
│   ├── store.js
│   └── slices/{authSlice,uiSlice,deviceSlice}.js
└── utils/crypto.js         # SHA-256 hashing (Web Crypto API), no external lib
```

## Core behaviors, at a glance

- **Dual language**: `src/i18n/index.js` defaults to Persian, persists the
  choice to `localStorage`, and flips `<html dir>` between `rtl`/`ltr` — Ant
  Design's `ConfigProvider direction` follows the same flag, so every AntD
  component (Table, Drawer, Dropdown...) mirrors automatically.
- **Dark mode**: `uiSlice.darkMode` (default `false`) is the single source
  of truth; `useDarkMode()` is the *only* place that toggles the `dark`
  class on `<html>`. Every card/sidebar uses Tailwind `dark:` classes.
- **Developer / Mock mode**: set `VITE_DEV_MODE=true` in `.env` (default in
  `.env.example`) and every request through `src/api/axiosConfig.js` is
  answered by `axios-mock-adapter` with the data in `mockData.js` — no real
  device or backend needed to develop the UI. Flip it to `false` once real
  hardware/API is available; no component code changes needed.
- **PWA-only access control**: `App.jsx` calls `useIsStandalone()`
  (checks `matchMedia('(display-mode: standalone)')` + iOS/Android
  fallbacks) and renders `<InstallGate/>` directly instead of mounting
  the router at all when the app isn't running standalone — browsers
  never see anything past that.
- **One-tap install**: `hooks/useInstallPrompt.js` captures the
  browser's native `beforeinstallprompt` event and replays it when the
  user taps "Install App" on `InstallGate`. This only works on
  Chromium-based browsers; Safari/iOS and Firefox fall back to the
  manual "Add to Home Screen" steps shown on the same screen.
- **Passcode security**: the 6-digit code is **never stored in plain
  text** — `utils/crypto.js` hashes it with SHA-256 via the native
  `crypto.subtle` API before it touches `localStorage`. `authSlice.js`
  handles setup, unlock, wrong-attempt counting, and a temporary lockout.
- **Biometric unlock**: `hooks/useWebAuthn.js` wraps
  `navigator.credentials.create/get` for a platform authenticator
  (Face ID / fingerprint / Windows Hello). This is a **local-only** demo
  flow (no backend to verify challenges against) — see the comment at the
  top of that file before using it in a real production auth system.

## Known follow-ups before shipping to production

- Replace the placeholder `public/icons/icon-*.png` with real branded
  app icons (maskable-safe, per the PWA manifest spec).
- Wire `src/api/deviceService.js` to your real device/API endpoints and
  set `VITE_DEV_MODE=false`.
- WebAuthn here has no server-side verification step — fine for a local
  device-lock UX, but don't treat it as remote authentication as-is.
- Add real route guards / RBAC if this dashboard will ever be multi-user.
