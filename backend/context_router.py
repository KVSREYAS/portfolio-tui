from __future__ import annotations

import re
from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).resolve().parent / "knowledge"

# Always sent — tiny identity slice.
CORE_SECTION = "core"

# Keyword routing is enough at this scale; no vector DB needed.
SECTION_KEYWORDS: dict[str, tuple[str, ...]] = {
    "education": (
        "education",
        "school",
        "college",
        "university",
        "vit",
        "vellore",
        "degree",
        "gpa",
        "grade",
        "graduate",
        "graduation",
        "coursework",
        "certification",
        "certified",
        "coursera",
    ),
    "experience": (
        "experience",
        "intern",
        "internship",
        "work",
        "job",
        "role",
        "company",
        "commvault",
        "kadamba",
        "breakout",
        "cricket",
        "hawk-eye",
        "neo4j",
        "annual report",
    ),
    "projects": (
        "project",
        "projects",
        "built",
        "build",
        "misclue",
        "doodlegyan",
        "doodle",
        "lunar",
        "dqn",
        "landing",
        "github",
        "repo",
    ),
    "skills": (
        "skill",
        "skills",
        "stack",
        "tech",
        "technology",
        "language",
        "languages",
        "python",
        "pytorch",
        "tensorflow",
        "react",
        "opencv",
        "ml",
        "machine learning",
        "nlp",
        "computer vision",
    ),
    "achievements": (
        "achievement",
        "achievements",
        "award",
        "awards",
        "hackathon",
        "finalist",
        "tredence",
        "devsoc",
    ),
    "activities": (
        "activity",
        "activities",
        "club",
        "committee",
        "tam-vit",
        "tam vit",
        "organize",
        "workshop",
    ),
    "contact": (
        "contact",
        "email",
        "mail",
        "phone",
        "reach",
        "linkedin",
        "github",
        "hire",
        "recruit",
    ),
}

OVERVIEW_PHRASES = (
    "about you",
    "about yourself",
    "who are you",
    "introduce yourself",
    "tell me about vk",
    "tell me about venkata",
    "your background",
    "your story",
)

BANTER_PHRASES = (
    "joke",
    "funny",
    "roast",
    "banter",
    "hey",
    "hi",
    "hello",
    "sup",
    "what's up",
    "whats up",
    "how are you",
    "touch grass",
)

GAME_PHRASES = (
    "hangman",
    "rps",
    "rock paper scissors",
    "rock-paper-scissors",
    "/play",
    "play rps",
    "rematch",
    "beat me",
    "try and beat",
    "crush you",
    "i played rock",
    "i played paper",
    "i played scissors",
)

FULL_PROFILE_PHRASES = (
    "full resume",
    "entire resume",
    "whole resume",
    "everything about you",
    "all about you",
    "complete profile",
)


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _load_sections() -> dict[str, str]:
    sections: dict[str, str] = {}
    for path in sorted(KNOWLEDGE_DIR.glob("*.md")):
        sections[path.stem] = path.read_text(encoding="utf-8").strip()
    return sections


SECTIONS = _load_sections()


def _recent_user_text(history: object, limit: int = 3) -> str:
    if not isinstance(history, list):
        return ""

    chunks: list[str] = []
    for item in reversed(history):
        if not isinstance(item, dict):
            continue
        if str(item.get("role", "")).lower() != "user":
            continue
        content = str(item.get("content", "")).strip()
        if content:
            chunks.append(content)
        if len(chunks) >= limit:
            break
    return " ".join(reversed(chunks))


def _contains_keyword(text: str, keyword: str) -> bool:
    if " " in keyword or "-" in keyword:
        return keyword in text
    return re.search(rf"\b{re.escape(keyword)}\b", text) is not None


def _match_sections(text: str) -> set[str]:
    normalized = _normalize(text)
    matched = {
        section
        for section, keywords in SECTION_KEYWORDS.items()
        if any(_contains_keyword(normalized, keyword) for keyword in keywords)
    }
    return matched


def select_sections(message: str, history: object | None = None) -> list[str]:
    text = " ".join(part for part in (message, _recent_user_text(history)) if part)
    normalized = _normalize(text)

    if any(phrase in normalized for phrase in FULL_PROFILE_PHRASES):
        return [CORE_SECTION, *SECTION_KEYWORDS.keys()]

    matched = _match_sections(text)

    if any(phrase in normalized for phrase in OVERVIEW_PHRASES):
        matched.update({"experience", "projects", "skills"})

    if not matched and any(phrase in normalized for phrase in BANTER_PHRASES):
        return [CORE_SECTION]

    if any(phrase in normalized for phrase in GAME_PHRASES):
        return [CORE_SECTION]

    if not matched:
        return [CORE_SECTION]

    ordered = [CORE_SECTION]
    for section in SECTION_KEYWORDS:
        if section in matched:
            ordered.append(section)
    return ordered


def build_profile_context(message: str, history: object | None = None) -> str:
    chosen = select_sections(message, history)
    blocks: list[str] = []
    for section in chosen:
        content = SECTIONS.get(section, "").strip()
        if content:
            blocks.append(f"[{section}]\n{content}")
    return "\n\n".join(blocks)


def build_system_prompt(soul: str, message: str, history: object | None = None) -> str:
    profile = build_profile_context(message, history)
    return f"""
{soul}

Use only the profile sections below as your source of truth for factual claims.
**Never hallucinate.** If the answer is not supported by these sections, refuse in character.
Say something like "That's all I can reveal to you" and tell them to touch grass and talk to the real you.

Loaded profile sections:
{profile}
""".strip()
