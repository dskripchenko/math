/**
 * The tree as MathML Core: the elements and attributes every engine with
 * MathML draws (Chromium, Gecko, WebKit) — no `mathvariant` but `normal`, no
 * `mfenced`, no `columnalign`: alignment and lines go in each cell's style.
 */
import type { MathNode } from './ast'

export function escape(text: string): string {
  return text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
}

const em = (n: number): string => `${Math.round(n * 1000) / 1000}em`

/** Function application, invisible: `sin x` read as a function of x. */
const APPLY = '<mo lspace="0" rspace="0.1667em">&#x2061;</mo>'

export function toMathML(node: MathNode): string {
  switch (node.type) {
    case 'ident': {
      const upright = node.upright && [...node.text].length === 1 ? ' mathvariant="normal"' : ''
      return `<mi${upright}>${escape(node.text)}</mi>`
    }
    case 'number':
      return `<mn>${escape(node.text)}</mn>`
    case 'op': {
      const a: string[] = []
      if (node.kind === 'large' && [...node.text].length === 1) a.push('largeop="true"')
      if (node.movableLimits) a.push('movablelimits="true"')
      if (node.kind === 'prefix') a.push('form="prefix"', 'lspace="0"', 'rspace="0.1667em"')
      if (node.stretchy) {
        a.push('stretchy="true"', 'symmetric="true"')
        if (node.size) a.push(`minsize="${em(node.size)}"`, `maxsize="${em(node.size)}"`)
      } else if (node.kind === 'open' || node.kind === 'close' || node.text === '|' || node.text === '‖' || node.text === '/') a.push('stretchy="false"')
      // A sign typed in a formula keeps the kind TeX gives it, whatever the operator dictionary says.
      if (node.kind === 'rel' && node.text.length === 1 && ':'.includes(node.text)) a.push('lspace="0.2778em"', 'rspace="0.2778em"')
      if (node.kind === 'punct') a.push('separator="true"', 'lspace="0"', 'rspace="0.1667em"')
      if (node.kind === 'ord') a.push('lspace="0"', 'rspace="0"')
      return `<mo${a.length ? ' ' + a.join(' ') : ''}>${escape(node.text)}</mo>`
    }
    case 'text': {
      // Spaces at the ends are kept: as non-breaking ones.
      const text = node.text.replace(/^ | $/g, ' ')
      return `<mtext>${escape(text)}</mtext>`
    }
    case 'space':
      return node.width >= 0 ? `<mspace width="${em(node.width)}"/>` : `<mspace style="margin-left:${em(node.width)}"/>`
    case 'row':
      return `<mrow>${rowChildren(node.children)}</mrow>`
    case 'scripts': {
      const base = toMathML(node.base)
      const fn = isFunction(node.base) ? APPLY : ''
      const sub = node.sub ? toMathML(node.sub) : ''
      const sup = node.sup ? toMathML(node.sup) : ''
      if (node.over) {
        if (node.sub && node.sup) return `<munderover>${base}${sub}${sup}</munderover>${fn}`
        if (node.sub) return `<munder>${base}${sub}</munder>${fn}`
        return `<mover>${base}${sup}</mover>${fn}`
      }
      if (node.sub && node.sup) return `<msubsup>${base}${sub}${sup}</msubsup>${fn}`
      if (node.sub) return `<msub>${base}${sub}</msub>${fn}`
      return `<msup>${base}${sup}</msup>${fn}`
    }
    case 'frac': {
      const frac = `<mfrac${node.thickness === 0 ? ' linethickness="0"' : ''}>${toMathML(node.num)}${toMathML(node.den)}</mfrac>`
      if (node.style === 'display') return `<mrow displaystyle="true" scriptlevel="0">${frac}</mrow>`
      if (node.style === 'text') return `<mrow displaystyle="false" scriptlevel="0">${frac}</mrow>`
      return frac
    }
    case 'sqrt':
      return node.index ? `<mroot>${toMathML(node.body)}${toMathML(node.index)}</mroot>` : `<msqrt>${toMathML(node.body)}</msqrt>`
    case 'fenced':
      return `<mrow>${fence(node.open, 'prefix')}${toMathML(node.body)}${fence(node.close, 'postfix')}</mrow>`
    case 'accent': {
      const mark = `<mo stretchy="${node.stretchy ? 'true' : 'false'}">${escape(node.mark)}</mo>`
      return node.under ? `<munder accentunder="true">${toMathML(node.base)}${mark}</munder>` : `<mover accent="true">${toMathML(node.base)}${mark}</mover>`
    }
    case 'table': {
      const rows = node.rows
        .map((cells) => {
          const tds = cells
            .map((cell, i) => {
              const style: string[] = [`text-align:${alignOf(node, i)}`]
              // Aligned equations: the two columns of a pair meet, pairs stand apart.
              if (node.aligned) style.push(i % 2 === 0 ? 'padding-right:0' : 'padding-left:0', i % 2 === 1 && i < cells.length - 1 ? 'padding-right:2em' : '')
              if (node.lines?.[i] === 'solid') style.push('border-right:1px solid')
              return `<mtd style="${style.filter(Boolean).join(';')}">${toMathML(cell)}</mtd>`
            })
            .join('')
          return `<mtr>${tds}</mtr>`
        })
        .join('')
      const table = `<mtable${node.small ? ' scriptlevel="1"' : ''}>${rows}</mtable>`
      if (!node.open && !node.close) return table
      return `<mrow>${fence(node.open ?? '', 'prefix')}${table}${fence(node.close ?? '', 'postfix')}</mrow>`
    }
    case 'style': {
      const a: string[] = []
      if (node.display !== undefined) a.push(`displaystyle="${node.display}"`)
      if (node.scriptLevel !== undefined) a.push(`scriptlevel="${node.scriptLevel}"`)
      if (node.color) a.push(`style="color:${escape(node.color)}"`)
      return `<mrow ${a.join(' ')}>${toMathML(node.body)}</mrow>`
    }
    case 'phantom':
      return `<mphantom>${toMathML(node.body)}</mphantom>`
    case 'boxed':
      return `<mrow style="border:1px solid;padding:0.15em 0.3em">${toMathML(node.body)}</mrow>`
  }
}

/** A row's children; a function name followed by its argument gets the invisible application sign. */
function rowChildren(children: MathNode[]): string {
  return children.map((c, i) => toMathML(c) + (c.type === 'ident' && isFunction(c) && i < children.length - 1 ? APPLY : '')).join('')
}

function isFunction(node: MathNode): boolean {
  return node.type === 'ident' && node.upright === true && [...node.text].length > 1
}

function alignOf(node: Extract<MathNode, { type: 'table' }>, i: number): string {
  const a = node.aligned ? (i % 2 === 0 ? 'r' : 'l') : (node.align[Math.min(i, node.align.length - 1)] ?? 'c')
  return a === 'l' ? 'left' : a === 'r' ? 'right' : 'center'
}

function fence(text: string, form: 'prefix' | 'postfix'): string {
  if (text === '') return ''
  return `<mo fence="true" form="${form}" stretchy="true" symmetric="true">${escape(text)}</mo>`
}
