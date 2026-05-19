import os
from typing import Any
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from context_router import build_system_prompt

BASE_DIR = Path(__file__).resolve().parent
SOUL_PATH = BASE_DIR / "soul.md"
load_dotenv(BASE_DIR / ".env")

MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
MAX_MESSAGE_CHARS = 2_000
MAX_HISTORY_TURNS = 15


def load_soul() -> str:
    try:
        return SOUL_PATH.read_text(encoding="utf-8").strip()
    except OSError:
        return (
            "You are VK, Venkatakrishnan K V's digital twin. "
            "Speak in singular first person. Be cocky and competitive — flex games and challenges, "
            "not your career unless asked."
        )


SOUL = load_soul()


def parse_history(raw_history: object) -> list[HumanMessage | AIMessage]:
    if not isinstance(raw_history, list):
        return []

    messages: list[HumanMessage | AIMessage] = []
    for item in raw_history[-MAX_HISTORY_TURNS * 2 :]:
        if not isinstance(item, dict):
            continue

        role = str(item.get("role", "")).strip().lower()
        content = str(item.get("content", "")).strip()
        if not content or len(content) > MAX_MESSAGE_CHARS:
            continue

        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    return messages


def get_allowed_origins() -> list[str]:
    """Origins that may call /api/* (browser CORS). Includes local dev + FRONTEND_URL."""
    origins: list[str] = []
    seen: set[str] = set()

    def add(origin: str) -> None:
        o = origin.strip().rstrip("/")
        if o and o not in seen:
            seen.add(o)
            origins.append(o)

    for part in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:4173",
    ).split(","):
        add(part)

    add(os.getenv("FRONTEND_URL", ""))

    return origins


def create_app() -> Flask:
    app = Flask(__name__)

    CORS(app, resources={r"/api/*": {"origins": get_allowed_origins()}})

    @app.get("/api/health")
    def health() -> tuple[dict[str, str], int]:
        return {"status": "ok", "model": MODEL_NAME}, 200

    @app.post("/api/chat")
    def chat() -> tuple[Any, int]:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return jsonify({"error": "GROQ_API_KEY is not configured."}), 500

        data = request.get_json(silent=True) or {}
        message = str(data.get("message", "")).strip()
        if not message:
            return jsonify({"error": "Message is required."}), 400
        if len(message) > MAX_MESSAGE_CHARS:
            return jsonify({"error": f"Message must be under {MAX_MESSAGE_CHARS} characters."}), 400

        history = parse_history(data.get("history"))
        system_prompt = build_system_prompt(SOUL, message, data.get("history"))

        llm = ChatGroq(
            api_key=api_key,
            model=MODEL_NAME,
            temperature=0.55,
            max_tokens=700,
        )
        response = llm.invoke(
            [
                SystemMessage(content=system_prompt),
                *history,
                HumanMessage(content=message),
            ]
        )

        return jsonify({"reply": response.content}), 200

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("FLASK_PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
