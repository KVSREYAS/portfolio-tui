import { buildPixelFaceHtml } from '../pixel-mascot'

export const MAX_WRONG = 6

const WORDS = [
  'GOJO SATORU',
  'CRISTIANO RONALDO',
  'MARK GRAYSON',
  'ONE PIECE',
  'INTERSTELLAR',
  'BOJACK HORSEMAN',
  'KYLIAN MBAPPE',
  'CODE GEASS',
  'RED DEAD REDEMPTION',
  'DARTH VADER',
  "JESSE PINKMAN"
] as const

const WIN_LINES = [
  'Thank you for saving me. I owe you one.',
  'You actually saved me. My face thanks you.',
  'Hero. Seriously — thanks for getting it before I got wrecked.',
]

const LOSE_LINES = [
  'You let me down. I took every punch.',
  'I trusted you to save me. That didn\'t work out.',
  'Six misses. My face is toast and it\'s on you.',
]

export type HangmanSession = {
  /** Lowercase answer. */
  word: string
  guessed: Set<string>
  wrong: number
}

export type HangmanUi = {
  line: (html: string, className?: string) => void
  board: (faceHtml: string, statusHtml: string) => void
}

function normalizeLetter(ch: string): string {
  return ch.toLowerCase()
}

/** Lowercase phrase; collapses runs of spaces to one. */
export function normalizePhrase(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isHangmanLetter(ch: string): boolean {
  return ch.length === 1 && /[a-z]/.test(ch)
}

export function pickHangmanWord(): string {
  return normalizePhrase(WORDS[Math.floor(Math.random() * WORDS.length)]!)
}

export function startHangmanSession(): HangmanSession {
  return {
    word: pickHangmanWord(),
    guessed: new Set(),
    wrong: 0,
  }
}

export function renderWord(session: HangmanSession): string {
  return session.word
    .split(' ')
    .map((part) =>
      part
        .split('')
        .map((ch) => (session.guessed.has(ch) ? ch.toUpperCase() : '_'))
        .join(' '),
    )
    .join('   ')
}

export function renderFaceHtml(wrong: number): string {
  return buildPixelFaceHtml(wrong)
}

export function renderStatus(session: HangmanSession): string {
  const word = renderWord(session)
  const left = MAX_WRONG - session.wrong
  return `${word}\n\nwrong: ${session.wrong}/${MAX_WRONG}  ·  letters left before KO: ${left}`
}

export function isHangmanWon(session: HangmanSession): boolean {
  return [...session.word].every((ch) => ch === ' ' || session.guessed.has(ch))
}

export function isHangmanLost(session: HangmanSession): boolean {
  return session.wrong >= MAX_WRONG
}

export function displayWord(session: HangmanSession): string {
  return session.word
    .split(' ')
    .map((part) => part.toUpperCase())
    .join(' ')
}

export type GuessResult =
  | { kind: 'repeat' }
  | { kind: 'bad_char' }
  | { kind: 'hit'; session: HangmanSession }
  | { kind: 'miss'; session: HangmanSession }
  | { kind: 'word_win'; session: HangmanSession }
  | { kind: 'word_miss'; session: HangmanSession }

export function applyLetterGuess(
  session: HangmanSession,
  letter: string,
): GuessResult {
  const ch = normalizeLetter(letter.trim())
  if (ch.length !== 1 || !/[a-z]/.test(ch)) {
    return { kind: 'bad_char' }
  }
  if (session.guessed.has(ch)) {
    return { kind: 'repeat' }
  }
  session.guessed.add(ch)
  if (session.word.includes(ch)) {
    return { kind: 'hit', session }
  }
  session.wrong += 1
  return { kind: 'miss', session }
}

export function applyWordGuess(session: HangmanSession, guess: string): GuessResult {
  const normalized = normalizePhrase(guess)
  if (normalized.replace(/ /g, '').length < 2) {
    return { kind: 'bad_char' }
  }
  const compact = (s: string) => s.replace(/ /g, '')
  if (
    normalized === session.word ||
    compact(normalized) === compact(session.word)
  ) {
    for (const ch of session.word) {
      if (isHangmanLetter(ch)) session.guessed.add(ch)
    }
    return { kind: 'word_win', session }
  }
  session.wrong += 1
  return { kind: 'word_miss', session }
}

export function pickHangmanLine(pool: readonly string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]!
}

export function showHangmanIntro(ui: HangmanUi): void {
  ui.line('<span class="term-key">Hangman</span> — it\'s my face on the line.', 'term-section')
  ui.line(
    'Every wrong guess, I take a punch. Six misses and I\'m done.',
    'term-muted',
  )
  ui.line('Save me — guess letters (A–Z) or type the whole word/phrase.', 'term-out')
  ui.line('Quit anytime: <span class="term-hl">/play hangman quit</span>', 'term-muted')
}

export function showHangmanBoard(session: HangmanSession, ui: HangmanUi): void {
  ui.board(renderFaceHtml(session.wrong), renderStatus(session))
}

export function showHangmanWin(session: HangmanSession, ui: HangmanUi): void {
  showHangmanBoard(session, ui)
  ui.line(
    `<span class="term-accent">You got it: ${displayWord(session)}</span>`,
    'term-out',
  )
  ui.line('<span class="term-key">VK Twin</span>', 'term-section')
  ui.line(pickHangmanLine(WIN_LINES))
  ui.line('You saved me. For real — thank you.', 'term-muted')
}

export function showHangmanLose(session: HangmanSession, ui: HangmanUi): void {
  showHangmanBoard(session, ui)
  ui.line(
    `<span class="term-err">The word was ${displayWord(session)}</span>`,
    'term-out',
  )
  ui.line('<span class="term-key">VK Twin</span>', 'term-section')
  ui.line(pickHangmanLine(LOSE_LINES))
  ui.line(
    'You let me down. Run <span class="term-hl">/play hangman</span> and try to save me this time.',
    'term-muted',
  )
}
