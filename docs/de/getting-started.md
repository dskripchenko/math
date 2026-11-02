# Erste Schritte

`@dskripchenko/math` wandelt TeX-Mathematik in MathML um. Den MathML-Satz
übernimmt der Browser selbst (MathML Core: Chromium 109+, Firefox, Safari);
das Paket bringt daher weder eine Layout-Engine noch Schriften mit — nur einen
Parser und einen Writer.

```bash
npm install @dskripchenko/math
```

## API

| | |
|---|---|
| `renderMath(tex, options?)` | Ein `<math class="dsk-math">`-Element als String; TeX, das sich nicht lesen lässt, wird zu `<span class="dsk-math-error" title="reason">tex</span>`. |
| `parseMath(tex, options?)` | Die Formel als Baum (`MathNode`); wirft `MathError`. |
| `toMathML(node)` | Ein Baum als MathML (ohne den `<math>`-Wrapper). |
| `checkMath(tex, options?)` | `null`, wenn sich das TeX lesen lässt, sonst der `MathError` — für Markierungen in einem Editor. |
| `texOf(element)` | Das TeX, aus dem eine gezeichnete Formel entstanden ist (in ihrer `<annotation>` abgelegt); zum Kopieren und für Editoren. |
| `MATH_CSS` | Das CSS, das die Seite braucht: eine Mathe-Schrift, die Abstände einer abgesetzten Formel, das Aussehen eines Fehlers. |
| `MathError` | `message` und `position` — der Offset im TeX, an dem es schiefging. |

Optionen:

| | |
|---|---|
| `display` | Eine Formel auf einer eigenen Zeile (`$$…$$`, `\[…\]`): `display="block"`, Grenzen unter und über großen Operatoren, Brüche in voller Größe. |
| `throwOnError` | Einen `MathError` werfen, statt das TeX als Fehler markiert anzuzeigen. |
| `macros` | Eigene Befehle: `{ R: '\\mathbb{R}', norm: '\\left\\|#1\\right\\|' }`; `#1`…`#9` sind Argumente. |

```ts
import { MATH_CSS, renderMath } from '@dskripchenko/math'

document.head.append(Object.assign(document.createElement('style'), { textContent: MATH_CSS }))
inline.innerHTML = renderMath('e^{i\\pi} + 1 = 0')
block.innerHTML = renderMath('\\int_0^1 x^2\\,dx = \\frac{1}{3}', { display: true })
```

## Was unterstützt wird

- **Buchstaben, Zahlen, Zeichen.** Buchstaben sind Variablen (kursiv), Zahlen
  behalten ihren Dezimalpunkt, `-` ist ein Minus, `*` ein Sternoperator.
- **Indizes und Exponenten.** `x_i`, `x^2`, `x_i^2`, `x^{n+1}`, Striche `f'`,
  `f''`; ein Index ohne Basis sitzt auf einer leeren Basis.
- **Brüche und Wurzeln.** `\frac`, `\dfrac`, `\tfrac`, `\cfrac`, `\binom`,
  `\dbinom`, `\tbinom`, `\sqrt`, `\sqrt[n]`; einstellige Argumente brauchen
  keine Klammern (`\frac12`).
- **Symbole.** Griechische Buchstaben (auch die `\var…`-Formen), Operatoren
  (`\pm`, `\times`, `\cdot`, `\cup`, `\oplus`…), Relationen (`\le`, `\ne`,
  `\approx`, `\equiv`, `\subseteq`, `\in`…), Pfeile (`\to`, `\Rightarrow`,
  `\iff`, `\mapsto`…), `\infty`, `\partial`, `\nabla`, `\forall`, `\exists`,
  Punkte (`\ldots`, `\cdots`, `\vdots`, `\ddots`); `\not` vor einer Relation.
- **Große Operatoren.** `\sum`, `\prod`, `\bigcup`, `\bigoplus`… setzen ihre
  Grenzen in einer abgesetzten Formel unter und über sich, im Fließtext
  daneben; Integrale (`\int`, `\iint`, `\oint`…) setzen sie daneben, außer bei
  `\limits`; `\nolimits` bewirkt das Gegenteil.
- **Funktionsnamen.** `\sin`, `\cos`, `\log`, `\ln`, `\exp`, `\det`…
  aufrecht, gefolgt von einem schmalen Leerraum; `\lim`, `\max`, `\min`,
  `\sup`, `\inf`, `\gcd`… mit Grenzen; `\operatorname{name}` und
  `\operatorname*{name}` (mit Grenzen).
- **Klammern.** `\left( … \middle| … \right)` passen sich dem Inhalt an; `.`
  für eine leere Seite; `\big`, `\Big`, `\bigg`, `\Bigg` (und ihre `l`-, `r`-,
  `m`-Formen) für eine feste Größe; einfache Klammern wachsen nicht mit, wie
  in TeX.
- **Akzente.** `\hat`, `\widehat`, `\bar`, `\overline`, `\vec`,
  `\overrightarrow`, `\dot`, `\ddot`, `\tilde`, `\widetilde`, `\check`,
  `\breve`, `\acute`, `\grave`, `\underline`, `\overbrace{…}^{…}`,
  `\underbrace{…}_{…}`, `\overset`, `\underset`, `\stackrel`.
- **Schriftstile.** `\mathbb`, `\mathbf`, `\mathit`, `\mathcal`, `\mathscr`,
  `\mathfrak`, `\mathsf`, `\mathtt`, `\mathrm`, `\boldsymbol`, `\bm` — als
  mathematische Buchstaben von Unicode (𝔸, 𝐀, 𝒜…), die MathML Core in jeder
  Mathe-Schrift darstellt.
- **Text.** `\text`, `\textbf`, `\textit`, `\mbox`… behalten ihre Leerzeichen.
- **Abstände.** `\,`, `\:`, `\;`, `\!`, `\quad`, `\qquad`, `\ `, `~`,
  `\hspace{…}`, `\kern`, `\mkern` (in em, ex, mu, pt…).
- **Farbe und Kästen.** `\color{red}` (bis zum Ende der Gruppe),
  `\textcolor{#0969da}{…}`, `\colorbox`, `\boxed`, `\fbox`, `\phantom`.
- **Stile.** `\displaystyle`, `\textstyle`, `\scriptstyle`,
  `\scriptscriptstyle`.
- **Tabellen.** `matrix`, `pmatrix`, `bmatrix`, `Bmatrix`, `vmatrix`,
  `Vmatrix`, `smallmatrix`, `cases`, `dcases`, `rcases`, `aligned`, `align`,
  `alignat`, `split`, `gathered`, `gather`, `multline`, `equation`, `array`
  (Spaltenausrichtung und `|`-Linien), `subarray`; `\\` und `&` auf oberster
  Ebene erzeugen ausgerichtete oder zentrierte Zeilen.
- **Modulare Arithmetik.** `\bmod`, `\pmod{m}`, `\mod`.
- **Kommentare.** `%` bis zum Zeilenende.

Was nicht unterstützt wird: TeX' eigene Programmierung (`\def`,
`\newcommand`, `\if`…) — den gängigen Bedarf deckt `macros` ab; `\tag` und
`\label` werden gelesen und verworfen.

## Schriften

MathML wird, wenn nichts anderes angegeben ist, in der Schrift der Seite
gesetzt, und Klammern, Wurzeln und große Operatoren wachsen nur in einer
Schrift mit OpenType-MATH-Tabelle mit. `MATH_CSS` setzt:

```css
math.dsk-math { font-family: "STIX Two Math", "Cambria Math", "Latin Modern Math", "Noto Sans Math", math; }
```

STIX Two Math wird mit macOS ausgeliefert, Cambria Math mit Windows. Unter
Linux installieren Sie eine davon (`fonts-stix`, `fonts-lmodern`) oder liefern
eine zusammen mit der Seite aus — Latin Modern Math und STIX Two Math stehen
unter der SIL Open Font License.

## Fehler

```ts
import { checkMath, parseMath } from '@dskripchenko/math'

checkMath('\\frac{1}') // MathError: An argument is missing (position 8)
checkMath('\\frac{1}{') // MathError: A "{" is not closed (position 9)
parseMath('\\left( x') // throws MathError: \left without \right
```

`renderMath` zeigt das TeX einer Formel, die sich nicht lesen lässt, in einem
`.dsk-math-error`-Span an, den Grund im zugehörigen `title`, sodass ein
Dokument mit einem Fehler trotzdem lesbar bleibt. Mit `throwOnError` wird
stattdessen eine Ausnahme geworfen.

## Der Baum

`parseMath` liefert `MathNode`s — `ident`, `number`, `op` (mit seiner Art:
`bin`, `rel`, `open`, `close`, `punct`, `large`, `prefix`, `ord`), `text`,
`space`, `row`, `scripts`, `frac`, `sqrt`, `fenced`, `accent`, `table`,
`style`, `phantom`, `boxed` — um eine Formel anders darzustellen oder sie zu
prüfen.
