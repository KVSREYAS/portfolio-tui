import './style.css'
import { apiUrl } from './config'
import { helpSections, profile } from './data'
import {
  applyLetterGuess,
  applyWordGuess,
  isHangmanLost,
  isHangmanWon,
  showHangmanBoard,
  showHangmanIntro,
  showHangmanLose,
  showHangmanWin,
  displayWord,
  startHangmanSession,
  type HangmanSession,
} from './games/hangman'
import {
  parseRpsMove,
  playRpsRound,
  RPS_PICKER_ART,
  type RpsMove,
} from './games/rps'
import { buildPixelMascotHtml } from './pixel-mascot'

type Theme = 'amber' | 'green' | 'paper'
type ChatTurn = { role: 'user' | 'assistant'; content: string }

const THEME_CLASS: Record<Theme, string> = {
  amber: 'theme-amber',
  green: 'theme-green',
  paper: 'theme-paper',
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatChatText(s: string): string {
  return escapeHtml(s).replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="term-bold">$1</strong>',
  )
}

function setTheme(name: Theme): void {
  const root = document.documentElement
  for (const c of Object.values(THEME_CLASS)) root.classList.remove(c)
  root.classList.add(THEME_CLASS[name])
  try {
    localStorage.setItem('portfolio-tui-theme', name)
  } catch {
    /* ignore */
  }
}

function loadSavedTheme(): void {
  try {
    const s = localStorage.getItem('portfolio-tui-theme') as Theme | null
    if (s && s in THEME_CLASS) setTheme(s)
    else setTheme('green')
  } catch {
    setTheme('green')
  }
}

function buildApp(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="desktop" role="application" aria-label="Terminal portfolio">
      <div class="term-stack">
        <div class="term-window">
          <div class="term-chrome">
            <div class="term-dots" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <div class="term-title">${escapeHtml(profile.title)}</div>
            <div class="term-spacer" aria-hidden="true"></div>
          </div>
          <div class="term-body">
            <header class="term-head">
              <div class="term-head-mascot" aria-hidden="true">${buildPixelMascotHtml()}</div>
              <div class="term-head-copy">
                <h1 class="term-head-title">${escapeHtml(profile.headline)}</h1>
                <p class="term-head-sub">${escapeHtml(profile.subtitle)}</p>
                <p class="term-head-path">${escapeHtml(profile.cwd)}</p>
              </div>
            </header>
            <div class="term-output" id="term-out" aria-live="polite" aria-relevant="additions"></div>
            <form class="term-form" id="term-form" autocomplete="off">
              <label class="term-prompt-line">
                <span class="term-prompt" id="term-prompt"></span>
                <input
                  type="text"
                  class="term-input"
                  id="term-input"
                  spellcheck="false"
                  autocapitalize="off"
                  autocomplete="off"
                  aria-label="Command line"
                />
              </label>
            </form>
          </div>
        </div>
      </div>
      <p class="term-hint">Tip: type <kbd>/help</kbd> for commands, or ask me anything.</p>
    </div>
  `

  const promptEl = document.getElementById('term-prompt')!
  const input = document.querySelector<HTMLInputElement>('#term-input')!
  const form = document.querySelector<HTMLFormElement>('#term-form')!
  const out = document.getElementById('term-out')!
  const MAX_CHAT_TURNS = 15
  const chatHistory: ChatTurn[] = []
  let rpsAwaitingPick = false
  let rpsPickerEl: HTMLElement | null = null
  let hangmanSession: HangmanSession | null = null

  function trimChatHistory(): void {
    const maxMessages = MAX_CHAT_TURNS * 2
    if (chatHistory.length > maxMessages) {
      chatHistory.splice(0, chatHistory.length - maxMessages)
    }
  }

  function addRpsResultToChat(result: {
    user: RpsMove
    twin: RpsMove
    roast: string
  }): void {
    chatHistory.push({
      role: 'user',
      content: `Rock paper scissors — I played ${result.user}.`,
    })
    chatHistory.push({
      role: 'assistant',
      content: `Rock paper scissors — I played ${result.twin}, you played ${result.user}. I win. ${result.roast}`,
    })
    trimChatHistory()
  }

  function updatePrompt(): void {
    promptEl.textContent = `${profile.user}@${profile.host}:~$ `
  }

  function appendLine(html: string, className = ''): void {
    const row = document.createElement('div')
    row.className = `term-line ${className}`.trim()
    row.innerHTML = html
    out.appendChild(row)
    out.scrollTop = out.scrollHeight
  }

  function appendMultiline(text: string, className = 'term-out'): void {
    for (const line of text.split('\n')) {
      appendLine(escapeHtml(line), className)
    }
  }

  function appendChatMultiline(text: string, className = 'term-out'): void {
    for (const line of text.split('\n')) {
      appendLine(formatChatText(line), className)
    }
  }

  async function animateFrames(frames: string[][], frameMs: number): Promise<void> {
    const row = document.createElement('div')
    row.className = 'term-line term-rps-anim'
    out.appendChild(row)
    for (const frame of frames) {
      row.innerHTML = `<pre class="term-rps-pre">${escapeHtml(frame.join('\n'))}</pre>`
      out.scrollTop = out.scrollHeight
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, frameMs)
      })
    }
  }

  const rpsUi = {
    line: appendLine,
    multiline: appendMultiline,
    animate: animateFrames,
  }

  const hangmanUi = {
    line: appendLine,
    board: (faceHtml: string, statusText: string) => {
      const row = document.createElement('div')
      row.className = 'term-line term-hangman-board'
      const face = document.createElement('div')
      face.className = 'term-hangman-face'
      face.innerHTML = faceHtml
      const status = document.createElement('pre')
      status.className = 'term-hangman-status'
      status.textContent = statusText
      row.append(face, status)
      out.appendChild(row)
      out.scrollTop = out.scrollHeight
    },
  }

  function clearHangman(): void {
    hangmanSession = null
  }

  function addHangmanResultToChat(won: boolean, word: string, wrong: number): void {
    if (won) {
      chatHistory.push({
        role: 'user',
        content: `Hangman — I guessed the word ${word} with ${wrong} wrong letters.`,
      })
      chatHistory.push({
        role: 'assistant',
        content: `Hangman — they saved me. Got ${word} with ${wrong} wrong guesses. Thank you.`,
      })
    } else {
      chatHistory.push({
        role: 'user',
        content: `Hangman — I failed to guess ${word}.`,
      })
      chatHistory.push({
        role: 'assistant',
        content: `Hangman — they let me down on ${word}. Six punches. Tell them to try /play hangman again.`,
      })
    }
    trimChatHistory()
  }

  function beginHangman(): void {
    hangmanSession = startHangmanSession()
    showHangmanIntro(hangmanUi)
    showHangmanBoard(hangmanSession, hangmanUi)
  }

  function handleHangmanGuess(raw: string): void {
    if (!hangmanSession) return

    const line = raw.trim()
    const wordTry = line.replace(/^guess\s+/i, '').trim()
    const isFullGuess = wordTry.includes(' ') || wordTry.length > 1
    const result = isFullGuess
      ? applyWordGuess(hangmanSession, wordTry)
      : applyLetterGuess(hangmanSession, line)

    if (result.kind === 'bad_char') {
      appendLine('Type one letter (A–Z) or guess the whole word/phrase.', 'term-err')
      return
    }
    if (result.kind === 'repeat') {
      appendLine('Already guessed that letter.', 'term-muted')
      return
    }

    if (isHangmanWon(hangmanSession)) {
      showHangmanWin(hangmanSession, hangmanUi)
      addHangmanResultToChat(true, displayWord(hangmanSession), hangmanSession.wrong)
      clearHangman()
      return
    }
    if (isHangmanLost(hangmanSession)) {
      showHangmanLose(hangmanSession, hangmanUi)
      addHangmanResultToChat(false, displayWord(hangmanSession), hangmanSession.wrong)
      clearHangman()
      return
    }

    if (result.kind === 'miss' || result.kind === 'word_miss') {
      appendLine('Wrong. My face feels that one.', 'term-muted')
    } else if (result.kind === 'hit') {
      appendLine('Yeah, that letter\'s in there.', 'term-muted')
    }

    showHangmanBoard(hangmanSession, hangmanUi)
  }

  function clearRpsPicker(): void {
    rpsAwaitingPick = false
    rpsPickerEl?.remove()
    rpsPickerEl = null
  }

  function showRpsPicker(): void {
    clearRpsPicker()
    rpsAwaitingPick = true

    appendLine('<span class="term-key">Rock Paper Scissors</span>', 'term-section')
    appendLine('Try and beat me if u can.', 'term-muted')

    const row = document.createElement('div')
    row.className = 'term-line term-rps-picker'
    row.innerHTML = `
      <pre class="term-rps-pre">${escapeHtml(RPS_PICKER_ART)}</pre>
      <div class="term-rps-choices" role="group" aria-label="Choose rock, paper, or scissors">
        <button type="button" class="term-rps-btn" data-rps="rock">1 · Rock</button>
        <button type="button" class="term-rps-btn" data-rps="paper">2 · Paper</button>
        <button type="button" class="term-rps-btn" data-rps="scissors">3 · Scissors</button>
      </div>
      <p class="term-rps-hint">Click a move or type <span class="term-hl">rock</span> · <span class="term-hl">paper</span> · <span class="term-hl">scissors</span></p>
    `
    out.appendChild(row)
    rpsPickerEl = row
    out.scrollTop = out.scrollHeight
    row.querySelectorAll<HTMLButtonElement>('.term-rps-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        void playRpsMove(btn.dataset.rps as RpsMove, { echo: btn.dataset.rps })
      })
    })
  }

  async function playRpsMove(
    move: RpsMove,
    opts?: { echo?: string },
  ): Promise<void> {
    clearRpsPicker()
    if (opts?.echo) echoInput(opts.echo)
    input.disabled = true
    try {
      const result = await playRpsRound(move, rpsUi)
      addRpsResultToChat(result)
    } finally {
      input.disabled = false
      input.focus()
    }
  }

  async function handlePlayCommand(args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase()
    if (!sub) {
      appendLine(
        'Games: <span class="term-hl">/play rps</span> · <span class="term-hl">/play hangman</span>',
        'term-muted',
      )
      return
    }
    if (sub === 'hangman') {
      const action = args[1]?.toLowerCase()
      if (action === 'quit' || action === 'exit') {
        clearHangman()
        appendLine('Hangman ended. My face is safe. For now.', 'term-muted')
        return
      }
      if (hangmanSession) {
        appendLine('Game already running — guess a letter or <span class="term-hl">/play hangman quit</span>.', 'term-muted')
        showHangmanBoard(hangmanSession, hangmanUi)
        return
      }
      beginHangman()
      return
    }
    if (sub === 'rps') {
      if (args[1]) {
        const user = parseRpsMove(args[1])
        if (!user) {
          appendLine('Pick rock, paper, or scissors (or 1 / 2 / 3).', 'term-err')
          return
        }
        await playRpsMove(user)
        return
      }
      showRpsPicker()
      return
    }
    appendLine(
      `Unknown game "${escapeHtml(sub)}". Try <span class="term-hl">/play rps</span>.`,
      'term-err',
    )
  }

  const CMD_COL = 20

  function printHelp(): void {
    appendLine('Commands start with <span class="term-hl">/</span>. Anything else goes to VK Twin.', 'term-muted')
    appendLine('Available commands:', 'term-section')
    for (const section of helpSections) {
      appendLine(`<span class="term-key">${escapeHtml(section.title)}</span>`)
      for (const { cmd, desc } of section.commands) {
        appendLine(
          `  <span class="term-hl">${escapeHtml(cmd.padEnd(CMD_COL))}</span>${escapeHtml(desc)}`,
        )
      }
    }
  }

  function echoInput(line: string): void {
    appendLine(
      `<span class="term-prompt-echo">${escapeHtml(`${profile.user}@${profile.host}:~$ `)}</span><span class="term-cmd">${escapeHtml(line)}</span>`,
      'term-echo',
    )
  }

  async function askTwin(message: string): Promise<void> {
    const loading = document.createElement('div')
    loading.className = 'term-line term-muted term-loading'
    loading.textContent = 'VK Twin is thinking...'
    out.appendChild(loading)
    out.scrollTop = out.scrollHeight

    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: chatHistory,
        }),
      })
      const data = (await res.json()) as { reply?: string; error?: string }
      loading.remove()

      if (!res.ok) {
        appendLine(escapeHtml(data.error ?? 'Chat request failed.'), 'term-err')
        return
      }

      const reply = data.reply ?? ''
      chatHistory.push({ role: 'user', content: message })
      chatHistory.push({ role: 'assistant', content: reply })
      trimChatHistory()

      appendLine('<span class="term-key">VK Twin</span>', 'term-section')
      appendChatMultiline(reply)
    } catch {
      loading.remove()
      appendLine('Could not reach VK Twin. Is the backend running?', 'term-err')
    }
  }

  async function runSlashCommand(raw: string): Promise<void> {
    const line = raw.trim()
    const body = line.slice(1).trim()
    if (!body) {
      appendLine('Usage: /help — or ask a question without the slash.', 'term-err')
      return
    }

    const [cmd, ...rest] = body.split(/\s+/)
    const arg = rest.join(' ').trim().toLowerCase()

    switch (cmd.toLowerCase()) {
      case 'play':
        await handlePlayCommand(rest)
        break
      case 'help':
      case '?':
        printHelp()
        break
      case 'about':
        appendLine(
          `<span class="term-accent">${escapeHtml(profile.headline)}</span>`,
          'term-banner',
        )
        for (const p of profile.about) appendLine(escapeHtml(p))
        appendLine('<span class="term-key">Skills</span>', 'term-section')
        for (const [k, v] of profile.skills) {
          appendLine(`<span class="term-key">${escapeHtml(k)}</span>  ${escapeHtml(v)}`)
        }
        break
      case 'education': {
        const ed = profile.education
        appendLine('<span class="term-key">education/</span>', 'term-section')
        appendLine(`<span class="term-accent">${escapeHtml(ed.school)}</span>`)
        appendLine(`${escapeHtml(ed.degree)} · ${escapeHtml(ed.grad)}`)
        appendLine(escapeHtml(ed.gpa))
        appendLine(
          `<span class="term-key">Coursework</span>  ${escapeHtml(ed.coursework)}`,
        )
        appendLine('<span class="term-key">Certifications</span>', 'term-section')
        for (const c of profile.certifications) {
          appendLine(`  · ${escapeHtml(c)}`, 'term-bullet')
        }
        break
      }
      case 'experience':
        appendLine('<span class="term-key">experience/</span>', 'term-section')
        for (const job of profile.experience) {
          appendLine(
            `<span class="term-accent">${escapeHtml(job.role)}</span> — ${escapeHtml(job.company)}  <span class="term-dim">${escapeHtml(job.dates)}</span>`,
          )
          for (const b of job.bullets) {
            appendLine(`  · ${escapeHtml(b)}`, 'term-bullet')
          }
        }
        break
      case 'projects':
        appendLine('<span class="term-key">projects/</span>', 'term-section')
        for (const pr of profile.projects) {
          const name = pr.url
            ? `<a href="${escapeHtml(pr.url)}" target="_blank" rel="noreferrer">${escapeHtml(pr.name)}</a>`
            : escapeHtml(pr.name)
          appendLine(
            `${name}  <span class="term-dim">${escapeHtml(pr.period)}</span>`,
          )
          appendLine(`  ${escapeHtml(pr.desc)}`, 'term-bullet')
        }
        break
      case 'achievements':
        appendLine('<span class="term-key">achievements/</span>', 'term-section')
        for (const a of profile.achievements) {
          appendLine(`<span class="term-accent">${escapeHtml(a.title)}</span>`)
          appendLine(`  ${escapeHtml(a.desc)}`, 'term-bullet')
        }
        break
      case 'contact':
        appendLine('<span class="term-key">contact/</span>', 'term-section')
        for (const [label, href, text] of profile.contact) {
          const value = href
            ? `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`
            : escapeHtml(text)
          appendLine(`${escapeHtml(label)}: ${value}`)
        }
        break
      case 'clear':
        clearRpsPicker()
        clearHangman()
        out.replaceChildren()
        chatHistory.length = 0
        break
      case 'theme': {
        if (arg === 'amber' || arg === 'green' || arg === 'paper') {
          setTheme(arg)
          appendLine(`Theme set to <span class="term-accent">${escapeHtml(arg)}</span>`)
        } else {
          appendLine('Usage: theme amber | green | paper', 'term-err')
        }
        break
      }
      default:
        appendLine(
          `${escapeHtml(cmd)}: command not found. Try <span class="term-hl">/help</span>.`,
          'term-err',
        )
    }
  }

  async function runCommand(raw: string): Promise<void> {
    const line = raw.trim()
    if (!line) return

    echoInput(line)
    input.disabled = true

    try {
      if (hangmanSession && !line.startsWith('/')) {
        handleHangmanGuess(line)
        return
      }
      if (rpsAwaitingPick && !line.startsWith('/')) {
        const move = parseRpsMove(line)
        if (move) {
          await playRpsMove(move)
          return
        }
        appendLine('Pick 1–3 or rock / paper / scissors.', 'term-err')
        return
      }
      if (line.startsWith('/')) {
        await runSlashCommand(line)
      } else {
        await askTwin(line)
      }
    } finally {
      input.disabled = false
      input.focus()
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const v = input.value
    input.value = ''
    void runCommand(v)
  })

  loadSavedTheme()
  updatePrompt()
  appendMultiline(
    `Welcome. You're talking to my digital twin — nice, cocky, and probably winning.
Type /help for portfolio commands, or just say something.`,
    'term-muted',
  )
  input.focus()
}

buildApp()
