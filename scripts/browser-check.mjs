// The formulas drawn by real browsers' MathML: a gallery page built from
// dist/, checked by geometry in Chromium and WebKit, and photographed for a
// look (tests/browser/output). The math font comes with the dev tools, so the
// same font draws on every system (Linux has none of its own).
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { chromium, webkit } from 'playwright'

const root = join(import.meta.dirname, '..')
execSync('pnpm build', { cwd: root, stdio: 'ignore' })
const { renderMath, MATH_CSS } = await import(join(root, 'dist/index.mjs'))
const output = join(root, 'tests/browser/output')
mkdirSync(output, { recursive: true })

const GALLERY = [
  ['Pythagoras', 'a^2 + b^2 = c^2'],
  ['Quadratic', 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'],
  ['Sum', '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}'],
  ['Integral', '\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}'],
  ['Limit', '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1'],
  ['Euler', 'e^{i\\pi} + 1 = 0'],
  ['Fences', '\\left( \\frac{a}{b} \\right)^2 \\left\\{ x \\in \\mathbb{R} \\;\\middle|\\; x > 0 \\right\\}'],
  ['Matrix', 'A = \\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}, \\quad \\det A = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}'],
  ['Cases', '|x| = \\begin{cases} x & \\text{if } x \\ge 0 \\\\ -x & \\text{otherwise} \\end{cases}'],
  ['Aligned', '\\begin{aligned} (a+b)^2 &= a^2 + 2ab + b^2 \\\\ &= b^2 + 2ab + a^2 \\end{aligned}'],
  ['Styles', '\\mathbf{v} \\cdot \\boldsymbol{\\alpha}, \\quad \\mathcal{L}, \\mathfrak{g}, \\mathsf{T}, \\mathtt{x}, \\mathrm{d}x'],
  ['Accents', '\\hat{x}, \\bar{y}, \\vec{v}, \\dot{x}, \\ddot{x}, \\tilde{n}, \\widehat{AB}, \\overline{z + w}'],
  ['Braces', '\\overbrace{1 + 2 + \\cdots + n}^{n \\text{ terms}} = \\underbrace{\\binom{n+1}{2}}_{\\text{triangle}}'],
  ['Roots', '\\sqrt[3]{x^3 + y^3}, \\quad \\sqrt{\\sqrt{x}}'],
  ['Greek', '\\alpha \\beta \\gamma \\delta \\epsilon \\varepsilon \\theta \\lambda \\mu \\pi \\sigma \\phi \\varphi \\omega \\; \\Gamma \\Delta \\Theta \\Lambda \\Pi \\Sigma \\Phi \\Omega'],
  ['Relations', 'a \\le b \\ne c \\approx d \\equiv e \\subseteq F \\Rightarrow G \\iff H \\not\\in K'],
  ['Colour', '\\textcolor{#d1242f}{x} + \\color{#0969da} y = \\boxed{z}'],
  ['Functions', '\\log_2 n, \\; \\max_{i} a_i, \\; \\operatorname{rank} A, \\; \\gcd(a, b)'],
  ['Derivative', "f'(x) = \\frac{d}{dx} f(x), \\quad \\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u"],
  ['Array', '\\begin{array}{c|cc} & x & y \\\\ \\hline a & 1 & 0 \\\\ b & 0 & 1 \\end{array}'],
  ['Big', '\\Bigg( \\bigg( \\Big( \\big( x \\big) \\Big) \\bigg) \\Bigg)'],
  ['Error', '\\frac{1}{'],
]

const items = GALLERY.map(
  ([name, tex], i) => `<section data-i="${i}"><h3>${name}</h3><p class="inline">Inline: ${renderMath(tex)} and text after.</p>${renderMath(tex, { display: true })}</section>`,
).join('\n')
const page = join(output, 'gallery.html')
writeFileSync(
  page,
  `<!doctype html><meta charset="utf-8"><title>math</title><style>
  body { font: 16px/1.5 system-ui, sans-serif; margin: 24px; max-width: 900px; }
  section { border-bottom: 1px solid #ddd; padding: 4px 0 8px; }
  h3 { margin: 4px 0; font-size: 13px; color: #666; }
  math[display="block"] { margin: 8px 0; font-size: 1.15em; }
  @font-face { font-family: "STIX Two Math"; src: url("file://${join(root, 'node_modules/@fontsource/stix-two-math/files/stix-two-math-latin-400-normal.woff2')}"); }
  ${MATH_CSS}
  </style>${items}`,
)

let failed = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ` — ${detail}`}`)
  if (!ok) failed++
}

for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch()
  const tab = await browser.newPage({ viewport: { width: 980, height: 800 } })
  const errors = []
  tab.on('pageerror', (e) => errors.push(e.message))
  await tab.goto(`file://${page}`)
  const geo = await tab.evaluate(() => {
    const box = (el) => el.getBoundingClientRect()
    const display = (i) => document.querySelector(`section[data-i="${i}"] math[display="block"]`)
    const out = {}
    // Every formula has a size.
    out.sized = [...document.querySelectorAll('math')].every((m) => box(m).width > 4 && box(m).height > 4)
    // A fraction: the numerator over the denominator.
    const frac = display(1).querySelector('mfrac')
    out.fraction = box(frac.children[0]).bottom <= box(frac.children[1]).top + 1
    // A displayed sum: its limits under and over it; inline beside it.
    const sum = display(2).querySelector('munderover')
    out.sumDisplay = box(sum.children[1]).top >= box(sum.children[0]).bottom - 2 && box(sum.children[2]).bottom <= box(sum.children[0]).top + 2
    const inlineSum = document.querySelector('section[data-i="2"] .inline munderover')
    out.sumInline = box(inlineSum.children[1]).left > box(inlineSum.children[0]).left + 2
    // A root covers what is under it.
    const root = display(1).querySelector('msqrt')
    out.root = box(root).width > box(root.firstElementChild).width
    // Stretching fences: as tall as the fraction inside.
    const fence = display(6).querySelector('mo[fence]')
    out.fence = box(fence).height >= box(display(6).querySelector('mfrac')).height * 0.9
    // A matrix: two rows, two columns.
    out.matrix = display(7).querySelectorAll('mtable')[0].querySelectorAll('mtr').length === 2
    // Aligned: the equals signs line up.
    const eqs = [...display(9).querySelectorAll('mtr')].map((r) => box(r.children[1]).left)
    out.aligned = Math.abs(eqs[0] - eqs[1]) < 1.5
    // An error shows the TeX.
    out.error = document.querySelector('section[data-i="21"] .dsk-math-error')?.textContent === '\\frac{1}{'
    return out
  })
  for (const [k, v] of Object.entries(geo)) check(`${name}: ${k}`, v === true, String(v))
  check(`${name}: no page errors`, errors.length === 0, errors.join(' | '))
  await tab.screenshot({ path: join(output, `gallery-${name}.png`), fullPage: true })
  await browser.close()
}
console.log(failed ? `${failed} check(s) failed` : 'all checks passed')
process.exit(failed ? 1 : 0)
