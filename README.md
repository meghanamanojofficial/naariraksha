# NariRaksha

```
frontend/   Next.js 15 + TypeScript + Tailwind   → http://localhost:3000
backend/    FastAPI (Python)                     → http://localhost:8000/docs
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
uvicorn app.main:app --reload --port 8000
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

## Git workflow
```bash
git pull
git checkout -b feat/<name>
git add . && git commit -m "message"
git push -u origin feat/<name>     # open a Pull Request into main
```
Never commit `.env` or `.env.local`.
