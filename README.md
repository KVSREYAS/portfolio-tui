# Portfolio TUI

Terminal-style portfolio frontend with a Flask backend for the VK Twin chat API.

## Structure

- `frontend/` - Vite + TypeScript portfolio UI
- `backend/` - Flask + LangChain Groq chat API

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

For production (frontend and backend on different hosts), set the backend URL before build:

```powershell
Copy-Item .env.example .env
# Edit .env: VITE_API_URL=https://your-backend.up.railway.app
npm run build
npm run start
```

On Railway, add `VITE_API_URL` to the **frontend** service variables (build-time). Set `FRONTEND_URL` on the **backend** to your frontend’s public URL for CORS.

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python app.py
```

Set your Groq key in `backend/.env` before starting the backend.
