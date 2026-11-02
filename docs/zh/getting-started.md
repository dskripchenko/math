# 快速开始

`@dskripchenko/math` 将 TeX 数学公式转换为 MathML。MathML 由浏览器自行渲染
（MathML Core：Chromium 109+、Firefox、Safari），因此本包不带排版引擎，也不带
字体——只有解析器和输出器。

```bash
npm install @dskripchenko/math
```

## API

| | |
|---|---|
| `renderMath(tex, options?)` | 以字符串形式返回 `<math class="dsk-math">` 元素；无法解析的 TeX 会变成 `<span class="dsk-math-error" title="reason">tex</span>`。 |
| `parseMath(tex, options?)` | 以树（`MathNode`）的形式返回公式；出错时抛出 `MathError`。 |
| `toMathML(node)` | 将树输出为 MathML（不含 `<math>` 外层）。 |
| `checkMath(tex, options?)` | TeX 可解析时返回 `null`，否则返回 `MathError`——用于编辑器中的标记。 |
| `texOf(element)` | 已渲染公式所用的 TeX（保存在其 `<annotation>` 中）；用于复制和编辑器。 |
| `MATH_CSS` | 页面所需的 CSS：数学字体、独立成行公式的边距、错误的样式。 |
| `MathError` | 包含 `message` 和 `position`——出错位置在 TeX 中的偏移量。 |

选项：

| | |
|---|---|
| `display` | 独立成行的公式（`$$…$$`、`\[…\]`）：`display="block"`，大型运算符的上下限置于上下方，分数为完整大小。 |
| `throwOnError` | 抛出 `MathError`，而不是将 TeX 标记为错误后显示。 |
| `macros` | 自定义命令：`{ R: '\\mathbb{R}', norm: '\\left\\|#1\\right\\|' }`；`#1`…`#9` 为参数。 |

```ts
import { MATH_CSS, renderMath } from '@dskripchenko/math'

document.head.append(Object.assign(document.createElement('style'), { textContent: MATH_CSS }))
inline.innerHTML = renderMath('e^{i\\pi} + 1 = 0')
block.innerHTML = renderMath('\\int_0^1 x^2\\,dx = \\frac{1}{3}', { display: true })
```

## 支持的内容

- **字母、数字、符号。** 字母是变量（斜体），数字保留小数点，`-` 是减号，
  `*` 是星号运算符。
- **上下标。** `x_i`、`x^2`、`x_i^2`、`x^{n+1}`，撇号 `f'`、`f''`；没有基底的
  上下标挂在空基底上。
- **分数和根式。** `\frac`、`\dfrac`、`\tfrac`、`\cfrac`、`\binom`、
  `\dbinom`、`\tbinom`、`\sqrt`、`\sqrt[n]`；单个字符的参数无需花括号
  （`\frac12`）。
- **符号。** 希腊字母（包括 `\var…` 形式）、运算符（`\pm`、`\times`、
  `\cdot`、`\cup`、`\oplus`…）、关系符（`\le`、`\ne`、`\approx`、`\equiv`、
  `\subseteq`、`\in`…）、箭头（`\to`、`\Rightarrow`、`\iff`、`\mapsto`…）、
  `\infty`、`\partial`、`\nabla`、`\forall`、`\exists`、省略号（`\ldots`、
  `\cdots`、`\vdots`、`\ddots`）；关系符前可加 `\not`。
- **大型运算符。** `\sum`、`\prod`、`\bigcup`、`\bigoplus`… 在独立成行的公式中
  将上下限置于上下方，在行内公式中置于右侧；积分（`\int`、`\iint`、`\oint`…）
  默认置于右侧，使用 `\limits` 则相反；`\nolimits` 则强制置于右侧。
- **函数名。** `\sin`、`\cos`、`\log`、`\ln`、`\exp`、`\det`… 使用直立体，
  后接细空格；`\lim`、`\max`、`\min`、`\sup`、`\inf`、`\gcd`… 带上下限；
  `\operatorname{name}` 和 `\operatorname*{name}`（带上下限）。
- **定界符。** `\left( … \middle| … \right)` 随内容伸缩；`.` 表示空的一侧；
  `\big`、`\Big`、`\bigg`、`\Bigg`（及其 `l`、`r`、`m` 形式）用于固定大小；
  与 TeX 一样，普通括号不会伸缩。
- **重音。** `\hat`、`\widehat`、`\bar`、`\overline`、`\vec`、
  `\overrightarrow`、`\dot`、`\ddot`、`\tilde`、`\widetilde`、`\check`、
  `\breve`、`\acute`、`\grave`、`\underline`、`\overbrace{…}^{…}`、
  `\underbrace{…}_{…}`、`\overset`、`\underset`、`\stackrel`。
- **字母样式。** `\mathbb`、`\mathbf`、`\mathit`、`\mathcal`、`\mathscr`、
  `\mathfrak`、`\mathsf`、`\mathtt`、`\mathrm`、`\boldsymbol`、`\bm`——输出为
  Unicode 的数学字母（𝔸、𝐀、𝒜…），MathML Core 可用任何数学字体绘制。
- **文本。** `\text`、`\textbf`、`\textit`、`\mbox`… 保留其中的空格。
- **空格。** `\,`、`\:`、`\;`、`\!`、`\quad`、`\qquad`、`\ `、`~`、
  `\hspace{…}`、`\kern`、`\mkern`（单位为 em、ex、mu、pt…）。
- **颜色和方框。** `\color{red}`（作用到组的末尾）、
  `\textcolor{#0969da}{…}`、`\colorbox`、`\boxed`、`\fbox`、`\phantom`。
- **样式。** `\displaystyle`、`\textstyle`、`\scriptstyle`、
  `\scriptscriptstyle`。
- **表格。** `matrix`、`pmatrix`、`bmatrix`、`Bmatrix`、`vmatrix`、
  `Vmatrix`、`smallmatrix`、`cases`、`dcases`、`rcases`、`aligned`、`align`、
  `alignat`、`split`、`gathered`、`gather`、`multline`、`equation`、`array`
  （列对齐和 `|` 竖线）、`subarray`；顶层的 `\\` 和 `&` 会生成对齐或居中的
  多行公式。
- **模运算。** `\bmod`、`\pmod{m}`、`\mod`。
- **注释。** `%` 至行尾。

不支持的内容：TeX 自身的编程功能（`\def`、`\newcommand`、`\if`…）——
`macros` 可满足常见需求；`\tag` 和 `\label` 会被读取后丢弃。

## 字体

除非另行指定，MathML 使用页面的字体绘制，而定界符、根号和大型运算符只有在带
OpenType MATH 表的字体中才会伸缩。`MATH_CSS` 设置了：

```css
math.dsk-math { font-family: "STIX Two Math", "Cambria Math", "Latin Modern Math", "Noto Sans Math", math; }
```

STIX Two Math 随 macOS 提供，Cambria Math 随 Windows 提供。在 Linux 上，请安装
其中一种（`fonts-stix`、`fonts-lmodern`），或随页面一并提供——Latin Modern Math
和 STIX Two Math 均采用 SIL Open Font License 许可。

## 错误

```ts
import { checkMath, parseMath } from '@dskripchenko/math'

checkMath('\\frac{1}') // MathError: An argument is missing (position 8)
checkMath('\\frac{1}{') // MathError: A "{" is not closed (position 9)
parseMath('\\left( x') // throws MathError: \left without \right
```

对于无法解析的公式，`renderMath` 会将其 TeX 显示在 `.dsk-math-error` 的
`span` 中，原因写在其 `title` 里，因此带有错误的文档仍然可读。使用
`throwOnError` 时则改为抛出异常。

## 树

`parseMath` 返回 `MathNode`——`ident`、`number`、`op`（及其类别：`bin`、`rel`、
`open`、`close`、`punct`、`large`、`prefix`、`ord`）、`text`、`space`、`row`、
`scripts`、`frac`、`sqrt`、`fenced`、`accent`、`table`、`style`、`phantom`、
`boxed`——可用于以其他方式绘制公式，或用于检查公式。
