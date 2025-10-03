# portfolio

A small single-page / multi-route portfolio with 3D styling (CSS transforms + JS), four pages, and a working contact form.

## Stack
- Vite + React (JS)
- CSS (3D transforms) — optional Tailwind not required
- React Router
- Static deploy (Vercel / Netlify / GitHub Pages)

## Features
- Home/About with short bio and scroll parallax
- Skills with accessible semicircle progress (animated on-scroll)
- Projects gallery with 3D tilt/shine and subtle parallax
- Contact form (client-side validation + toast). **Default sends via Formspree** to your Gmail (after setup). Optional serverless function provided for Vercel + Resend.
- Accessibility: semantic HTML, aria labels, color contrast, keyboard focus, `prefers-reduced-motion` respected
- Responsive, mobile‑first

## Quickstart

```bash
# 1) download and install deps
npm install
# 2) dev
npm run dev
# 3) build
npm run build
```

## Contact form (Formspree — recommended for static hosting)
1. Create a form at https://formspree.io (free tier is fine).
2. You’ll get an endpoint like `https://formspree.io/f/abcdwxyz`.
3. In `src/pages/Contact.jsx`, replace:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/your_form_id'
   ```
   with your endpoint URL.
4. Submit once from the site, then confirm your email to enable forwarding to **Gmail**.
5. (Optional) Add honeypot or a basic captcha in Formspree settings for spam reduction.

> This avoids exposing SMTP credentials and works on any static host.

## Optional: Serverless mail relay (Vercel + Resend)
If you prefer owning the email flow:
1. `npm i resend`
2. In Vercel project settings, set env vars:
   - `RESEND_API_KEY` (from https://resend.com/)
   - `TO_EMAIL` (your Gmail)
3. Deploy. The function lives at `/api/contact`. Update `src/pages/Contact.jsx` to POST there instead of Formspree.

## Deploy

### Vercel
- Push to GitHub as `portfolio` repo.
- Import into Vercel → Framework: **Vite**.
- Add `vercel.json` (already included) for SPA routing.

### Netlify
- Connect the repo.
- Build command: `npm run build`, Publish: `dist`
- `netlify.toml` (SPA redirects) already included.

### GitHub Pages
- `npm run build`
- Push `dist` to `gh-pages` branch (use `vite` guide).
- Enable Pages for `gh-pages` branch.
- You may need a 404 → index.html fallback (GH Pages SPA caveat).

## Analytics (privacy‑minded)
Pick one and paste the script in `index.html`, or use a custom domain:
- Plausible, Umami, or GoatCounter

## Auto‑deploy
- Vercel / Netlify auto‑deploys on git push by default. For GitHub Pages, set up a GitHub Action:
```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
```

## Accessibility
- All interactive tiles are keyboard focusable
- Progress indicators expose labels via `<title>` and container `aria-label`
- Reduced motion respected (`prefers-reduced-motion`)

## Notes
- Replace copy (name, bio, links) in `Home.jsx` & `Projects.jsx`.
- Add real project links or images.
- The 3D effects gracefully degrade when reduced motion is enabled.

---

MIT © You
