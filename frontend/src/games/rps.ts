export type RpsMove = 'rock' | 'paper' | 'scissors'

const MOVE_ALIASES: Record<string, RpsMove> = {
  r: 'rock',
  rock: 'rock',
  p: 'paper',
  paper: 'paper',
  s: 'scissors',
  scissors: 'scissors',
  scissor: 'scissors',
}

export function twinMoveAgainst(user: RpsMove): RpsMove {
  if (user === 'rock') return 'paper'
  if (user === 'paper') return 'scissors'
  return 'rock'
}

const MOVE_NUMBERS: Record<string, RpsMove> = {
  '1': 'rock',
  '2': 'paper',
  '3': 'scissors',
}

export function parseRpsMove(raw: string): RpsMove | null {
  const key = raw.trim().toLowerCase()
  return MOVE_ALIASES[key] ?? MOVE_NUMBERS[key] ?? null
}

export const RPS_PICKER_ART = [
  '       ROCK              PAPER            SCISSORS',
  '        ___               ______              \\  /',
  '       /   \\             |      |              \\/',
  '      |     |             |      |              /\\',
  '       \\___/               \\____/              /  \\',
].join('\n')

const LABEL: Record<RpsMove, string> = {
  rock: 'ROCK',
  paper: 'PAPER',
  scissors: 'SCISSORS',
}

export function moveLabel(m: RpsMove): string {
  return LABEL[m]
}

export type RpsMatchup = 'paper-rock' | 'scissors-paper' | 'rock-scissors'

export function matchupFor(user: RpsMove, twin: RpsMove): RpsMatchup {
  if (twin === 'paper' && user === 'rock') return 'paper-rock'
  if (twin === 'scissors' && user === 'paper') return 'scissors-paper'
  return 'rock-scissors'
}

const ROASTS: Record<RpsMatchup, string[]> = {
  'paper-rock': [
    "Paper beats rock. You beat nothing. Sit down.",
    "I wrapped your rock like a gift. You're welcome for the lesson.",
    "Geology called. Even it thinks you lost.",
    "That rock had potential. You wasted it in one move.",
  ],
  'scissors-paper': [
    "Snip snip. There goes your dignity and your paper.",
    "I cut through that paper faster than you cut through hope.",
    "Your paper folded. I didn't even have to.",
    "Arts and crafts era is over. I won.",
  ],
  'rock-scissors': [
    "Rock smashed your scissors. So did reality.",
    "Your scissors are in the recycling bin of bad ideas.",
    "I didn't crush scissors — I crushed your confidence.",
    "Metal scissors? Cute. I brought a boulder.",
  ],
}

export function pickRoast(matchup: RpsMatchup): string {
  const pool = ROASTS[matchup]
  return pool[Math.floor(Math.random() * pool.length)]!
}

/** Frame sequences: twin wins each matchup. */
export const RPS_ANIMATIONS: Record<RpsMatchup, string[][]> = {
  'scissors-paper': [
    [
      '  SCISSORS vs PAPER',
      '',
      '       \\    /',
      '        \\  /',
      '    ____  \/  ____',
      '   /    \\    /    \\',
      '  | PAPER |  | SNIP |',
      '   \\____/      \\__/',
    ],
    [
      '  SCISSORS vs PAPER',
      '',
      '     \\    /',
      '      \\  /  →',
      '    ____\\/  ____',
      '   /    \\  /    \\',
      '  | PAPER | | SNIP |',
      '   \\____/    \\__/',
    ],
    [
      '  SCISSORS vs PAPER',
      '',
      '       \\  /',
      '        \\/',
      '    ____\\/____',
      '   /    XX    \\',
      '  | PAP|  |IP |',
      '   \\____/\\____/',
    ],
    [
      '  SCISSORS vs PAPER',
      '',
      '        \\/',
      '         X  SNIP!',
      '    ___\\_/\\___',
      '   /    \\/    \\',
      '  | PA |  | ER |',
      '   \\___/  \\___/',
    ],
    [
      '  SCISSORS vs PAPER',
      '',
      '         ✂',
      '        /|\\',
      '    ____X____',
      '   /  cut!   \\',
      '  |  /    \\   |',
      '   \\/      \\/',
    ],
    [
      '  ✂ SCISSORS CUTS PAPER ✂',
      '',
      '      \\  |  /',
      '       \\ | /',
      '    ____\\|/____',
      '   /  shredded  \\',
      '  |  ·  ·  ·  · |',
      '   \\____________/',
    ],
  ],
  'rock-scissors': [
    [
      '  ROCK vs SCISSORS',
      '',
      '        ___',
      '       /   \\',
      '      | BOULDER |',
      '       \\___/',
      '',
      '            ><  scissors',
    ],
    [
      '  ROCK vs SCISSORS',
      '',
      '        ___',
      '       /   \\',
      '      | BOULDER |  ↓',
      '       \\___/',
      '',
      '          ><',
    ],
    [
      '  ROCK vs SCISSORS',
      '',
      '        ___',
      '       /   \\',
      '      | BOULDER |',
      '       \\___/',
      '          \\',
      '           ><',
    ],
    [
      '  ROCK vs SCISSORS',
      '',
      '        ___',
      '       /###\\',
      '      | SMASH |',
      '       \\###/',
      '         |',
      '        ><!  crunch',
    ],
    [
      '  ROCK vs SCISSORS',
      '',
      '       /###\\',
      '      | CRUSH |',
      '       \\###/',
      '        /X\\',
      '       /   \\',
      '      broken',
    ],
    [
      '  🪨 ROCK CRUSHES SCISSORS 🪨',
      '',
      '       /###\\',
      '      |  WIN  |',
      '       \\###/',
      '',
      '      ><  R.I.P.',
      '      --',
    ],
  ],
  'paper-rock': [
    [
      '  PAPER vs ROCK',
      '',
      '   ___________',
      '  |  PAPER   |',
      '  |___________|',
      '',
      '       ( )  rock',
    ],
    [
      '  PAPER vs ROCK',
      '',
      '   ___________',
      '  |  PAPER   | →',
      '  |___________|',
      '',
      '       ( )',
    ],
    [
      '  PAPER vs ROCK',
      '',
      '   ___________',
      '  |  PAPER   |',
      '  |____( )____|',
      '       \\   /',
      '        \\ /',
    ],
    [
      '  PAPER vs ROCK',
      '',
      '   ___________',
      '  | PAPER     |',
      '  |  wraps!   |',
      '  |    ( )    |',
      '  |___________|',
    ],
    [
      '  PAPER vs ROCK',
      '',
      '   ___________',
      '  |▓▓▓▓▓▓▓▓▓▓▓|',
      '  |▓▓ ( ) ▓▓▓|',
      '  |▓▓▓▓▓▓▓▓▓▓▓|',
      '  |  engulf!  |',
      '  |___________|',
    ],
    [
      '  📄 PAPER ENGULFS ROCK 📄',
      '',
      '   ___________',
      '  |▓▓▓▓▓▓▓▓▓▓▓|',
      '  |▓ swallowed ▓|',
      '  |▓▓▓▓▓▓▓▓▓▓▓|',
      '  |___________|',
      '     rock: gone',
    ],
  ],
}

/** Total animation duration (~5s), split evenly across frames. */
export const RPS_ANIMATION_DURATION_MS = 5_000

export type RpsUi = {
  line: (html: string, className?: string) => void
  multiline: (text: string, className?: string) => void
  animate: (frames: string[][], frameMs: number) => Promise<void>
}

export type RpsRoundResult = {
  user: RpsMove
  twin: RpsMove
  roast: string
}

export async function playRpsRound(user: RpsMove, ui: RpsUi): Promise<RpsRoundResult> {
  const twin = twinMoveAgainst(user)
  const matchup = matchupFor(user, twin)
  const roast = pickRoast(matchup)

  ui.line(
    `You: <span class="term-accent">${moveLabel(user)}</span>  ·  VK Twin: <span class="term-accent">${moveLabel(twin)}</span>`,
  )

  const frames = RPS_ANIMATIONS[matchup]
  await ui.animate(frames, RPS_ANIMATION_DURATION_MS / frames.length)

  ui.line('<span class="term-accent">VK Twin wins.</span>', 'term-out')
  ui.line('<span class="term-key">VK Twin</span>', 'term-section')
  ui.line(roast)

  return { user, twin, roast }
}
