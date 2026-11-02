/**
 * A formula as a tree: what the parser makes of the TeX and what the MathML
 * writer draws. Each node is a construct of MathML Core.
 */
import type { Font } from './fonts'

/** How an operator sits: a binary operation, a relation, a fence, punctuation, a big operator. */
export type OpKind = 'bin' | 'rel' | 'open' | 'close' | 'punct' | 'large' | 'ord' | 'prefix'

export type MathNode =
  /** An identifier: a letter, a name; `upright` for a name set as text (`sin`, `\mathrm{d}`). */
  | { type: 'ident'; text: string; upright?: boolean }
  | { type: 'number'; text: string }
  | {
      type: 'op'
      text: string
      kind: OpKind
      /** Stretches to its content (a fence), or to a fixed height in em (`\big`). */
      stretchy?: boolean
      size?: number
      /** A big operator's limits go under and over when the formula is displayed. */
      movableLimits?: boolean
    }
  | { type: 'text'; text: string }
  | { type: 'space'; width: number }
  | { type: 'row'; children: MathNode[] }
  /** Scripts beside the base (`x_1^2`), or under and over it (`\sum_{i}^{n}` displayed, `\overset`). */
  | { type: 'scripts'; base: MathNode; sub?: MathNode; sup?: MathNode; over?: boolean }
  /** A fraction; `thickness: 0` for a binomial's stack, `style` for `\dfrac` and `\tfrac`. */
  | { type: 'frac'; num: MathNode; den: MathNode; thickness?: 0; style?: 'display' | 'text' }
  | { type: 'sqrt'; body: MathNode; index?: MathNode }
  /** Content between stretching fences (`\left( … \right)`), with the `\middle` ones inside. */
  | { type: 'fenced'; open: string; close: string; body: MathNode }
  /** A mark over or under the base: a hat, a bar, a brace. */
  | { type: 'accent'; base: MathNode; mark: string; under?: boolean; stretchy?: boolean }
  /** Rows and cells: a matrix, cases, aligned equations, an array. */
  | {
      type: 'table'
      rows: MathNode[][]
      /** Each column's alignment; the last repeats. */
      align: ('l' | 'c' | 'r')[]
      /** Lines between columns (`array{c|c}`). */
      lines?: ('none' | 'solid')[]
      /** Aligned equations: columns paired right-left, no space between a pair. */
      aligned?: boolean
      /** A matrix's or cases' own fences. */
      open?: string
      close?: string
      small?: boolean
    }
  | { type: 'style'; body: MathNode; display?: boolean; scriptLevel?: number; color?: string }
  | { type: 'phantom'; body: MathNode }
  | { type: 'boxed'; body: MathNode }

/** A node's style of letters, kept while parsing. */
export interface ParseState {
  font: Font | null
}
