/**
 * What a TeX command is: a letter, an operator, a relation, a big operator,
 * a function name, a delimiter. Each maps to the character it stands for.
 */

/** Greek letters and other letter-like symbols: identifiers. */
export const LETTERS: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ',
  iota: 'ι', kappa: 'κ', varkappa: 'ϰ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π', varpi: 'ϖ', rho: 'ρ',
  varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ', phi: 'ϕ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  digamma: 'ϝ',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  varGamma: '𝛤', varDelta: '𝛥', varTheta: '𝛩', varLambda: '𝛬', varXi: '𝛯', varPi: '𝛱', varSigma: '𝛴', varUpsilon: '𝛶',
  varPhi: '𝛷', varPsi: '𝛹', varOmega: '𝛺',
  aleph: 'ℵ', beth: 'ℶ', gimel: 'ℷ', hbar: 'ℏ', hslash: 'ℏ', ell: 'ℓ', wp: '℘', Re: 'ℜ', Im: 'ℑ', imath: 'ı', jmath: 'ȷ',
  partial: '∂', infty: '∞', nabla: '∇', emptyset: '∅', varnothing: '⌀', top: '⊤', bot: '⊥', angle: '∠', measuredangle: '∡',
  triangle: '△', square: '□', Box: '□', blacksquare: '■', diamond: '⋄', Diamond: '◊', lozenge: '◊', clubsuit: '♣',
  diamondsuit: '♢', heartsuit: '♡', spadesuit: '♠', flat: '♭', natural: '♮', sharp: '♯', prime: '′', backprime: '‵',
  degree: '°', checkmark: '✓', dagger: '†', ddagger: '‡', S: '§', P: '¶', copyright: '©', pounds: '£', euro: '€',
}

/** Binary operators: spaced as operations. */
export const BINARY: Record<string, string> = {
  pm: '±', mp: '∓', times: '×', div: '÷', cdot: '⋅', ast: '∗', star: '⋆', circ: '∘', bullet: '∙', cap: '∩', cup: '∪',
  uplus: '⊎', sqcap: '⊓', sqcup: '⊔', wedge: '∧', land: '∧', vee: '∨', lor: '∨', setminus: '∖', smallsetminus: '∖',
  oplus: '⊕', ominus: '⊖', otimes: '⊗', oslash: '⊘', odot: '⊙', dagger: '†', ddagger: '‡', amalg: '⨿', wr: '≀',
  triangleleft: '◃', triangleright: '▹', bigtriangleup: '△', bigtriangledown: '▽', diamond: '⋄', ltimes: '⋉', rtimes: '⋊',
  cdotp: '⋅', centerdot: '⋅', dotplus: '∔', boxplus: '⊞', boxminus: '⊟', boxtimes: '⊠',
}

/** Relations and arrows. */
export const RELATIONS: Record<string, string> = {
  le: '≤', leq: '≤', ge: '≥', geq: '≥', leqslant: '⩽', geqslant: '⩾', ne: '≠', neq: '≠', lt: '<', gt: '>', ll: '≪', gg: '≫',
  lll: '⋘', ggg: '⋙', approx: '≈', approxeq: '≊', equiv: '≡', sim: '∼', simeq: '≃', cong: '≅', propto: '∝', doteq: '≐',
  triangleq: '≜', coloneqq: '≔', eqqcolon: '≕', asymp: '≍', prec: '≺', succ: '≻', preceq: '⪯', succeq: '⪰', lesssim: '≲',
  gtrsim: '≳', in: '∈', notin: '∉', ni: '∋', owns: '∋', subset: '⊂', supset: '⊃', subseteq: '⊆', supseteq: '⊇',
  subsetneq: '⊊', supsetneq: '⊋', nsubseteq: '⊈', nsupseteq: '⊉', sqsubset: '⊏', sqsupset: '⊐', sqsubseteq: '⊑',
  sqsupseteq: '⊒', mid: '∣', nmid: '∤', parallel: '∥', nparallel: '∦', perp: '⊥', vdash: '⊢', dashv: '⊣', models: '⊨',
  vDash: '⊨', Vdash: '⊩', smile: '⌣', frown: '⌢', bowtie: '⋈', nless: '≮', ngtr: '≯', nleq: '≰', ngeq: '≱', nsim: '≁',
  ncong: '≇', therefore: '∴', because: '∵',
  to: '→', rightarrow: '→', leftarrow: '←', gets: '←', leftrightarrow: '↔', Rightarrow: '⇒', Leftarrow: '⇐',
  Leftrightarrow: '⇔', implies: '⟹', impliedby: '⟸', iff: '⟺', mapsto: '↦', longmapsto: '⟼', longrightarrow: '⟶',
  longleftarrow: '⟵', longleftrightarrow: '⟷', Longrightarrow: '⟹', Longleftarrow: '⟸', Longleftrightarrow: '⟺',
  uparrow: '↑', downarrow: '↓', updownarrow: '↕', Uparrow: '⇑', Downarrow: '⇓', Updownarrow: '⇕', nearrow: '↗',
  searrow: '↘', swarrow: '↙', nwarrow: '↖', hookrightarrow: '↪', hookleftarrow: '↩', rightharpoonup: '⇀',
  rightharpoondown: '⇁', leftharpoonup: '↼', leftharpoondown: '↽', rightleftharpoons: '⇌', leftrightharpoons: '⇋',
  rightrightarrows: '⇉', leftleftarrows: '⇇', twoheadrightarrow: '↠', rightsquigarrow: '⇝', leadsto: '⇝',
  nrightarrow: '↛', nleftarrow: '↚', nRightarrow: '⇏', nLeftarrow: '⇍', circlearrowleft: '↺', circlearrowright: '↻',
}

/** Punctuation that TeX treats as such, and the dots. */
export const PUNCT: Record<string, string> = {
  colon: ':', ldots: '…', dots: '…', dotsc: '…', dotso: '…', cdots: '⋯', dotsb: '⋯', dotsm: '⋯', dotsi: '⋯', vdots: '⋮',
  ddots: '⋱', iddots: '⋰', forall: '∀', exists: '∃', nexists: '∄', neg: '¬', lnot: '¬', complement: '∁',
}

/** Big operators: limits above and below in display, beside inline. */
export const LARGE: Record<string, string> = {
  sum: '∑', prod: '∏', coprod: '∐', bigcup: '⋃', bigcap: '⋂', bigsqcup: '⨆', bigvee: '⋁', bigwedge: '⋀',
  bigoplus: '⨁', bigotimes: '⨂', bigodot: '⨀', biguplus: '⨄',
}

/** Integrals: limits beside them unless `\limits`. */
export const INTEGRALS: Record<string, string> = {
  int: '∫', iint: '∬', iiint: '∭', iiiint: '⨌', oint: '∮', oiint: '∯', oiiint: '∰', intop: '∫', smallint: '∫',
}

/** Function names set upright; the ones with limits take them under in display. */
export const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan', 'arccot', 'sinh', 'cosh', 'tanh', 'coth', 'sech',
  'csch', 'log', 'ln', 'lg', 'exp', 'arg', 'deg', 'dim', 'hom', 'ker', 'sgn', 'tg', 'ctg', 'arctg', 'arcctg', 'sh', 'ch',
  'th', 'cth',
])
export const LIMIT_FUNCTIONS = new Set(['lim', 'limsup', 'liminf', 'max', 'min', 'sup', 'inf', 'det', 'gcd', 'lcm', 'Pr', 'argmax', 'argmin', 'injlim', 'projlim'])
/** How a function name is written when it differs from the command. */
export const FUNCTION_TEXT: Record<string, string> = { limsup: 'lim sup', liminf: 'lim inf', argmax: 'arg max', argmin: 'arg min', injlim: 'inj lim', projlim: 'proj lim' }

/** Delimiters, for `\left`, `\right`, `\big` and as they are. */
export const DELIMITERS: Record<string, string> = {
  '(': '(', ')': ')', '[': '[', ']': ']', '\\{': '{', '\\}': '}', lbrace: '{', rbrace: '}', '|': '|', '\\|': '‖',
  '/': '/', '\\backslash': '∖', backslash: '∖', langle: '⟨', rangle: '⟩', lfloor: '⌊', rfloor: '⌋', lceil: '⌈',
  rceil: '⌉', lvert: '|', rvert: '|', vert: '|', lVert: '‖', rVert: '‖', Vert: '‖', lbrack: '[', rbrack: ']',
  lgroup: '⟮', rgroup: '⟯', lmoustache: '⎰', rmoustache: '⎱', uparrow: '↑', downarrow: '↓', updownarrow: '↕',
  Uparrow: '⇑', Downarrow: '⇓', Updownarrow: '⇕', '<': '⟨', '>': '⟩', '.': '',
}

/** Opening delimiters among them: the rest close. */
export const OPENING = new Set(['(', '[', '{', '⟨', '⌊', '⌈', '⟮', '⎰'])

/** Accents over (and under) a base: the mark and whether it stretches over a wide base. */
export const ACCENTS: Record<string, { mark: string; stretchy: boolean; under?: boolean }> = {
  hat: { mark: '^', stretchy: false }, widehat: { mark: '^', stretchy: true }, check: { mark: 'ˇ', stretchy: false },
  widecheck: { mark: 'ˇ', stretchy: true }, tilde: { mark: '~', stretchy: false }, widetilde: { mark: '~', stretchy: true },
  bar: { mark: '¯', stretchy: false }, overline: { mark: '‾', stretchy: true }, vec: { mark: '→', stretchy: false },
  overrightarrow: { mark: '→', stretchy: true }, overleftarrow: { mark: '←', stretchy: true },
  overleftrightarrow: { mark: '↔', stretchy: true }, dot: { mark: '˙', stretchy: false }, ddot: { mark: '¨', stretchy: false },
  dddot: { mark: '⃛', stretchy: false }, acute: { mark: '´', stretchy: false }, grave: { mark: '`', stretchy: false },
  breve: { mark: '˘', stretchy: false }, mathring: { mark: '˚', stretchy: false },
  overbrace: { mark: '⏞', stretchy: true }, underbrace: { mark: '⏟', stretchy: true, under: true },
  underline: { mark: '_', stretchy: true, under: true }, underrightarrow: { mark: '→', stretchy: true, under: true },
  underleftarrow: { mark: '←', stretchy: true, under: true },
}

/** Spaces, in em. */
export const SPACES: Record<string, number> = {
  ',': 3 / 18, thinspace: 3 / 18, ':': 4 / 18, '>': 4 / 18, medspace: 4 / 18, ';': 5 / 18, thickspace: 5 / 18,
  '!': -3 / 18, negthinspace: -3 / 18, negmedspace: -4 / 18, negthickspace: -5 / 18, quad: 1, qquad: 2, ' ': 1 / 3,
  enspace: 0.5, enskip: 0.5,
}

/** `\big` and its kin: the delimiter's height, in em. */
export const SIZES: Record<string, number> = {
  big: 1.2, bigl: 1.2, bigr: 1.2, bigm: 1.2, Big: 1.8, Bigl: 1.8, Bigr: 1.8, Bigm: 1.8,
  bigg: 2.4, biggl: 2.4, biggr: 2.4, biggm: 2.4, Bigg: 3, Biggl: 3, Biggr: 3, Biggm: 3,
}

/** A character typed as it is: its kind. */
export function charKind(ch: string): 'bin' | 'rel' | 'open' | 'close' | 'punct' | 'ord' {
  if ('+-*'.includes(ch)) return 'bin'
  if ('=<>:'.includes(ch)) return 'rel'
  if ('([{'.includes(ch)) return 'open'
  if (')]}'.includes(ch)) return 'close'
  if (',;'.includes(ch)) return 'punct'
  return 'ord'
}
