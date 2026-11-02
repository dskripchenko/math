/**
 * TeX math to MathML, with no dependencies: the commonly written subset of
 * LaTeX math, drawn by the browser's own MathML (MathML Core).
 */
import type { MathNode } from './ast'
import { escape, toMathML } from './mathml'
import { MathError, Parser, type ParseOptions } from './parser'

export type { MathNode, OpKind } from './ast'
export type { Font } from './fonts'
export { MathError } from './parser'
export { toMathML } from './mathml'

export interface MathOptions extends ParseOptions {
  /** A formula on its own line (`$$…$$`): big operators take limits under and over, fractions are full size. */
  display?: boolean
  /** Throw a `MathError` for TeX that cannot be read, rather than show the TeX marked as an error. */
  throwOnError?: boolean
}

/** The formula as a tree. Throws `MathError` for TeX it cannot read. */
export function parseMath(tex: string, options: ParseOptions = {}): MathNode {
  return new Parser(tex, options).parse()
}

/**
 * The formula as a `<math>` element: MathML Core, its TeX kept in an
 * annotation (copied with it, read back by `texOf`). TeX it cannot read comes
 * out as a `<span class="dsk-math-error">` with the TeX and the reason in its
 * title — or throws, with `throwOnError`.
 */
export function renderMath(tex: string, options: MathOptions = {}): string {
  let body: string
  try {
    body = toMathML(parseMath(tex, options))
  } catch (e) {
    if (options.throwOnError || !(e instanceof MathError)) throw e
    return `<span class="dsk-math-error" title="${escape(e.message)}">${escape(tex)}</span>`
  }
  const display = options.display ? ' display="block"' : ''
  return `<math xmlns="http://www.w3.org/1998/Math/MathML" class="dsk-math"${display}><semantics><mrow>${body}</mrow><annotation encoding="application/x-tex">${escape(tex)}</annotation></semantics></math>`
}

/** Whether a formula can be read: null when it can, the error (with its place) when not. */
export function checkMath(tex: string, options: ParseOptions = {}): MathError | null {
  try {
    parseMath(tex, options)
    return null
  } catch (e) {
    if (e instanceof MathError) return e
    throw e
  }
}

/** The TeX a drawn formula was made from (its annotation, or an error's text); null for anything else. */
export function texOf(element: Element): string | null {
  if (element.localName === 'math') return element.querySelector('annotation[encoding="application/x-tex"]')?.textContent ?? null
  if (element.classList.contains('dsk-math-error')) return element.textContent
  return null
}

/**
 * The page's part: a math font for the formulas (only a font with an OpenType
 * MATH table lets fences, roots and big operators stretch — STIX Two Math on
 * macOS, Cambria Math on Windows; elsewhere one the page provides), a displayed
 * formula's margins, and the look of TeX that could not be read.
 */
export const MATH_CSS = `math.dsk-math{font-family:"STIX Two Math","Cambria Math","Latin Modern Math","Noto Sans Math",math}
math.dsk-math[display="block"]{margin:.75em 0}
.dsk-math-error{color:#d1242f;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;border-bottom:1px dotted}`
