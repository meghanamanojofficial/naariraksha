# NariRaksha × She Builds Tech 3.0: chat log (part 3, frontend redesign)

**Team:** Janet Jiju, Meghana Manoj, Hestia Rose, Joseweena Jose
**Track:** AI in Social Impact
**Event:** She Builds Tech 3.0 (KSUM), 20-hour AI Hackathon, Oct 16–17, 2026, KSUM Kalamassery
**Date of chat:** Oct 16–17, 2026
**Follows:** `nariraksha_hackathon_chat_2.md`
**Covers:** the frontend redesign, merging it into `main`, and deploying to Vercel and Render

---

## 1. Request: integrate the new frontend design into the repo

> The fully completed idea has already been pushed to GitHub. Integrate this frontend into the GitHub code; use the look and feel from frontend.zip. Maintain data consistency and logics defined in the repo. I have also attached the md file of the chat I used for building everything that is in the repo.

**Attachments:** `frontend.zip`, `nariraksha_hackathon_chat_2.md`

### What was in `frontend.zip`

- `codes/sanctuary_glass/DESIGN.md`: the "Sanctuary Glass" design system:
  - rose/crimson colours
  - frosted-glass cards
  - DM Sans and Noto Sans Malayalam fonts
  - rounded shapes
  - red reserved for emergencies only
- 19 mockup frames, each with `code.html` and `screen.png`:
  1. Landing hero
  2. AI pop-up
  3. Get help chat
  4. Know your rights, plus a crime case file
  5. Helplines
  6. Draft complaint
  7. Free legal aid
  8. Support modal
  9. Frames 10–17, for features that aren't in the repo (shelter directory, evidence locker, POSH navigator, Malayalam, protection-order wizard, cyber takedown navigator, custody calculator, court tracker)
  10. Client portal
  11. Client login
- `picturedemo/`: phone screenshots of the same designs.

### Approach

- Keep every API call, request field and piece of session logic from the repo. Change only how things look.
- Don't build mockup features that have no data or logic in the repo (frames 10–17). Building them would mean inventing content.
- Don't copy placeholder contact details from the mockups. The support modal showed a fake email and the number "+91 12345 67890".

### Response: what was built

**Design system (`frontend/src/app/globals.css`)**

- Tailwind v4 `@theme` tokens taken from `DESIGN.md`.
- Reusable classes:
  - `.glass` and `.glass-strong`: frosted panels
  - `.btn-primary`, `.btn-glass` and `.btn-sos`: buttons
  - `.field` and `.label`: form inputs
  - `.chip`, `.chip-warn`, `.chip-info` and `.chip-ok`: status chips
  - `.eyebrow` and `.icon-badge`: small headings and icon badges
  - custom checkbox styles
- Soft rose background glows, gentle float and pulse animations (switched off when the user prefers reduced motion), and print styles so only the complaint letter prints.
- Fonts load through `next/font`: DM Sans, plus Noto Sans Malayalam.
- Icons come from `lucide-react`, the only new dependency. It was already in the planned tech stack.

**New shared pieces**

- `components/SiteHeader.tsx`: gear button that opens the safety card, logo ("NariRaksha · Kerala Legal Shield"), full navigation with the active page highlighted, EN/മലയാളം switch, Quick exit button, and a menu button on phones.
- `components/SafetyCard.tsx`: explains privacy and Quick exit, and lists only real numbers from `authorities.json` (112, 181, 1930, 15100).
- `lib/language.tsx`: the chosen language, kept in `sessionStorage`, so Quick exit clears it too. It sets the language for chat replies, voice input and complaint drafts. Page text stays in English.
- Footer: "Dial 112" and "15100 free lawyer (NALSA)" cards, plus the disclaimer.
- `components/ui.tsx`, restyled with the same exports:
  - `Card` now takes an optional icon, badge and subtitle.
  - `LawItem` shows the citation, "Most relevant", cognizable and bailable as chips.
  - `AuthorityItem` shows a Dial button.
  - `LegalAidItem` shows Verified, Free, Demo data and Unverified labels.
  - `PageHeader` and `Bullets` (with check icons) are new.

**Pages**

| Page | Mockup | Notes |
|---|---|---|
| `/` | Frame 1 + frame 2 | Crimson hero with Lady Justice, Safety flashcard and Clients buttons, "Get Help" pop-up with "Please ask". Below it: an emergency strip and the existing link cards. The "backend not reachable" notice is kept. |
| `/help` | Frame 3 | Fold-away intake panel. Big red "Call 112" banner when "I am in danger" is ticked. Suggested starting points. Chat bubbles with avatars. Offline badge and follow-up questions. Input box with mic, Clear and Send. Then the "Legal breakdown" section: next steps, key laws with the rest collapsed, evidence, documents, who can help, free legal aid. The `nr_case` hand-off to the complaint page is unchanged. |
| `/crimes` | Frame 4 | Search box, category filter pills, a "Zero FIR" fact card (BNSS 173, formerly CrPC 154; BNSS 175(3) if police refuse), and numbered sections by category. |
| `/crimes/[slug]` | Frame 4b | Quick facts worked out only from library data (cognizable, bailable, number of laws), a "which law applies" banner, law cards, evidence and documents with check icons, a grid of who can help, and action buttons. |
| `/directory` | Frame 5 | District and service-type filters. 112 and 181 as large cards. Everything else as rows with Dial buttons. A note about phone call logs, next to a Quick exit button. |
| `/complaint` | Frame 6 | "Draft in English / Malayalam" switch, the same fields, a paper-style editable letter, a count of placeholders left, Copy, Word (.docx), and Print/PDF (new). |
| `/legal-aid` | Frame 7 | 15100 banner, district filter, legal-aid cards with labels. "Request callback" scrolls to the consent form. The form has no "nature of assistance" box, because the repo never stores the victim's story. |
| `/products` | n/a | Same plans and prices, glass style. |
| `/clients`, `/clients/login`, `/clients/register`, `/clients/dashboard` | Frames 18–19 | Portal with Log in and Register cards plus plan tiers. Login adds show/hide password. Register and dashboard restyled. Logic unchanged. |

**Changed for accuracy**

- "KSLSA 15100" became "NALSA 15100". 15100 is the national helpline, and Kerala's authority is KELSA.
- The statue image in the mockups was hotlinked from a Google image host the build machine couldn't reach. It was cut out of the hero screenshot with a transparent background and saved as `frontend/public/lady-justice.png`. Replace it with the original file if you have it.

**Testing**

- `tsc --noEmit`, `eslint` and `next build` all pass.
- The backend (offline mode, no Gemini key) and frontend ran together. Screenshots of every page were checked at desktop (1280px) and phone (390px) widths, including a full chat → results → complaint run. No browser errors.
- Fixed during testing: the navigation wrapped onto two lines at 1280px, the placeholder counter wording, and the layout of the emergency strip on phones.

**Commit:** `Sanctuary Glass redesign: apply frontend.zip look and feel to every page`, pushed to branch `claude/gracious-feynman-82390j`.

---

## 2. Question: where do I check this?

### Response

The changes were on a separate branch, not on `main` yet.

- Branch: https://github.com/meghanamanojofficial/naariraksha/tree/claude/gracious-feynman-82390j
- Changes compared to `main`: https://github.com/meghanamanojofficial/naariraksha/compare/main...claude/gracious-feynman-82390j

To run it locally:

```bash
git fetch origin
git checkout claude/gracious-feynman-82390j

# backend (terminal 1)
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8001

# frontend (terminal 2)
cd frontend
npm install        # once, for lucide-react
npm run dev
```

Open http://localhost:3000. Run `git checkout main` to go back to the old version.

---

## 3. Problem: "Backend not reachable. Is it running? Check NEXT_PUBLIC_API_URL."

The redesign showed up correctly, but the yellow banner appeared on the home page.

### Response

The redesign didn't cause this. The browser couldn't reach the backend. Check in order:

1. **The backend isn't running.** Start it in its own terminal on port 8001. Check http://localhost:8001/health, which should return `{"ok":true,...}`.
2. **`frontend/.env.local` is missing.** Without it, `lib/api.ts` falls back to port **8000**, but the backend runs on **8001**. Run `cp .env.local.example .env.local`, then **restart** `npm run dev`. Next.js only reads env files at startup.
3. **CORS.** The backend only allows `http://localhost:3000`. Opening `127.0.0.1:3000`, or port 3001 when 3000 is busy, gets blocked. Use exactly http://localhost:3000, or add the other address to `CORS_ORIGINS` in `backend/.env`.

If it still fails: press F12 → Console → refresh, and read the red error.

Optional fix offered: change the fallback in `api.ts` from 8000 to 8001, so a missing `.env.local` can't cause this.

---

## 4. Everything working: put it into the repo

> Okay everything is working, let's put it into the repo.

### Response

- Opened pull request [meghanamanojofficial/naariraksha#1](https://github.com/meghanamanojofficial/naariraksha/pull/1) from `claude/gracious-feynman-82390j` to `main`, and merged it.
- `main` was unchanged since the branch was made, so there were no conflicts.

Teammates then run:

```bash
git checkout main
git pull
cd frontend && npm install     # once, for lucide-react
```

Make sure `frontend/.env.local` exists (copy it from `.env.local.example`).

---

## 5. Request: convert this chat into an md file

Created `nariraksha_hackathon_chat_3.md` (an earlier version of this file).

- A repo check flagged the new file as uncommitted. It was committed to `claude/gracious-feynman-82390j`.
- PR #1 was already merged, so the branch was first restarted from the latest `main`.

---

## 6. Request: let's deploy this

> Okay let's deploy this.

### Response

Claude can't log into Vercel or Render, so it prepared the repo and wrote out the steps. The plan follows the tech stack chosen in part 2: **Vercel** for the frontend and **Render** for the backend.

**Added to the repo:**

- `render.yaml`: a Render "Blueprint" that sets up the backend automatically:
  - service `nariraksha-api`, free plan, `rootDir: backend`
  - build: `pip install -r requirements.txt`
  - start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - health check at `/health`, Python 3.12.7
  - `SECRET_KEY` generated automatically
  - `GEMINI_API_KEY`, `CORS_ORIGINS` and `DATABASE_URL` filled in on the Render dashboard
- A "Deploying" section in `README.md`.
- `frontend/src/lib/api.ts`: the fallback backend address is now port **8001**, not 8000, so a missing `.env.local` no longer breaks local runs.

Merged into `main` as [meghanamanojofficial/naariraksha#2](https://github.com/meghanamanojofficial/naariraksha/pull/2), together with this chat log.

**Deployment steps**

1. **Backend on Render**
   - New → Blueprint → choose the `naariraksha` repo.
   - Paste `GEMINI_API_KEY`. Leave `CORS_ORIGINS` and `DATABASE_URL` empty for now.
   - Copy the service URL and check `<URL>/health`.
2. **Frontend on Vercel**
   - Add New → Project → import the repo.
   - Set **Root Directory** to `frontend`.
   - Add the environment variable `NEXT_PUBLIC_API_URL` = the Render URL, with no trailing `/`.
   - Deploy.
3. **Connect them**
   - In Render, set `CORS_ORIGINS` to the Vercel URL, with no trailing `/`.

**Things to know**

- **The free backend sleeps.** Render's free plan sleeps after 15 minutes idle, and the first request then takes about a minute. Open the site a few minutes before the demo.
- **Some data resets.** Without `DATABASE_URL`, the backend uses SQLite on Render's temporary disk. Legal content reloads on every start, but client registrations and callback requests are lost on restart. For persistence, use a Supabase `postgresql+psycopg://...` URL.
- **Redeploy after changing the API URL.** `NEXT_PUBLIC_API_URL` is baked in when the site is built, so changing it needs a Vercel redeploy.

---

## 7. Problem: the Vercel build failed

The build log stopped after `> next build` with a red error marker. The log had also flagged:

```
npm warn deprecated next@15.5.4: This version has a security vulnerability
```

### Response

The likely cause: Vercel refuses to deploy Next.js versions with known security holes.

- Upgraded to the patched releases in the same series:
  - `next` 15.5.4 → **15.5.28**
  - `react` / `react-dom` 19.1.0 → **19.1.10**
  - `eslint-config-next` 15.5.4 → **15.5.28**
- Versions stay pinned exactly, as before. No app code changed.
- `tsc`, `eslint` and `next build` passed.
- Merged into `main` as [meghanamanojofficial/naariraksha#3](https://github.com/meghanamanojofficial/naariraksha/pull/3).
- Teammates: `git pull`, then `npm install` in `frontend/`.

---

## 8. Problem: the live site says "Backend not reachable"

The Vercel build succeeded. **https://naariraksha.vercel.app** loads with the new design, but shows the yellow "Backend not reachable" banner.

### Response

The frontend is live, but it can't reach the Render backend. Claude's sandbox couldn't reach Vercel or Render to check, so here is the checklist:

1. **Is the backend up?**
   - Open `<Render URL>/health`. It should return `{"ok":true,...}`; the first load can take about a minute.
   - If the Render deploy failed, check Render's **Logs**.
2. **Does Vercel know the backend's address?** This is the most likely cause.
   - Vercel → `naariraksha` → Settings → Environment Variables → `NEXT_PUBLIC_API_URL` = the Render URL (`https://...onrender.com`, no trailing `/`, no `/health`).
   - Then **Redeploy**. Without this variable, the live site looks for `localhost:8001` on the visitor's own computer.
3. **Does Render allow the Vercel site (CORS)?**
   - Render → `nariraksha-api` → Environment → `CORS_ORIGINS` = `https://naariraksha.vercel.app`.
   - Watch the spelling: the Vercel site is **naa**riraksha (two a's), the Render service is **na**riraksha (one a).

**To tell which one it is:** press F12 → Console → refresh.
- `localhost:8001` in the error → step 2.
- "blocked by CORS policy" → step 3.

---

## 9. Request: turn this whole chat into an md file

Updated this file with sections 5–9.

---

## Files added or changed in this part

**Redesign (PR #1)**

- **New:**
  - `frontend/public/lady-justice.png`
  - `frontend/src/components/SiteHeader.tsx`
  - `frontend/src/components/SafetyCard.tsx`
  - `frontend/src/lib/language.tsx`
- **Changed:**
  - `frontend/package.json` and `package-lock.json`: added `lucide-react`
  - `globals.css` and `layout.tsx`
  - every page under `frontend/src/app/`
  - `ui.tsx`, `QuickExit.tsx`, `VoiceInput.tsx`, `SpeakButton.tsx` and `ProductPicker.tsx`

**Deployment (PR #2)**

- `render.yaml` (new)
- `README.md`: Deploying section
- `frontend/src/lib/api.ts`: fallback port changed to 8001
- `nariraksha_hackathon_chat_3.md`

**Security upgrade (PR #3)**

- `frontend/package.json` and `package-lock.json`: Next.js 15.5.28, React 19.1.10

**Unchanged throughout:** the backend application code, `lib/clients.ts` and `lib/products.ts`.

## Pull requests

| PR | What | Status |
|---|---|---|
| [#1](https://github.com/meghanamanojofficial/naariraksha/pull/1) | Sanctuary Glass redesign | Merged |
| [#2](https://github.com/meghanamanojofficial/naariraksha/pull/2) | Deployment setup + chat log part 3 | Merged |
| [#3](https://github.com/meghanamanojofficial/naariraksha/pull/3) | Next.js / React security upgrade | Merged |
