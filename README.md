# @dskripchenko/math

[![CI](https://github.com/dskripchenko/math/actions/workflows/ci.yml/badge.svg)](https://github.com/dskripchenko/math/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@dskripchenko/math.svg)](https://www.npmjs.com/package/@dskripchenko/math)
[![license](https://img.shields.io/npm/l/@dskripchenko/math.svg)](LICENSE)

TeX math to MathML — with **no runtime dependencies**, **no fonts to ship**
and **no DOM**. A string goes in, a `<math>` element comes out, and the
browser's own MathML draws it: in Chromium, Firefox and Safari, on screen, on
paper and in a PDF.

```ts
import { checkMath, MATH_CSS, parseMath, renderMath, texOf } from '@dskripchenko/math'

element.innerHTML = renderMath('x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}')
element.innerHTML = renderMath('\\sum_{i=1}^n i = \\frac{n(n+1)}{2}', { display: true })

// A math font, so that fences and roots stretch; the look of an error.
style.textContent = MATH_CSS

// Your own commands, with arguments.
renderMath('\\norm{\\R^n}', { macros: { R: '\\mathbb{R}', norm: '\\left\\|#1\\right\\|' } })

// TeX that cannot be read: shown as written, the reason in its title — or a MathError.
renderMath('\\frac{1}') // <span class="dsk-math-error" title="An argument is missing">\frac{1}</span>
checkMath('a + \\nope') // MathError { message: 'Unknown command \\nope', position: 4 }

// The TeX back from a drawn formula (it is kept in an annotation).
texOf(document.querySelector('math')!) // 'x = \\frac{-b …'

// The formula as a tree, for a renderer of your own.
parseMath('x^2') // { type: 'scripts', base: { type: 'ident', text: 'x' }, sup: { type: 'number', text: '2' }, over: false }
```

**What it reads** — the LaTeX math people write in notes, papers and docs:
letters and numbers, sub- and superscripts and primes; `\frac`, `\dfrac`,
`\binom`, `\sqrt[n]`; Greek, operators, relations, arrows, `\not`; big
operators with limits (`\sum`, `\prod`, `\int`, `\limits`); function names
(`\sin`, `\lim`, `\max`, `\operatorname`); stretching fences (`\left`,
`\middle`, `\right`, `\big`…); accents and braces (`\hat`, `\vec`,
`\overline`, `\overbrace`, `\underbrace`, `\overset`); letter styles
(`\mathbb`, `\mathbf`, `\mathcal`, `\mathfrak`, `\mathsf`, `\mathtt`,
`\boldsymbol`); `\text`; spaces; colours; `\boxed`; matrices, `cases`,
`aligned`, `gathered`, `array`; macros of your own.

## What it promises

- **MathML Core.** Only what every engine with MathML draws: letter styles
  as Unicode's mathematical letters, alignment and lines in the cells' style.
- **Errors, not guesses.** An unknown command or an unclosed group is an
  error with its place in the TeX.
- **Escaped output.** Nothing in the TeX becomes markup; a colour is a name
  or a hex value, nothing else.
- **Bounded work.** Nesting, length and macro expansion are limited:
  pathological input fails fast.
- **Small.** About 14 KB gzipped (before your bundler minifies it).

Fences, roots and big operators stretch only in a font with an OpenType MATH
table: `MATH_CSS` names STIX Two Math (macOS), Cambria Math (Windows), Latin
Modern Math and Noto Sans Math. Where none is installed, the page provides one.

## Documentation

| | | | | |
|---|---|---|---|---|
| Getting started: API, what is supported, fonts, errors | [en](docs/en/getting-started.md) | [ru](docs/ru/getting-started.md) | [de](docs/de/getting-started.md) | [zh](docs/zh/getting-started.md) |

## Install

```bash
npm install @dskripchenko/math
```

## License

[MIT](LICENSE)
