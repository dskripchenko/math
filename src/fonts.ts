/**
 * Letter styles (`\mathbf`, `\mathbb`, `\mathcal`…) as the characters
 * Unicode has for them: MathML Core has no `mathvariant` beyond `normal`, and
 * the Mathematical Alphanumeric Symbols draw the same in any math font.
 */

export type Font = 'normal' | 'bold' | 'italic' | 'bold-italic' | 'double-struck' | 'script' | 'bold-script' | 'fraktur' | 'bold-fraktur' | 'sans-serif' | 'bold-sans-serif' | 'sans-serif-italic' | 'monospace'

/** Where a style's capitals, small letters and digits start (null: no digits in that style). */
const BASES: Record<Exclude<Font, 'normal'>, { upper: number; lower: number; digit: number | null }> = {
  bold: { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
  italic: { upper: 0x1d434, lower: 0x1d44e, digit: null },
  'bold-italic': { upper: 0x1d468, lower: 0x1d482, digit: 0x1d7ce },
  script: { upper: 0x1d49c, lower: 0x1d4b6, digit: null },
  'bold-script': { upper: 0x1d4d0, lower: 0x1d4ea, digit: 0x1d7ce },
  fraktur: { upper: 0x1d504, lower: 0x1d51e, digit: null },
  'double-struck': { upper: 0x1d538, lower: 0x1d552, digit: 0x1d7d8 },
  'bold-fraktur': { upper: 0x1d56c, lower: 0x1d586, digit: 0x1d7ce },
  'sans-serif': { upper: 0x1d5a0, lower: 0x1d5ba, digit: 0x1d7e2 },
  'bold-sans-serif': { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  'sans-serif-italic': { upper: 0x1d608, lower: 0x1d622, digit: 0x1d7e2 },
  monospace: { upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 },
}

/** The letters Unicode had before the block: their place in it is empty. */
const HOLES: Partial<Record<Font, Record<string, string>>> = {
  italic: { h: 'ℎ' },
  script: { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' },
  fraktur: { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' },
  'double-struck': { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' },
}

/** Bold and bold italic Greek: where capitals Α–Ω and small α–ω start. */
const GREEK: Partial<Record<Font, { upper: number; lower: number }>> = {
  bold: { upper: 0x1d6a8, lower: 0x1d6c2 },
  'bold-italic': { upper: 0x1d71c, lower: 0x1d736 },
}

/** A text in a letter style: Latin letters and digits mapped, anything else as it is. */
export function styled(text: string, font: Font): string {
  if (font === 'normal') return text
  const base = BASES[font]
  const holes = HOLES[font] ?? {}
  const greek = GREEK[font]
  let out = ''
  for (const ch of text) {
    const code = ch.codePointAt(0)!
    if (holes[ch]) out += holes[ch]
    else if (code >= 65 && code <= 90) out += String.fromCodePoint(base.upper + code - 65)
    else if (code >= 97 && code <= 122) out += String.fromCodePoint(base.lower + code - 97)
    else if (code >= 48 && code <= 57 && base.digit !== null) out += String.fromCodePoint(base.digit + code - 48)
    else if (greek && code >= 0x391 && code <= 0x3a9) out += String.fromCodePoint(greek.upper + code - 0x391)
    else if (greek && code >= 0x3b1 && code <= 0x3c9) out += String.fromCodePoint(greek.lower + code - 0x3b1)
    else out += ch
  }
  return out
}

/** The style a command sets. */
export const FONT_COMMANDS: Record<string, Font> = {
  mathrm: 'normal', mathup: 'normal', textrm: 'normal', mathbf: 'bold', textbf: 'bold', bf: 'bold', mathit: 'italic',
  textit: 'italic', mathbb: 'double-struck', Bbb: 'double-struck', mathcal: 'script', mathscr: 'script', mathfrak: 'fraktur',
  mathsf: 'sans-serif', textsf: 'sans-serif', mathtt: 'monospace', texttt: 'monospace', boldsymbol: 'bold-italic',
  bm: 'bold-italic', pmb: 'bold-italic', mathbfit: 'bold-italic', mathsfit: 'sans-serif-italic',
}
