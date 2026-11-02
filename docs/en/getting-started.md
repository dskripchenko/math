# Getting started

`@dskripchenko/math` turns TeX math into MathML. The browser draws MathML
itself (MathML Core: Chromium 109+, Firefox, Safari), so the package ships no
layout engine and no fonts — only a parser and a writer.

```bash
npm install @dskripchenko/math
```

## API

| | |
|---|---|
| `renderMath(tex, options?)` | A `<math class="dsk-math">` element as a string; TeX that cannot be read becomes `<span class="dsk-math-error" title="reason">tex</span>`. |
| `parseMath(tex, options?)` | The formula as a tree (`MathNode`); throws `MathError`. |
| `toMathML(node)` | A tree as MathML (without the `<math>` wrapper). |
| `checkMath(tex, options?)` | `null` when the TeX can be read, the `MathError` otherwise — for an editor's marks. |
| `texOf(element)` | The TeX a drawn formula was made from (kept in its `<annotation>`); for copying and for editors. |
| `MATH_CSS` | The CSS the page needs: a math font, a displayed formula's margins, the look of an error. |
| `MathError` | `message` and `position` — the offset in the TeX where it went wrong. |

Options:

| | |
|---|---|
| `display` | A formula on a line of its own (`$$…$$`, `\[…\]`): `display="block"`, limits under and over big operators, full-size fractions. |
| `throwOnError` | Throw a `MathError` instead of showing the TeX marked as an error. |
| `macros` | Commands of your own: `{ R: '\\mathbb{R}', norm: '\\left\\|#1\\right\\|' }`; `#1`…`#9` are arguments. |

```ts
import { MATH_CSS, renderMath } from '@dskripchenko/math'

document.head.append(Object.assign(document.createElement('style'), { textContent: MATH_CSS }))
inline.innerHTML = renderMath('e^{i\\pi} + 1 = 0')
block.innerHTML = renderMath('\\int_0^1 x^2\\,dx = \\frac{1}{3}', { display: true })
```

## What is supported

- **Letters, numbers, signs.** Letters are variables (italic), numbers keep
  their decimal point, `-` is a minus, `*` an asterisk operator.
- **Scripts.** `x_i`, `x^2`, `x_i^2`, `x^{n+1}`, primes `f'`, `f''`; a script
  with no base sits on an empty one.
- **Fractions and roots.** `\frac`, `\dfrac`, `\tfrac`, `\cfrac`, `\binom`,
  `\dbinom`, `\tbinom`, `\sqrt`, `\sqrt[n]`; one-digit arguments need no
  braces (`\frac12`).
- **Symbols.** Greek letters (with `\var…` forms), operators (`\pm`,
  `\times`, `\cdot`, `\cup`, `\oplus`…), relations (`\le`, `\ne`, `\approx`,
  `\equiv`, `\subseteq`, `\in`…), arrows (`\to`, `\Rightarrow`, `\iff`,
  `\mapsto`…), `\infty`, `\partial`, `\nabla`, `\forall`, `\exists`, dots
  (`\ldots`, `\cdots`, `\vdots`, `\ddots`); `\not` before a relation.
- **Big operators.** `\sum`, `\prod`, `\bigcup`, `\bigoplus`… take limits under
  and over in a displayed formula and beside inline; integrals (`\int`,
  `\iint`, `\oint`…) beside unless `\limits`; `\nolimits` the other way.
- **Function names.** `\sin`, `\cos`, `\log`, `\ln`, `\exp`, `\det`… upright,
  followed by a thin space; `\lim`, `\max`, `\min`, `\sup`, `\inf`, `\gcd`…
  with limits; `\operatorname{name}` and `\operatorname*{name}` (with limits).
- **Fences.** `\left( … \middle| … \right)` stretch to their content; `.` for
  an empty side; `\big`, `\Big`, `\bigg`, `\Bigg` (and their `l`, `r`, `m`
  forms) for a fixed size; plain brackets do not stretch, as in TeX.
- **Accents.** `\hat`, `\widehat`, `\bar`, `\overline`, `\vec`,
  `\overrightarrow`, `\dot`, `\ddot`, `\tilde`, `\widetilde`, `\check`,
  `\breve`, `\acute`, `\grave`, `\underline`, `\overbrace{…}^{…}`,
  `\underbrace{…}_{…}`, `\overset`, `\underset`, `\stackrel`.
- **Letter styles.** `\mathbb`, `\mathbf`, `\mathit`, `\mathcal`, `\mathscr`,
  `\mathfrak`, `\mathsf`, `\mathtt`, `\mathrm`, `\boldsymbol`, `\bm` — as
  Unicode's mathematical letters (𝔸, 𝐀, 𝒜…), which MathML Core draws in any
  math font.
- **Text.** `\text`, `\textbf`, `\textit`, `\mbox`… keep their spaces.
- **Spaces.** `\,`, `\:`, `\;`, `\!`, `\quad`, `\qquad`, `\ `, `~`,
  `\hspace{…}`, `\kern`, `\mkern` (in em, ex, mu, pt…).
- **Colour and boxes.** `\color{red}` (to the end of the group),
  `\textcolor{#0969da}{…}`, `\colorbox`, `\boxed`, `\fbox`, `\phantom`.
- **Styles.** `\displaystyle`, `\textstyle`, `\scriptstyle`,
  `\scriptscriptstyle`.
- **Tables.** `matrix`, `pmatrix`, `bmatrix`, `Bmatrix`, `vmatrix`,
  `Vmatrix`, `smallmatrix`, `cases`, `dcases`, `rcases`, `aligned`, `align`,
  `alignat`, `split`, `gathered`, `gather`, `multline`, `equation`, `array`
  (column alignment and `|` lines), `subarray`; `\\` and `&` at the top make
  aligned or gathered lines.
- **Modular arithmetic.** `\bmod`, `\pmod{m}`, `\mod`.
- **Comments.** `%` to the end of the line.

What is not: TeX's own programming (`\def`, `\newcommand`, `\if`…) —
`macros` covers the common need; `\tag` and `\label` are read and dropped.

## Fonts

MathML is drawn with the page's font unless told otherwise, and fences, roots
and big operators stretch only in a font with an OpenType MATH table.
`MATH_CSS` sets:

```css
math.dsk-math { font-family: "STIX Two Math", "Cambria Math", "Latin Modern Math", "Noto Sans Math", math; }
```

STIX Two Math comes with macOS, Cambria Math with Windows. On Linux, install
one (`fonts-stix`, `fonts-lmodern`) or serve one with the page — Latin Modern
Math and STIX Two Math are under the SIL Open Font License.

## Errors

```ts
import { checkMath, parseMath } from '@dskripchenko/math'

checkMath('\\frac{1}') // MathError: An argument is missing (position 8)
checkMath('\\frac{1}{') // MathError: A "{" is not closed (position 9)
parseMath('\\left( x') // throws MathError: \left without \right
```

`renderMath` shows the TeX of a formula it cannot read in a
`.dsk-math-error` span, with the reason in its `title`, so a document with a
mistake is still readable. With `throwOnError` it throws instead.

## The tree

`parseMath` gives `MathNode`s — `ident`, `number`, `op` (with its kind: `bin`,
`rel`, `open`, `close`, `punct`, `large`, `prefix`, `ord`), `text`, `space`,
`row`, `scripts`, `frac`, `sqrt`, `fenced`, `accent`, `table`, `style`,
`phantom`, `boxed` — for drawing a formula another way, or for checking it.
