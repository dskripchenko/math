import { checkMath, MathError, parseMath, renderMath, toMathML } from '../src'
import { styled } from '../src/fonts'

/** The MathML of a formula, without the `<math>` wrapper and its annotation. */
const ml = (tex: string, options = {}): string => toMathML(parseMath(tex, options))

describe('letters, numbers, operators', () => {
  it('variables, numbers with a decimal point, operators of each kind', () => {
    expect(ml('x+12.5=y')).toBe('<mrow><mi>x</mi><mo>+</mo><mn>12.5</mn><mo>=</mo><mi>y</mi></mrow>')
    expect(ml('a-b*c')).toBe('<mrow><mi>a</mi><mo>−</mo><mi>b</mi><mo>∗</mo><mi>c</mi></mrow>')
    expect(ml('(a)')).toBe('<mrow><mo stretchy="false">(</mo><mi>a</mi><mo stretchy="false">)</mo></mrow>')
    expect(ml('a, b')).toContain('<mo separator="true" lspace="0" rspace="0.1667em">,</mo>')
  })

  it('Greek, symbols, relations, arrows, big operators', () => {
    expect(ml('\\alpha\\Omega\\infty')).toBe('<mrow><mi>α</mi><mi>Ω</mi><mi>∞</mi></mrow>')
    expect(ml('a\\le b\\to c\\cdot d')).toBe('<mrow><mi>a</mi><mo>≤</mo><mi>b</mi><mo>→</mo><mi>c</mi><mo>⋅</mo><mi>d</mi></mrow>')
    expect(ml('\\sum')).toBe('<mo largeop="true" movablelimits="true">∑</mo>')
    expect(ml('\\int')).toBe('<mo largeop="true">∫</mo>')
  })

  it('negations: a sign of its own, or a slash over it', () => {
    expect(ml('\\not=')).toBe('<mo>≠</mo>')
    expect(ml('\\not\\in')).toBe('<mo>∉</mo>')
    expect(ml('\\not\\perp')).toBe('<mo>⊥\u0338</mo>')
  })
})

describe('scripts and limits', () => {
  it('sub- and superscripts, primes', () => {
    expect(ml('x_1^2')).toBe('<msubsup><mi>x</mi><mn>1</mn><mn>2</mn></msubsup>')
    expect(ml('x^{n+1}')).toBe('<msup><mi>x</mi><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></msup>')
    expect(ml("f''")).toBe('<msup><mi>f</mi><mo lspace="0" rspace="0">′′</mo></msup>')
    expect(ml("f'^2")).toContain('<msup><mi>f</mi><mrow><mo lspace="0" rspace="0">′</mo><mn>2</mn></mrow></msup>')
  })

  it('big operators and limit functions take limits under and over; integrals beside unless \\limits', () => {
    expect(ml('\\sum_{i=1}^n')).toMatch(/^<munderover><mo largeop="true" movablelimits="true">∑<\/mo>/)
    expect(ml('\\int_0^1')).toMatch(/^<msubsup>/)
    expect(ml('\\int\\limits_0^1')).toMatch(/^<munderover>/)
    expect(ml('\\sum\\nolimits_i')).toMatch(/^<msub><mo largeop="true">∑<\/mo>/)
    expect(ml('\\lim_{x\\to0}')).toMatch(/^<munder><mo movablelimits="true" form="prefix" lspace="0" rspace="0.1667em">lim<\/mo>/)
  })

  it('a function name: upright, with the invisible application before its argument', () => {
    expect(ml('\\sin x')).toBe('<mrow><mi>sin</mi><mo lspace="0" rspace="0.1667em">&#x2061;</mo><mi>x</mi></mrow>')
    expect(ml('\\sin^2 x')).toContain('<msup><mi>sin</mi><mn>2</mn></msup><mo lspace="0" rspace="0.1667em">&#x2061;</mo>')
    expect(ml('\\operatorname{rank} A')).toContain('<mi>rank</mi><mo lspace="0" rspace="0.1667em">&#x2061;</mo>')
    expect(ml('\\operatorname*{arg\\,max}_x')).toMatch(/^<munder><mo movablelimits="true" form="prefix"[^>]*>arg max<\/mo>/)
  })

  it('a script with no base sits on an empty one; two of a kind are an error', () => {
    expect(ml('^2')).toBe('<msup><mrow></mrow><mn>2</mn></msup>')
    expect(() => parseMath('x^1^2')).toThrow(/Double superscript/)
  })
})

describe('fractions, roots, fences, accents', () => {
  it('fractions and binomials, their styles; one-digit arguments without braces', () => {
    expect(ml('\\frac12')).toBe('<mfrac><mn>1</mn><mn>2</mn></mfrac>')
    expect(ml('\\dfrac{a}{b}')).toBe('<mrow displaystyle="true" scriptlevel="0"><mfrac><mi>a</mi><mi>b</mi></mfrac></mrow>')
    expect(ml('\\binom{n}{k}')).toContain('<mfrac linethickness="0"><mi>n</mi><mi>k</mi></mfrac>')
  })

  it('square and n-th roots', () => {
    expect(ml('\\sqrt{x}')).toBe('<msqrt><mi>x</mi></msqrt>')
    expect(ml('\\sqrt[3]{x}')).toBe('<mroot><mi>x</mi><mn>3</mn></mroot>')
  })

  it('stretching fences, the middle one, an empty side, sized ones', () => {
    expect(ml('\\left(x\\right)')).toBe('<mrow><mo fence="true" form="prefix" stretchy="true" symmetric="true">(</mo><mi>x</mi><mo fence="true" form="postfix" stretchy="true" symmetric="true">)</mo></mrow>')
    expect(ml('\\left\\{ a \\middle| b \\right.')).toMatch(/^<mrow><mo fence="true" form="prefix"[^>]*>\{<\/mo><mrow><mi>a<\/mi><mo stretchy="true" symmetric="true">\|<\/mo><mi>b<\/mi><\/mrow><\/mrow>$/)
    expect(ml('\\left\\langle x \\right\\rangle')).toContain('⟨')
    expect(ml('\\big(')).toBe('<mo stretchy="true" symmetric="true" minsize="1.2em" maxsize="1.2em">(</mo>')
    expect(() => parseMath('\\left( x')).toThrow(/\\left without \\right/)
    expect(() => parseMath('x \\right)')).toThrow(/\\right without \\left/)
  })

  it('accents over and under, braces with their labels', () => {
    expect(ml('\\hat x')).toBe('<mover accent="true"><mi>x</mi><mo stretchy="false">^</mo></mover>')
    expect(ml('\\overline{ab}')).toContain('<mo stretchy="true">‾</mo>')
    expect(ml('\\underbrace{a+b}_{n}')).toMatch(/^<munder><munder accentunder="true">/)
    expect(ml('\\overset{!}{=}')).toBe('<mover><mo>=</mo><mo lspace="0" rspace="0">!</mo></mover>')
  })
})

describe('letter styles, text, spacing, colour', () => {
  it('styles as Unicode letters, with the holes filled from the older block', () => {
    expect(styled('ABC', 'double-struck')).toBe('𝔸𝔹ℂ')
    expect(styled('Rx1', 'bold')).toBe('𝐑𝐱𝟏')
    expect(styled('h', 'italic')).toBe('ℎ')
    expect(styled('αΩ', 'bold-italic')).toBe('𝜶𝜴')
    expect(ml('\\mathbb{R}')).toBe('<mi>ℝ</mi>')
    expect(ml('\\mathrm{d}x')).toBe('<mrow><mi mathvariant="normal">d</mi><mi>x</mi></mrow>')
    expect(ml('\\mathrm{max}')).toBe('<mi>max</mi>')
    expect(ml('\\mathcal L')).toBe('<mi>ℒ</mi>')
  })

  it('text keeps its spaces and signs', () => {
    expect(ml('\\text{if } x')).toBe('<mrow><mtext>if\u00a0</mtext><mi>x</mi></mrow>')
    expect(ml('\\text{a \\& b, 50\\%}')).toBe('<mtext>a &amp; b, 50%</mtext>')
    expect(ml('\\textbf{AB}')).toBe('<mtext>𝐀𝐁</mtext>')
  })

  it('spaces in em', () => {
    expect(ml('a\\,b\\quad c\\!d')).toBe('<mrow><mi>a</mi><mspace width="0.167em"/><mi>b</mi><mspace width="1em"/><mi>c</mi><mspace style="margin-left:-0.167em"/><mi>d</mi></mrow>')
    expect(ml('\\hspace{2em}')).toBe('<mspace width="2em"/>')
    expect(ml('\\mkern18mu')).toBe('<mspace width="1em"/>')
  })

  it('colours: named or hex, never anything else', () => {
    expect(ml('\\textcolor{red}{x}')).toBe('<mrow style="color:red"><mi>x</mi></mrow>')
    expect(ml('a \\color{#0969da} b c')).toBe('<mrow><mi>a</mi><mrow style="color:#0969da"><mrow><mi>b</mi><mi>c</mi></mrow></mrow></mrow>')
    expect(() => parseMath('\\textcolor{red;background:url(x)}{x}')).toThrow(/Not a colour/)
  })

  it('display and script styles run to the end of the group', () => {
    expect(ml('{\\displaystyle \\sum}')).toBe('<mrow displaystyle="true" scriptlevel="0"><mo largeop="true" movablelimits="true">∑</mo></mrow>')
  })
})

describe('tables', () => {
  it('matrices with their fences', () => {
    const out = ml('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}')
    expect(out.match(/<mtr>/g)).toHaveLength(2)
    expect(out.match(/<mtd /g)).toHaveLength(4)
    expect(out).toMatch(/^<mrow><mo fence="true" form="prefix"[^>]*>\(<\/mo><mtable>/)
    expect(ml('\\begin{vmatrix} a \\end{vmatrix}')).toContain('>|</mo>')
  })

  it('cases: left-aligned, a brace before', () => {
    const out = ml('\\begin{cases} 1 & x>0 \\\\ 0 & \\text{else} \\end{cases}')
    expect(out).toContain('text-align:left')
    expect(out).toMatch(/^<mrow><mo [^>]*>\{<\/mo>/)
  })

  it('aligned equations: pairs right-left; a trailing line break makes no row', () => {
    const out = ml('\\begin{aligned} a &= b \\\\ c &= d \\\\ \\end{aligned}')
    expect(out.match(/<mtr>/g)).toHaveLength(2)
    expect(out).toContain('text-align:right;padding-right:0')
    expect(out).toContain('text-align:left;padding-left:0')
  })

  it('arrays: column alignments and lines', () => {
    const out = ml('\\begin{array}{l|r} a & b \\end{array}')
    expect(out).toContain('text-align:left;border-right:1px solid')
    expect(out).toContain('text-align:right"')
  })

  it('lines at the top: gathered, or aligned when there are columns', () => {
    expect(ml('a \\\\ b')).toMatch(/^<mtable><mtr><mtd style="text-align:center">/)
    expect(ml('a &= b \\\\ c &= d')).toContain('text-align:right;padding-right:0')
  })

  it('an environment ended by another one, or not at all, is an error', () => {
    expect(() => parseMath('\\begin{matrix} a \\end{pmatrix}')).toThrow(/ended by/)
    expect(() => parseMath('\\begin{matrix} a')).toThrow(/not ended/)
    expect(() => parseMath('\\begin{foo} a \\end{foo}')).toThrow(/Unknown environment foo/)
  })
})

describe('macros', () => {
  it('a name for a formula, and one with arguments', () => {
    const macros = { R: '\\mathbb{R}', norm: '\\left\\|#1\\right\\|', pair: '(#1, #2)' }
    expect(ml('\\R^n', { macros })).toBe('<msup><mi>ℝ</mi><mi>n</mi></msup>')
    expect(ml('\\norm{x}', { macros })).toContain('>‖</mo><mi>x</mi>')
    expect(ml('\\pair{a}b', { macros })).toBe('<mrow><mo stretchy="false">(</mo><mi>a</mi><mo separator="true" lspace="0" rspace="0.1667em">,</mo><mi>b</mi><mo stretchy="false">)</mo></mrow>')
  })

  it('a macro calling itself stops with an error', () => {
    expect(() => parseMath('\\loop', { macros: { loop: '\\loop x' } })).toThrow(MathError)
  })
})

describe('errors and the output', () => {
  it('an error has its place in the TeX', () => {
    const e = checkMath('a + \\nope')
    expect(e?.message).toBe('Unknown command \\nope')
    expect(e?.position).toBe(4)
    expect(checkMath('a + b')).toBeNull()
    expect(() => parseMath('{a')).toThrow(/not closed/)
    expect(() => parseMath('a}')).toThrow(/unmatched/)
    expect(() => parseMath('\\frac{1}')).toThrow(/argument is missing/)
  })

  it('a formula: MathML with its TeX in an annotation; display; an error shown as its TeX', () => {
    const out = renderMath('x<1', { display: true })
    expect(out).toMatch(/^<math xmlns="http:\/\/www.w3.org\/1998\/Math\/MathML" class="dsk-math" display="block"><semantics>/)
    expect(out).toContain('<annotation encoding="application/x-tex">x&lt;1</annotation>')
    expect(renderMath('\\nope')).toBe('<span class="dsk-math-error" title="Unknown command \\nope">\\nope</span>')
    expect(() => renderMath('\\nope', { throwOnError: true })).toThrow(MathError)
  })

  it('nothing from the TeX becomes markup', () => {
    for (const tex of ['<script>alert(1)</script>', '\\text{<img src=x onerror=alert(1)>}', '\\textcolor{red}{"><b>}', 'x"onmouseover="alert(1)']) {
      const out = renderMath(tex)
      expect(out).not.toMatch(/<(script|img|b)[\s>]/)
      // Only the package's own tags and attributes: the TeX stays text.
      expect(out).not.toMatch(/<[^>]*\son\w+=/)
    }
  })

  it('pathological input finishes fast: deep nesting, long formulas, many fences', () => {
    const start = performance.now()
    expect(() => parseMath('{'.repeat(10_000) + 'x' + '}'.repeat(10_000))).toThrow(/too (deeply|long)/)
    expect(() => parseMath('\\frac'.repeat(5_000) + 'xx')).toThrow(MathError)
    expect(() => parseMath('x'.repeat(30_000))).toThrow(/too long/)
    parseMath('\\left('.repeat(60) + 'x' + '\\right)'.repeat(60))
    parseMath(Array.from({ length: 2_000 }, (_, i) => `x_{${i}}`).join('+'))
    expect(performance.now() - start).toBeLessThan(1500)
  })
})
