# Security

`@dskripchenko/math` turns TeX that may come from anyone — a formula in a
document, a comment, a page — into MathML. Its job is that this TeX can never
become active content in the page that shows it.

## What it guarantees

- **Escaped output.** Every piece of the TeX that reaches the output — names,
  numbers, text, the annotation, an error's text and title — has `&`, `<`, `>`
  and `"` escaped; the only markup is the package's own MathML elements.
- **No style injection.** A colour (`\color`, `\textcolor`, `\colorbox`) is
  taken only as a name of letters or a hex value; anything else is an error.
- **No code execution.** Nothing from the TeX is evaluated; macros are text
  substituted into the TeX, under the same limits.
- **Bounded work.** Groups and arguments nest at most 256 deep, a formula has
  at most 20 000 tokens, macros expand at most 2 000 times; the tests feed
  pathological input (thousands of braces, chains of `\frac`, macros that call
  themselves) and check that it fails fast.

## Reporting a vulnerability

Please report it privately through
[GitHub security advisories](https://github.com/dskripchenko/math/security/advisories/new)
rather than a public issue. Include the TeX that reproduces it.
