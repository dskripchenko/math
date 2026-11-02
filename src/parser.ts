/**
 * TeX math to a tree: the commonly written subset of LaTeX math — letters and
 * numbers, scripts, fractions and roots, Greek and symbols, big operators
 * with limits, function names, fences that stretch, accents, letter styles,
 * text, spacing, colours, matrices, cases and aligned equations. Anything else
 * is an error with its place, never a guess.
 */
import type { MathNode, OpKind } from './ast'
import { FONT_COMMANDS, styled, type Font } from './fonts'
import {
  ACCENTS,
  BINARY,
  charKind,
  DELIMITERS,
  FUNCTIONS,
  FUNCTION_TEXT,
  INTEGRALS,
  LARGE,
  LETTERS,
  LIMIT_FUNCTIONS,
  OPENING,
  PUNCT,
  RELATIONS,
  SIZES,
  SPACES,
} from './symbols'

export class MathError extends Error {
  constructor(
    message: string,
    /** Where in the TeX it went wrong (a character offset). */
    readonly position: number,
  ) {
    super(message)
    this.name = 'MathError'
  }
}

export interface ParseOptions {
  /** Commands of the writer's own: `{ R: '\\mathbb{R}', norm: '\\left\\|#1\\right\\|' }`; `#1`…`#9` are arguments. */
  macros?: Record<string, string>
}

interface Token {
  /** `\name` (a command, without the backslash), or a character. */
  kind: 'command' | 'char' | 'space'
  value: string
  pos: number
}

/** How deep groups may nest, how long a formula may be, how many times macros may expand. */
const MAX_DEPTH = 256
const MAX_TOKENS = 20_000
const MAX_EXPANSIONS = 2_000

export function tokenize(tex: string, offset = 0): Token[] {
  const out: Token[] = []
  let i = 0
  while (i < tex.length) {
    const ch = tex[i]!
    if (ch === '\\') {
      const name = /^[a-zA-Z]+/.exec(tex.slice(i + 1))?.[0]
      if (name) {
        out.push({ kind: 'command', value: name, pos: offset + i })
        i += 1 + name.length
      } else if (i + 1 < tex.length) {
        out.push({ kind: 'command', value: tex[i + 1]!, pos: offset + i })
        i += 2
      } else throw new MathError('A backslash at the end', offset + i)
    } else if (ch === '%') {
      // A comment, to the end of the line.
      const end = tex.indexOf('\n', i)
      i = end < 0 ? tex.length : end + 1
    } else if (/\s/.test(ch)) {
      const start = i
      while (i < tex.length && /\s/.test(tex[i]!)) i++
      out.push({ kind: 'space', value: ' ', pos: offset + start })
    } else {
      const cp = tex.codePointAt(i)!
      const s = String.fromCodePoint(cp)
      out.push({ kind: 'char', value: s, pos: offset + i })
      i += s.length
    }
    if (out.length > MAX_TOKENS) throw new MathError('The formula is too long', offset + i)
  }
  return out
}

/** What stops an expression: the end of a group, a cell, a row, a fence. */
type Stop = '}' | ']' | 'right' | 'end' | 'cell' | 'eof'

const NEGATED: Record<string, string> = {
  '=': '≠', '<': '≮', '>': '≯', '≤': '≰', '≥': '≱', '∈': '∉', '∋': '∌', '⊂': '⊄', '⊃': '⊅', '⊆': '⊈', '⊇': '⊉',
  '∼': '≁', '≅': '≇', '≈': '≉', '≡': '≢', '∣': '∤', '∥': '∦', '→': '↛', '←': '↚', '⇒': '⇏', '⇐': '⇍', '⇔': '⇎', '↔': '↮',
}

const ENVIRONMENTS: Record<string, { open?: string; close?: string; align?: ('l' | 'c' | 'r')[]; aligned?: boolean; small?: boolean; display?: boolean }> = {
  matrix: { align: ['c'] },
  pmatrix: { align: ['c'], open: '(', close: ')' },
  bmatrix: { align: ['c'], open: '[', close: ']' },
  Bmatrix: { align: ['c'], open: '{', close: '}' },
  vmatrix: { align: ['c'], open: '|', close: '|' },
  Vmatrix: { align: ['c'], open: '‖', close: '‖' },
  smallmatrix: { align: ['c'], small: true },
  cases: { align: ['l', 'l'], open: '{' },
  dcases: { align: ['l', 'l'], open: '{', display: true },
  rcases: { align: ['l', 'l'], close: '}' },
  aligned: { aligned: true, display: true },
  align: { aligned: true, display: true },
  'align*': { aligned: true, display: true },
  alignat: { aligned: true, display: true },
  'alignat*': { aligned: true, display: true },
  alignedat: { aligned: true, display: true },
  split: { aligned: true, display: true },
  eqnarray: { align: ['r', 'c', 'l'], display: true },
  'eqnarray*': { align: ['r', 'c', 'l'], display: true },
  gathered: { align: ['c'], display: true },
  gather: { align: ['c'], display: true },
  'gather*': { align: ['c'], display: true },
  multline: { align: ['c'], display: true },
  'multline*': { align: ['c'], display: true },
  equation: { align: ['c'], display: true },
  'equation*': { align: ['c'], display: true },
  array: {},
  darray: { display: true },
  subarray: { small: true },
}

/** A colour as CSS takes it safely: a name or a hex value. */
function safeColor(value: string, pos: number): string {
  const v = value.trim()
  if (/^[a-zA-Z]{1,32}$/.test(v)) return v
  if (/^#?[0-9a-fA-F]{3,8}$/.test(v)) return v.startsWith('#') ? v : `#${v}`
  throw new MathError(`Not a colour: ${v}`, pos)
}

/** A TeX length in em (`1em`, `3mu`, `2pt`, `1ex`, `0.5cm`). */
function emOf(value: string, pos: number): number {
  const m = /^\s*(-?\d*\.?\d+)\s*(em|ex|mu|pt|px|mm|cm|in)\s*$/.exec(value)
  if (!m) throw new MathError(`Not a length: ${value}`, pos)
  const n = Number(m[1])
  const per: Record<string, number> = { em: 1, ex: 0.43, mu: 1 / 18, pt: 1 / 10, px: 1 / 16, mm: 0.284, cm: 2.84, in: 7.23 }
  return n * per[m[2]!]!
}

export class Parser {
  private tokens: Token[]
  private i = 0
  private depth = 0
  private expansions = 0
  private font: Font | null = null
  /** In a display formula: big operators take limits under and over. */
  private readonly macros: Record<string, string>

  constructor(
    private readonly tex: string,
    options: ParseOptions = {},
  ) {
    this.tokens = tokenize(tex)
    this.macros = options.macros ?? {}
  }

  /** The whole formula; rows (`\\`) and columns (`&`) at the top make a table of aligned or gathered lines. */
  parse(): MathNode {
    const rows = this.rows('eof')
    if (rows.length === 1 && rows[0]!.length === 1) return rows[0]![0]!
    const columns = Math.max(...rows.map((r) => r.length))
    return columns > 1
      ? { type: 'table', rows: rows.map((r) => r.map((c) => this.display(c))), align: ['r', 'l'], aligned: true }
      : { type: 'table', rows: rows.map((r) => r.map((c) => this.display(c))), align: ['c'] }
  }

  private display(node: MathNode): MathNode {
    return { type: 'style', body: node, display: true }
  }

  // Tokens ------------------------------------------------------------------------

  private peek(skipSpace = true): Token | undefined {
    if (skipSpace) while (this.tokens[this.i]?.kind === 'space') this.i++
    return this.tokens[this.i]
  }

  private next(skipSpace = true): Token | undefined {
    const t = this.peek(skipSpace)
    if (t) this.i++
    return t
  }

  private pos(): number {
    return this.tokens[this.i]?.pos ?? this.tex.length
  }

  private isChar(t: Token | undefined, ch: string): boolean {
    return !!t && t.kind === 'char' && t.value === ch
  }

  private isCommand(t: Token | undefined, name: string): boolean {
    return !!t && t.kind === 'command' && t.value === name
  }

  private expect(ch: string): void {
    const t = this.next()
    if (!this.isChar(t, ch)) throw new MathError(`Expected "${ch}"`, t?.pos ?? this.tex.length)
  }

  private enter(): void {
    if (++this.depth > MAX_DEPTH) throw new MathError('Nested too deeply', this.pos())
  }

  // Expressions ---------------------------------------------------------------------

  /** Atoms until the stop; what `\color` and `\displaystyle` change runs to it too. */
  private expression(stop: Stop): MathNode[] {
    const out: MathNode[] = []
    for (;;) {
      const t = this.peek()
      if (!t) {
        if (stop === 'eof' || stop === 'cell') return out
        throw new MathError(stop === '}' ? 'A "{" is not closed' : stop === 'right' ? '\\left without \\right' : stop === 'end' ? 'An environment is not ended' : `Expected "${stop}"`, this.tex.length)
      }
      if (this.isChar(t, '}')) {
        if (stop === '}') return out
        if (stop === 'cell' || stop === 'eof') throw new MathError('An unmatched "}"', t.pos)
        throw new MathError('An unmatched "}"', t.pos)
      }
      if (stop === ']' && this.isChar(t, ']')) return out
      if (stop === 'right' && (this.isCommand(t, 'right') || this.isCommand(t, 'middle'))) return out
      if ((stop === 'cell' || stop === 'eof' || stop === 'end') && (this.isChar(t, '&') || this.isCommand(t, '\\') || this.isCommand(t, 'cr') || this.isCommand(t, 'end'))) {
        if (this.isCommand(t, 'end') && stop === 'eof') throw new MathError('\\end without \\begin', t.pos)
        return out
      }
      // Switches: the rest, up to the stop, in a style.
      if (t.kind === 'command' && (t.value === 'color' || t.value in STYLE_SWITCHES)) {
        this.i++
        const style = t.value === 'color' ? { color: safeColor(this.textArgument(), t.pos) } : STYLE_SWITCHES[t.value]!
        out.push({ type: 'style', body: row(this.expression(stop)), ...style })
        return out
      }
      const atom = this.atomWithScripts()
      if (atom) out.push(atom)
    }
  }

  /** Rows of cells, up to the stop: for environments and the top. */
  private rows(stop: 'end' | 'eof'): MathNode[][] {
    const rows: MathNode[][] = [[]]
    for (;;) {
      const cell = row(this.expression(stop === 'end' ? 'cell' : 'eof'))
      rows[rows.length - 1]!.push(cell)
      const t = this.peek()
      if (this.isChar(t, '&')) {
        this.i++
        continue
      }
      if (this.isCommand(t, '\\') || this.isCommand(t, 'cr')) {
        this.i++
        // `\\[2pt]`: the extra space is not kept.
        if (this.isChar(this.peek(), '[')) this.textUntil(']')
        // A trailing `\\` makes no empty row.
        const after = this.peek()
        if (!after || this.isCommand(after, 'end')) continue
        rows.push([])
        continue
      }
      if (stop === 'end') {
        if (!this.isCommand(t, 'end')) throw new MathError('An environment is not ended', this.pos())
      }
      return rows.filter((r, i) => i === 0 || r.length > 1 || !isEmpty(r[0]!))
    }
  }

  /** One atom and its scripts: `x`, `x_1^2`, `f'`, `\sum_{i=1}^n`. */
  private atomWithScripts(): MathNode | null {
    const start = this.pos()
    let base = this.atom()
    let sub: MathNode | undefined
    let sup: MathNode | undefined
    let primes = ''
    let limits: boolean | undefined
    for (;;) {
      const t = this.peek()
      if (this.isChar(t, '^') || this.isChar(t, '_')) {
        this.i++
        const which = t!.value === '^' ? 'sup' : 'sub'
        if ((which === 'sup' ? sup : sub) !== undefined) throw new MathError(`Double ${which === 'sup' ? 'superscript' : 'subscript'}`, t!.pos)
        const arg = this.argument()
        if (which === 'sup') sup = arg
        else sub = arg
      } else if (this.isChar(t, "'")) {
        this.i++
        primes += '′'
      } else if (this.isCommand(t, 'limits') || this.isCommand(t, 'nolimits')) {
        this.i++
        limits = t!.value === 'limits'
      } else break
    }
    if (primes) sup = sup ? row([op(primes, 'ord'), sup]) : op(primes, 'ord')
    if (!sub && !sup) return base
    base ??= row([])
    const over = limits ?? takesLimits(base)
    if (base.type === 'op' && base.kind === 'large' && limits === false) base = { ...base, movableLimits: false }
    void start
    return { type: 'scripts', base, sub, sup, over }
  }

  /** A script's or a command's argument: a group, or one token. */
  private argument(): MathNode {
    const t = this.peek()
    if (!t) throw new MathError('An argument is missing', this.tex.length)
    if (this.isChar(t, '{')) return this.group()
    if (this.isChar(t, '}') || this.isChar(t, '&') || this.isChar(t, '^') || this.isChar(t, '_')) throw new MathError('An argument is missing', t.pos)
    const atom = this.atom(true)
    if (!atom) throw new MathError('An argument is missing', t.pos)
    return atom
  }

  private group(): MathNode {
    this.expect('{')
    this.enter()
    const font = this.font
    const body = this.expression('}')
    this.font = font
    this.depth--
    this.expect('}')
    return row(body)
  }

  /** An argument read as plain text (a colour, a name, a length, an environment). */
  private textArgument(): string {
    const t = this.peek()
    if (this.isChar(t, '{')) {
      this.i++
      return this.textUntil('}', false)
    }
    const one = this.next()
    if (!one) throw new MathError('An argument is missing', this.tex.length)
    return one.value
  }

  /** A length: in braces, or written on (`\\mkern18mu`, `\\kern-1em`). */
  private dimension(): string {
    if (this.isChar(this.peek(), '{')) return this.textArgument()
    let out = ''
    while (this.tokens[this.i]?.kind === 'char' && /^-?\d*\.?\d*[a-z]{0,2}$/.test(out + this.tokens[this.i]!.value)) out += this.tokens[this.i++]!.value
    return out
  }

  /** The raw text up to a closing character (after its opening one, or the `[` here), groups inside kept balanced. */
  private textUntil(close: '}' | ']', opening = true): string {
    if (opening) this.i++
    let out = ''
    let level = 0
    for (;;) {
      const t = this.next(false)
      if (!t) throw new MathError(`Expected "${close}"`, this.tex.length)
      if (t.kind === 'char' && t.value === '{') level++
      if (t.kind === 'char' && t.value === '}' && level > 0) level--
      else if (t.kind === 'char' && t.value === close && level === 0) return out
      out += t.kind === 'command' ? `\\${t.value}` : t.value
    }
  }

  /** A single atom (no scripts); null for a token that makes nothing (`\limits` alone, a stray space). */
  private atom(single = false): MathNode | null {
    const t = this.next()
    if (!t) return null
    // Every atom counts in the depth: arguments nest as groups do (`\frac\frac\frac…`).
    this.enter()
    try {
      return t.kind === 'char' ? this.character(t, single) : this.command(t)
    } finally {
      this.depth--
    }
  }

  private character(t: Token, single: boolean): MathNode | null {
    const ch = t.value
    if (ch === '{') {
      this.i--
      return this.group()
    }
    if (ch === '^' || ch === '_') {
      // A script with nothing before it: on an empty base.
      this.i--
      return row([])
    }
    if (ch === '~') return { type: 'space', width: 1 / 3 }
    if (ch === '&') throw new MathError('"&" outside a table', t.pos)
    if (ch === '#') throw new MathError('"#" outside a macro', t.pos)
    if (ch === '$') throw new MathError('"$" inside a formula', t.pos)
    if (/[0-9]/.test(ch)) {
      // A number: its digits and one decimal point between them (one digit only as an argument: `\frac12`).
      let text = ch
      while (!single) {
        const n = this.tokens[this.i]
        if (n?.kind === 'char' && /[0-9]/.test(n.value)) text += n.value
        else if (n?.kind === 'char' && n.value === '.' && /[0-9]/.test(this.tokens[this.i + 1]?.value ?? '') && !text.includes('.')) text += n.value
        else break
        this.i++
      }
      return { type: 'number', text: this.font ? styled(text, this.font) : text }
    }
    if (/\p{L}/u.test(ch)) {
      // Under a letter style a run of letters is one name (`\mathrm{max}`); otherwise each letter is a variable.
      if (this.font && !single) {
        let text = ch
        while (this.tokens[this.i]?.kind === 'char' && /\p{L}/u.test(this.tokens[this.i]!.value)) text += this.tokens[this.i++]!.value
        return this.font === 'normal' ? { type: 'ident', text, upright: true } : { type: 'ident', text: styled(text, this.font) }
      }
      return this.font === 'normal' ? { type: 'ident', text: ch, upright: true } : { type: 'ident', text: this.font ? styled(ch, this.font) : ch }
    }
    const kind = charKind(ch)
    if (ch === '-') return op('−', 'bin')
    if (ch === '*') return op('∗', 'bin')
    if (ch === '|' || ch === '/') return op(ch, 'ord')
    return op(ch, kind)
  }

  private command(t: Token): MathNode | null {
    const name = t.value
    const macro = this.macros[name]
    if (macro !== undefined) return this.expand(t, macro)

    if (name in LETTERS) return { type: 'ident', text: this.font && this.font !== 'normal' ? styled(LETTERS[name]!, this.font) : LETTERS[name]! }
    if (name in BINARY) return op(BINARY[name]!, 'bin')
    if (name in RELATIONS) return op(RELATIONS[name]!, 'rel')
    if (name in PUNCT) return op(PUNCT[name]!, name === 'colon' ? 'punct' : 'ord')
    if (name in LARGE) return { type: 'op', text: LARGE[name]!, kind: 'large', movableLimits: true }
    if (name in INTEGRALS) return { type: 'op', text: INTEGRALS[name]!, kind: 'large' }
    if (FUNCTIONS.has(name)) return { type: 'ident', text: name, upright: true }
    if (LIMIT_FUNCTIONS.has(name)) return { type: 'op', text: FUNCTION_TEXT[name] ?? name, kind: 'prefix', movableLimits: true }
    if (name in SPACES) return { type: 'space', width: SPACES[name]! }
    // A delimiter by name (`\\langle`, `\\lfloor`, `\\vert`): as it is, not stretched, outside `\\left`.
    if (name.length > 1 && DELIMITERS[name]) {
      const sign = DELIMITERS[name]!
      return op(sign, OPENING.has(sign) || name.startsWith('l') ? 'open' : name === 'vert' || name === 'Vert' ? 'ord' : 'close')
    }
    if (name in SIZES) return { ...this.delimiter(), stretchy: true, size: SIZES[name]! }
    if (name in ACCENTS) {
      const a = ACCENTS[name]!
      return { type: 'accent', base: this.argument(), mark: a.mark, under: a.under, stretchy: a.stretchy }
    }
    if (name in FONT_COMMANDS && !name.startsWith('text')) {
      const font = this.font
      this.font = FONT_COMMANDS[name]!
      const body = this.argument()
      this.font = font
      return body
    }
    switch (name) {
      case '{':
      case '}':
        return op(name === '{' ? '{' : '}', name === '{' ? 'open' : 'close')
      case '|':
        return op('‖', 'ord')
      case '#':
      case '$':
      case '%':
      case '&':
      case '_':
        return { type: 'ident', text: name, upright: true }
      case ' ':
        return { type: 'space', width: 1 / 3 }
      case '\\':
      case 'cr':
        throw new MathError('A line break outside a table', t.pos)
      case 'frac':
      case 'dfrac':
      case 'tfrac':
      case 'cfrac': {
        const num = this.argument()
        const den = this.argument()
        return { type: 'frac', num, den, style: name === 'dfrac' || name === 'cfrac' ? 'display' : name === 'tfrac' ? 'text' : undefined }
      }
      case 'binom':
      case 'dbinom':
      case 'tbinom':
      case 'choose': {
        const num = this.argument()
        const den = this.argument()
        return {
          type: 'fenced',
          open: '(',
          close: ')',
          body: { type: 'frac', num, den, thickness: 0, style: name === 'dbinom' ? 'display' : name === 'tbinom' ? 'text' : undefined },
        }
      }
      case 'sqrt': {
        let index: MathNode | undefined
        if (this.isChar(this.peek(), '[')) {
          this.i++
          this.enter()
          index = row(this.expression(']'))
          this.depth--
          this.expect(']')
        }
        return { type: 'sqrt', body: this.argument(), index }
      }
      case 'left': {
        const open = this.delimiter().text
        this.enter()
        const parts: MathNode[] = []
        for (;;) {
          parts.push(...this.expression('right'))
          const end = this.next()
          if (this.isCommand(end, 'middle')) {
            parts.push({ ...this.delimiter(), kind: 'rel', stretchy: true })
            continue
          }
          if (!this.isCommand(end, 'right')) throw new MathError('\\left without \\right', t.pos)
          break
        }
        this.depth--
        const close = this.delimiter().text
        return { type: 'fenced', open, close, body: row(parts) }
      }
      case 'right':
        throw new MathError('\\right without \\left', t.pos)
      case 'middle':
        throw new MathError('\\middle outside \\left … \\right', t.pos)
      case 'text':
      case 'textrm':
      case 'textnormal':
      case 'textup':
      case 'mbox':
      case 'hbox':
      case 'textbf':
      case 'textit':
      case 'textsf':
      case 'texttt':
      case 'textmd': {
        const text = this.text()
        const font = FONT_COMMANDS[name]
        return { type: 'text', text: font && font !== 'normal' ? styled(text, font) : text }
      }
      case 'operatorname':
      case 'operatornamewithlimits': {
        const star = this.isChar(this.tokens[this.i], '*')
        if (star) this.i++
        const text = this.textArgument().replace(/\\,|\\ /g, ' ').replace(/[{}\\]/g, '').trim()
        return star || name === 'operatornamewithlimits' ? { type: 'op', text, kind: 'prefix', movableLimits: true } : { type: 'ident', text, upright: true }
      }
      case 'overset':
      case 'underset':
      case 'stackrel': {
        const mark = this.argument()
        const base = this.argument()
        return name === 'underset' ? { type: 'scripts', base, sub: mark, over: true } : { type: 'scripts', base: { ...base }, sup: mark, over: true }
      }
      case 'not': {
        const next = this.atom(true)
        if (next?.type === 'op' && NEGATED[next.text]) return { ...next, text: NEGATED[next.text]!, kind: 'rel' }
        if (next?.type === 'op' || next?.type === 'ident') return { ...next, text: next.text + '̸' } as MathNode
        return op('/', 'rel')
      }
      case 'mod':
        return row([{ type: 'space', width: 1 }, { type: 'ident', text: 'mod', upright: true }, { type: 'space', width: 1 / 3 }])
      case 'bmod':
        return op('mod', 'bin')
      case 'pmod':
        return row([{ type: 'space', width: 1 }, op('(', 'open'), { type: 'ident', text: 'mod', upright: true }, { type: 'space', width: 1 / 3 }, this.argument(), op(')', 'close')])
      case 'hspace':
      case 'hskip':
      case 'kern':
      case 'mkern':
      case 'mskip': {
        const star = this.isChar(this.tokens[this.i], '*')
        if (star) this.i++
        return { type: 'space', width: emOf(this.dimension(), t.pos) }
      }
      case 'textcolor':
      case 'colorbox': {
        const color = safeColor(this.textArgument(), t.pos)
        if (name === 'colorbox') return { type: 'style', color, body: { type: 'text', text: this.text() } }
        return { type: 'style', color, body: this.argument() }
      }
      case 'phantom':
      case 'hphantom':
      case 'vphantom':
        return { type: 'phantom', body: this.argument() }
      case 'boxed':
        return { type: 'boxed', body: this.argument() }
      case 'fbox':
        return { type: 'boxed', body: { type: 'text', text: this.text() } }
      case 'begin':
        return this.environment(t)
      case 'end':
        throw new MathError('\\end without \\begin', t.pos)
      case 'displaystyle':
      case 'textstyle':
      case 'scriptstyle':
      case 'scriptscriptstyle':
      case 'color':
        // Met only as an argument (`x^\displaystyle…`): a style over nothing.
        return null
      case 'label':
      case 'nonumber':
      case 'notag':
      case 'tag':
      case 'hline':
      case 'displaylimits':
        if (name === 'label' || name === 'tag') this.textArgument()
        return null
      case 'limits':
      case 'nolimits':
        return null
    }
    throw new MathError(`Unknown command \\${name}`, t.pos)
  }

  /** `\text{…}`: the text as written, spaces kept, `\{` and the like as their signs, `$…$` inside as it is. */
  private text(): string {
    const t = this.peek()
    if (!this.isChar(t, '{')) {
      const one = this.next()
      return one?.value ?? ''
    }
    this.i++
    let out = ''
    let level = 0
    for (;;) {
      const n = this.next(false)
      if (!n) throw new MathError('A "{" is not closed', this.tex.length)
      if (n.kind === 'char' && n.value === '{') {
        level++
        continue
      }
      if (n.kind === 'char' && n.value === '}') {
        if (level === 0) return out.replace(/\s+/g, ' ')
        level--
        continue
      }
      if (n.kind === 'command') out += n.value === ' ' || n.value === ',' || n.value === ';' || n.value === 'quad' ? ' ' : n.value.length === 1 ? n.value : n.value === 'textbackslash' ? '\\' : ''
      else out += n.value
    }
  }

  /** A delimiter after `\left`, `\right`, `\big`…: a sign, or a command naming one. */
  private delimiter(): { type: 'op'; text: string; kind: OpKind; stretchy: boolean } {
    const t = this.next()
    if (!t) throw new MathError('A delimiter is missing', this.tex.length)
    const key = t.kind === 'command' && t.value.length === 1 ? `\\${t.value}` : t.value
    const text = DELIMITERS[key]
    if (text === undefined) throw new MathError(`Not a delimiter: ${t.kind === 'command' ? '\\' : ''}${t.value}`, t.pos)
    return { type: 'op', text, kind: OPENING.has(text) ? 'open' : 'close', stretchy: true }
  }

  /** `\begin{name} … \end{name}`: a table of the environment's kind. */
  private environment(t: Token): MathNode {
    const name = this.textArgument()
    const env = ENVIRONMENTS[name]
    if (!env) throw new MathError(`Unknown environment ${name}`, t.pos)
    let align = env.align ?? ['c']
    let lines: ('none' | 'solid')[] | undefined
    if (name === 'array' || name === 'darray' || name === 'subarray') {
      // The column spec: l, c, r and | between them.
      const spec = this.textArgument()
      align = []
      lines = []
      for (const ch of spec.replace(/@\{[^}]*\}/g, '')) {
        if (ch === '|') {
          if (align.length > 0) lines[align.length - 1] = 'solid'
        } else if (ch === 'l' || ch === 'c' || ch === 'r') {
          align.push(ch)
          lines[align.length - 1] ??= 'none'
        }
      }
      if (align.length === 0) align = ['c']
      lines = lines.slice(0, Math.max(0, align.length - 1)).map((l) => l ?? 'none')
    } else if (name === 'alignat' || name === 'alignat*' || name === 'alignedat') this.textArgument()
    // `[t]`, `[c]`: the vertical placement is not kept.
    if (this.isChar(this.peek(), '[')) this.textUntil(']')
    this.enter()
    const rows = this.rows('end')
    this.depth--
    const end = this.next()
    if (!this.isCommand(end, 'end')) throw new MathError('An environment is not ended', this.pos())
    const closing = this.textArgument()
    if (closing !== name) throw new MathError(`\\begin{${name}} ended by \\end{${closing}}`, end!.pos)
    const cells = env.display ? rows.map((r) => r.map((c) => ({ type: 'style', body: c, display: true }) as MathNode)) : rows
    return {
      type: 'table',
      rows: cells,
      align,
      lines: lines && lines.some((l) => l === 'solid') ? lines : undefined,
      aligned: env.aligned,
      open: env.open,
      close: env.close,
      small: env.small,
    }
  }

  /** A macro of the writer's: its text, arguments put in, parsed in place. */
  private expand(t: Token, body: string): MathNode | null {
    if (++this.expansions > MAX_EXPANSIONS) throw new MathError('Macros expand too many times', t.pos)
    const count = Math.max(0, ...[...body.matchAll(/#([1-9])/g)].map((m) => Number(m[1])))
    const args: Token[][] = []
    for (let k = 0; k < count; k++) {
      const a = this.peek()
      if (!a) throw new MathError(`\\${t.value} takes ${count} arguments`, t.pos)
      if (this.isChar(a, '{')) {
        const start = this.i + 1
        this.textUntil('}')
        args.push(this.tokens.slice(start, this.i - 1))
      } else args.push([this.next()!])
    }
    const expanded: Token[] = []
    for (const token of tokenize(body, t.pos)) {
      // `#1` in the body: the argument's tokens.
      expanded.push(token)
      const last = expanded.length - 2
      if (token.kind === 'char' && /[1-9]/.test(token.value) && expanded[last]?.kind === 'char' && expanded[last]!.value === '#') {
        expanded.splice(last, 2, { kind: 'char', value: '{', pos: t.pos }, ...(args[Number(token.value) - 1] ?? []), { kind: 'char', value: '}', pos: t.pos })
      }
    }
    if (this.tokens.length + expanded.length > MAX_TOKENS) throw new MathError('The formula is too long', t.pos)
    this.tokens.splice(this.i, 0, { kind: 'char', value: '{', pos: t.pos }, ...expanded, { kind: 'char', value: '}', pos: t.pos })
    return this.atom()
  }
}

const STYLE_SWITCHES: Record<string, { display?: boolean; scriptLevel?: number }> = {
  displaystyle: { display: true, scriptLevel: 0 },
  textstyle: { display: false, scriptLevel: 0 },
  scriptstyle: { display: false, scriptLevel: 1 },
  scriptscriptstyle: { display: false, scriptLevel: 2 },
}

function op(text: string, kind: OpKind): MathNode {
  return { type: 'op', text, kind }
}

/** A list as one node: itself when one, a row otherwise. */
export function row(children: MathNode[]): MathNode {
  return children.length === 1 ? children[0]! : { type: 'row', children }
}

function isEmpty(node: MathNode): boolean {
  return node.type === 'row' && node.children.length === 0
}

/** Whether scripts on a base go under and over it: big operators and limit functions (movable when inline), braces. */
function takesLimits(base: MathNode): boolean {
  if (base.type === 'op') return base.movableLimits === true
  if (base.type === 'accent') return base.mark === '⏞' || base.mark === '⏟'
  return false
}
