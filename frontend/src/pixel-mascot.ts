/**
 * Oval head (14 cols × 18 rows).
 * . empty  p skin  h hair  g rim  = bridge  # eye  - mouth
 * x hurt eye  X KO eye  b red bruise  u purple bruise  a bandaid  s daze  c cracked lens  ~ wince  _ flat mouth
 */
const STAGE_0 = [
  '..hhhhhhhh....',
  '..hhhhhhhhh...',
  '..hhhhhhhhhh..',
  '.hhpppppppphh.',
  '.hpppppppppph.',
  'hpppppppppppph',
  '.pppppppppppp.',
  '.pgggggpggggg.',
  'ppgp#pg=gp#pg.',
  'ppgpppgpgpppg.',
  'pppgggpppgggp.',
  '.pppppppppppp.',
  '.pppp-ppppppp.',
  '.ppppp--ppppp.',
  '.pppppppppppp.',
  '..pppppppppp..',
  '...pppppppp...',
  '....pppppp....',
] as const

const STAGE_1 = [
  '..hhhhhhhh....',
  '..hhhhhhhhh...',
  '..hhhhhhhhhh..',
  '.hhpppppppphh.',
  '.hpppppppppph.',
  'hpppppppppppph',
  '.pppppppppppp.',
  '.pgggggpggggg.',
  'ppgp#pg=gp#pg.',
  'ppgpppgpgpppg.',
  'pppgggpppgggp.',
  '.pppppppppppp.',
  '.pppppppppppp.',
  '.ppppp--ppppp.',
  '.ppppbbpppppp.',
  '..pppppppppp..',
  '...pppppppp...',
  '....pppppp....',
] as const

const STAGE_2 = [
  '..hhhhhhhh....',
  '..hhhhhhhhh...',
  '..hhhhhhhhhh..',
  '.hhpppppppphh.',
  '.hpppppppppph.',
  'hpppppppppppph',
  '.pppppppppppp.',
  '.pgggggpggggg.',
  'pppp#pg=gp#pg.',
  'ppppppgpgpppg.',
  'ppbbggpppgggp.',
  '.pbbppppppppp.',
  '.pppppppppppp.',
  '.ppppp--ppppp.',
  '.ppppbbpppppp.',
  '..pppppppppp..',
  '...pppppppp...',
  '....pppppp....',
] as const

const STAGE_3 = [
  '..hhhhhhhh....',
  '..hhhhhhhhh...',
  '..hhhhhhhhhh..',
  '.hhpppppppphh.',
  '.hpppppaappph.',
  'hppppppaapppph',
  '.pppppppppppp.',
  '.ppppggpggggg.',
  'pppp#gg=gp#pg.',
  'pppppgppgpppg.',
  'ppbbggpppgggp.',
  '.pbbppppppppp.',
  '.pppppppppppp.',
  '.ppppp--ppppp.',
  '.ppppbbpppppp.',
  '..pppppppppp..',
  '...pppppppp...',
  '....pppppp....',
] as const

const STAGE_4 = [
  '..hhhhhhhh....',
  '..hhhhhhhhh...',
  '..hhhhhhhhhh..',
  '.hhbbpppppphh.',
  '.hpbbppaappph.',
  'hppppppaapppph',
  '.pppppppppppp.',
  '.ppppggpggggg.',
  'ppppsgg=gp#pg.',
  'pppppgppgpppg.',
  'ppbbggpppgggp.',
  '.pbbppppppppp.',
  '.pppppppppppp.',
  '.ppppp--ppppp.',
  '.ppppbbpppppp.',
  '..pppppppppp..',
  '...ppbbbbpp...',
  '....pppppp....',
] as const

const STAGE_5 = [
  '..hhhhhhhh....',
  '..hhhhhhhhh...',
  '..hhhhhhhhhh..',
  '.hhbbpppppphh.',
  '.hpbbppaappph.',
  'hppppppaapppph',
  '.pppppppppppp.',
  '.ppuuupppgggg.',
  'ppppsppppp#pg.',
  'pppuuuppppppg.',
  'bpbbpppppgggp.',
  'bpbbppppppppp.',
  '.pppppppppppp.',
  '.ppppp--ppaap.',
  '.ppppbbpppaap.',
  '..pppppppppp..',
  '...ppbbbbpp...',
  '....pppppp....',
] as const

const STAGE_6 = [
  '..hhhhhhhh....',
  '..hhhhhhhhh...',
  '..hhhhhhhhhh..',
  '.hhbbpppppphh.',
  '.hpbbppaappph.',
  'hppppppaapppph',
  '.pppppppppppp.',
  '.ppuuupppuuup.',
  'ppppspppppspp.',
  'pppuuupppuuup.',
  'bpbbppppbbppp.',
  'bpbbppppbbppp.',
  '.pppppppppppp.',
  '.ppppp--ppaap.',
  '.ppppbbpppaap.',
  '..pppppppppp..',
  '...ppbbbbpp...',
  '....pppppp....',
] as const

const INJURY_STAGES = [
  STAGE_0,
  STAGE_1,
  STAGE_2,
  STAGE_3,
  STAGE_4,
  STAGE_5,
  STAGE_6,
] as const

const FACE_LABELS = [
  'VK portrait',
  'VK with a black eye',
  'VK with bruised eyes',
  'VK — X by left eye, glasses gone on that side',
  'VK with forehead bandaid',
  'VK dazed',
  'VK knocked out',
] as const

const WIDTH = STAGE_0[0]!.length

function cellClass(ch: string): string {
  switch (ch) {
    case ' ':
    case '.':
      return 'px-empty'
    case '#':
      return 'px-eye'
    case 'x':
    case 'X':
      return 'px-hurt-eye'
    case 's':
      return 'px-daze'
    case '-':
    case '~':
    case '_':
      return 'px-mouth'
    case 'g':
    case '=':
      return 'px-glasses'
    case 'c':
      return 'px-glasses-crack'
    case 'h':
      return 'px-hair'
    case 'b':
      return 'px-bruise'
    case 'u':
      return 'px-bruise-purple'
    case 'a':
      return 'px-bandaid'
    default:
      return 'px-body'
  }
}

function designToHtml(
  rows: readonly string[],
  className: string,
  ariaLabel: string,
): string {
  const cells = rows.join('')
  if (cells.length % WIDTH !== 0) throw new Error('pixel-mascot: ragged design rows')

  let html = ''
  for (const ch of cells) {
    const cls = cellClass(ch)
    html +=
      cls === 'px-empty'
        ? '<span class="px px-empty"></span>'
        : `<span class="px ${cls}"></span>`
  }

  return `<div class="pixel-mascot ${className}" style="--px-cols:${WIDTH};--px-rows:${rows.length}" role="img" aria-label="${ariaLabel}">${html}</div>`
}

export function buildPixelFaceHtml(wrongGuesses: number): string {
  const idx = Math.min(Math.max(0, wrongGuesses), INJURY_STAGES.length - 1)
  const design = INJURY_STAGES[idx]!
  return designToHtml(design, 'pixel-mascot--hangman', FACE_LABELS[idx]!)
}

export function buildPixelMascotHtml(): string {
  return designToHtml(STAGE_0, 'pixel-mascot--hero', FACE_LABELS[0]!)
}
