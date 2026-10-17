# NariRaksha

```
frontend/   Next.js 15 + TypeScript + Tailwind   → http://localhost:3000
backend/    FastAPI (Python)                     → http://localhost:8001/docs
```

## Prerequisites
Git, Node.js 20/22 LTS, Python 3.10–3.13, VS Code, Chrome.

## Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # add your GEMINI_API_KEY
uvicorn app.main:app --reload --port 8001
```

## Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL must match the backend port
npm run dev
```

Open http://localhost:3000. It should say **Backend: connected ✅**.

If you change the backend port, update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.
If you change the frontend port, update `CORS_ORIGINS` in `backend/.env`.

## What's built

| Page | What it does | API |
|---|---|---|
| `/help` | Intake (date, district, under-18, danger) + chat → crimes, laws, evidence, documents, authorities, legal aid | `POST /api/chat` |
| `/crimes`, `/crimes/[slug]` | Know-your-rights pages | `GET /api/crimes`, `/api/crimes/{slug}` |
| `/complaint` | Formal complaint for police / magistrate / Protection Officer / POSH / cyber → Word file | `POST /api/complaint`, `/api/complaint/docx` |
| `/directory` | National, Kerala and district helplines | `GET /api/authorities` |
| `/legal-aid` | Free legal aid + consent-based callback request | `GET /api/legal-aid`, `POST /api/callback` |

**How the AI is used:** Gemini only (1) classifies the story into one of our crime categories and (2) writes the plain-language reply.
Every law, phone number and checklist comes from the database. Old IPC/CrPC/Evidence Act sections are shown for incidents before 1 July 2024.
Without `GEMINI_API_KEY` the app runs in offline keyword mode.

## Editing the legal content

All content lives in `backend/app/seed_data/`:

* `laws.json`: every section, with its old IPC/CrPC/IEA equivalent
* `crimes.json`: crime pages, keywords, evidence and document checklists, which laws and authority types apply
* `authorities.json`: helplines and offices (`level`: national / state / district). Set `verified: true` only after checking
* `legal_aid.json`: legal-aid providers (`demo: true` = sample listing, shown with a badge)

After editing, reload the database:

```bash
cd backend && python -m app.seed --reset
```

The database is a local SQLite file (`backend/nariraksha.db`) by default. To share one database with the team, create a free Supabase project and set `DATABASE_URL` in `backend/.env`.

## Git workflow
```bash
git pull
git checkout -b feat/<name>
git add . && git commit -m "message"
git push -u origin feat/<name>     # open a Pull Request into main
```
Never commit `.env` or `.env.local`.

## Deploying

Backend on **Render**, frontend on **Vercel**. Both are free.

1. **Backend (Render):** Dashboard → **New → Blueprint** → choose this repo. `render.yaml` sets everything up.
   Fill in `GEMINI_API_KEY`. Leave `CORS_ORIGINS` for now. Deploy, then copy the URL (e.g. `https://nariraksha-api.onrender.com`).
   Check `<that URL>/health`.
2. **Frontend (Vercel):** **Add New → Project** → import this repo → set **Root Directory** to `frontend`.
   Add the environment variable `NEXT_PUBLIC_API_URL` = the Render URL (no trailing slash). Deploy.
3. **Connect them:** in Render, set `CORS_ORIGINS` to your Vercel URL (e.g. `https://nariraksha.vercel.app`, no trailing slash). Save; Render restarts.

Notes:
* The Render free plan sleeps after 15 minutes idle; the first request then takes about a minute. Open the site a few minutes before a demo.
* Without `DATABASE_URL`, the backend uses SQLite on Render's temporary disk. Legal content reloads on every start, but client registrations and callback requests are lost on restart. For persistence, set `DATABASE_URL` to a Supabase URL in the form `postgresql+psycopg://...`.
* Changing `NEXT_PUBLIC_API_URL` needs a Vercel redeploy, because it is built into the frontend.
