# روبات مارکت — لانچر

اپلیکیشن وب نصب‌شدنی (PWA) و سبک برای دسترسی سریع به:

- پنل آنلاین: `https://panel.my-rm.com/`
- رابط محلی دستگاه: `http://192.168.4.1/` (قابل تغییر در تنظیمات)

## نصب و اجرا

```bash
npm install
npm run dev
```

برای build نسخه‌ی production:

```bash
npm run build
npm run preview
```

## نکات فنی

- React + Vite + JavaScript (بدون TypeScript)
- Tailwind CSS برای استایل‌دهی
- `vite-plugin-pwa` برای manifest و service worker
- چیدمان کاملاً RTL و فونت Vazirmatn
- آدرس IP دستگاه محلی در `localStorage` ذخیره می‌شود

## آیکون‌ها

آیکون‌های placeholder در مسیر `public/icons/` با رنگ برند (`#00A693`) ساخته شده‌اند
(`icon-192.png`, `icon-512.png` و نسخه‌های `maskable`). پیشنهاد می‌شود پیش از انتشار
نهایی، این فایل‌ها را با لوگوی رسمی روبات مارکت جایگزین کنید.

## ساختار پروژه

```
src/
  App.jsx
  main.jsx
  index.css
  components/
    Header.jsx
    ActionCard.jsx
    InstallButton.jsx
    LocalDeviceForm.jsx
    HelpBox.jsx
  hooks/
    useInstallPrompt.js
  utils/
    deviceStorage.js
public/
  icons/
```
