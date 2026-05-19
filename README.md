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
