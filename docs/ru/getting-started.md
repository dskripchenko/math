# Начало работы

`@dskripchenko/math` превращает математику на TeX в MathML. MathML браузер
рисует сам (MathML Core: Chromium 109+, Firefox, Safari), поэтому пакет не
содержит ни движка вёрстки, ни шрифтов — только парсер и генератор разметки.

```bash
npm install @dskripchenko/math
```

## API

| | |
|---|---|
| `renderMath(tex, options?)` | Элемент `<math class="dsk-math">` в виде строки; TeX, который не удалось прочитать, превращается в `<span class="dsk-math-error" title="reason">tex</span>`. |
| `parseMath(tex, options?)` | Формула в виде дерева (`MathNode`); бросает `MathError`. |
| `toMathML(node)` | Дерево в виде MathML (без обёртки `<math>`). |
| `checkMath(tex, options?)` | `null`, если TeX читается, иначе `MathError` — для пометок в редакторе. |
| `texOf(element)` | TeX, из которого нарисована формула (хранится в её `<annotation>`); для копирования и для редакторов. |
| `MATH_CSS` | CSS, нужный странице: математический шрифт, отступы выделенной формулы, вид ошибки. |
| `MathError` | `message` и `position` — смещение в TeX, где произошла ошибка. |

Параметры:

| | |
|---|---|
| `display` | Формула на отдельной строке (`$$…$$`, `\[…\]`): `display="block"`, пределы над и под крупными операторами, дроби полного размера. |
| `throwOnError` | Бросать `MathError` вместо показа TeX, помеченного как ошибка. |
| `macros` | Собственные команды: `{ R: '\\mathbb{R}', norm: '\\left\\|#1\\right\\|' }`; `#1`…`#9` — аргументы. |

```ts
import { MATH_CSS, renderMath } from '@dskripchenko/math'

document.head.append(Object.assign(document.createElement('style'), { textContent: MATH_CSS }))
inline.innerHTML = renderMath('e^{i\\pi} + 1 = 0')
block.innerHTML = renderMath('\\int_0^1 x^2\\,dx = \\frac{1}{3}', { display: true })
```

## Что поддерживается

- **Буквы, числа, знаки.** Буквы — переменные (курсив), числа сохраняют
  десятичную точку, `-` — минус, `*` — оператор «звёздочка».
- **Индексы.** `x_i`, `x^2`, `x_i^2`, `x^{n+1}`, штрихи `f'`, `f''`; индекс
  без основания ставится на пустое основание.
- **Дроби и корни.** `\frac`, `\dfrac`, `\tfrac`, `\cfrac`, `\binom`,
  `\dbinom`, `\tbinom`, `\sqrt`, `\sqrt[n]`; однозначным аргументам скобки
  не нужны (`\frac12`).
- **Символы.** Греческие буквы (в том числе формы `\var…`), операторы (`\pm`,
  `\times`, `\cdot`, `\cup`, `\oplus`…), отношения (`\le`, `\ne`, `\approx`,
  `\equiv`, `\subseteq`, `\in`…), стрелки (`\to`, `\Rightarrow`, `\iff`,
  `\mapsto`…), `\infty`, `\partial`, `\nabla`, `\forall`, `\exists`, многоточия
  (`\ldots`, `\cdots`, `\vdots`, `\ddots`); `\not` перед отношением.
- **Крупные операторы.** `\sum`, `\prod`, `\bigcup`, `\bigoplus`… ставят
  пределы над и под собой в выделенной формуле и сбоку в строчной; интегралы
  (`\int`, `\iint`, `\oint`…) — сбоку, если нет `\limits`; `\nolimits` — наоборот.
- **Названия функций.** `\sin`, `\cos`, `\log`, `\ln`, `\exp`, `\det`…
  прямым шрифтом, с тонким пробелом после; `\lim`, `\max`, `\min`, `\sup`,
  `\inf`, `\gcd`… с пределами; `\operatorname{name}` и
  `\operatorname*{name}` (с пределами).
- **Скобки.** `\left( … \middle| … \right)` растягиваются по содержимому; `.` —
  для пустой стороны; `\big`, `\Big`, `\bigg`, `\Bigg` (и их формы `l`, `r`,
  `m`) — для фиксированного размера; обычные скобки не растягиваются, как и в
  TeX.
- **Акценты.** `\hat`, `\widehat`, `\bar`, `\overline`, `\vec`,
  `\overrightarrow`, `\dot`, `\ddot`, `\tilde`, `\widetilde`, `\check`,
  `\breve`, `\acute`, `\grave`, `\underline`, `\overbrace{…}^{…}`,
  `\underbrace{…}_{…}`, `\overset`, `\underset`, `\stackrel`.
- **Начертания букв.** `\mathbb`, `\mathbf`, `\mathit`, `\mathcal`, `\mathscr`,
  `\mathfrak`, `\mathsf`, `\mathtt`, `\mathrm`, `\boldsymbol`, `\bm` — в виде
  математических букв Юникода (𝔸, 𝐀, 𝒜…), которые MathML Core рисует любым
  математическим шрифтом.
- **Текст.** `\text`, `\textbf`, `\textit`, `\mbox`… сохраняют пробелы.
- **Пробелы.** `\,`, `\:`, `\;`, `\!`, `\quad`, `\qquad`, `\ `, `~`,
  `\hspace{…}`, `\kern`, `\mkern` (в em, ex, mu, pt…).
- **Цвет и рамки.** `\color{red}` (до конца группы),
  `\textcolor{#0969da}{…}`, `\colorbox`, `\boxed`, `\fbox`, `\phantom`.
- **Стили.** `\displaystyle`, `\textstyle`, `\scriptstyle`,
  `\scriptscriptstyle`.
- **Таблицы.** `matrix`, `pmatrix`, `bmatrix`, `Bmatrix`, `vmatrix`,
  `Vmatrix`, `smallmatrix`, `cases`, `dcases`, `rcases`, `aligned`, `align`,
  `alignat`, `split`, `gathered`, `gather`, `multline`, `equation`, `array`
  (выравнивание столбцов и линии `|`), `subarray`; `\\` и `&` на верхнем
  уровне образуют выровненные или собранные по центру строки.
- **Модульная арифметика.** `\bmod`, `\pmod{m}`, `\mod`.
- **Комментарии.** `%` до конца строки.

Что не поддерживается: собственное программирование TeX (`\def`,
`\newcommand`, `\if`…) — типичную потребность закрывает `macros`; `\tag` и
`\label` читаются и отбрасываются.

## Шрифты

Если не указано иное, MathML рисуется шрифтом страницы, а скобки, корни и
крупные операторы растягиваются только в шрифте с таблицей OpenType MATH.
`MATH_CSS` задаёт:

```css
math.dsk-math { font-family: "STIX Two Math", "Cambria Math", "Latin Modern Math", "Noto Sans Math", math; }
```

STIX Two Math поставляется с macOS, Cambria Math — с Windows. В Linux
установите один из шрифтов (`fonts-stix`, `fonts-lmodern`) или отдавайте его
вместе со страницей — Latin Modern Math и STIX Two Math распространяются под
лицензией SIL Open Font License.

## Ошибки

```ts
import { checkMath, parseMath } from '@dskripchenko/math'

checkMath('\\frac{1}') // MathError: An argument is missing (position 8)
checkMath('\\frac{1}{') // MathError: A "{" is not closed (position 9)
parseMath('\\left( x') // throws MathError: \left without \right
```

`renderMath` показывает TeX формулы, которую не удалось прочитать, в элементе
`span` с классом `.dsk-math-error`, а причину — в его `title`, поэтому
документ с ошибкой остаётся читаемым. С `throwOnError` вместо этого
бросается исключение.

## Дерево

`parseMath` возвращает `MathNode` — `ident`, `number`, `op` (с его видом:
`bin`, `rel`, `open`, `close`, `punct`, `large`, `prefix`, `ord`), `text`,
`space`, `row`, `scripts`, `frac`, `sqrt`, `fenced`, `accent`, `table`,
`style`, `phantom`, `boxed` — чтобы рисовать формулу иначе или проверять её.
