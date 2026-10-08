const GREEK: readonly (readonly [string, string])[] = [
  ['α', 'alpha'],
  ['β', 'beta'],
  ['γ', 'gamma'],
  ['δ', 'delta'],
  ['θ', 'theta'],
  ['λ', 'lambda'],
  ['μ', 'mu'],
  ['ρ', 'rho'],
  ['σ', 'sigma'],
  ['τ', 'tau'],
  ['φ', 'phi'],
  ['ω', 'omega'],
  ['Ω', 'Omega'],
  ['π', 'pi'],
  ['ε', 'epsilon'],
  ['η', 'eta'],
];

/** Palette de symboles pour la physique : ce qui s'affiche → code LaTeX inséré. */
export type SymbolGroup = { id: string; symbols: readonly { label: string; latex: string }[] };

export const SYMBOL_GROUPS: readonly SymbolGroup[] = [
  {
    id: 'structures',
    symbols: [
      { label: 'a/b', latex: '\\frac{}{}' },
      { label: 'x²', latex: '^{2}' },
      { label: 'xᵢ', latex: '_{}' },
      { label: '√', latex: '\\sqrt{}' },
      { label: '( )', latex: '\\left( \\right)' },
      { label: '→v', latex: '\\vec{}' },
      { label: '‖v‖', latex: '\\lVert \\vec{} \\rVert' },
      { label: 'x̄', latex: '\\bar{}' },
    ],
  },
  {
    id: 'calculus',
    symbols: [
      { label: 'd/dt', latex: '\\frac{d}{dt}' },
      { label: 'dx/dt', latex: '\\frac{dx}{dt}' },
      { label: 'd²x/dt²', latex: '\\frac{d^2x}{dt^2}' },
      { label: '∂', latex: '\\partial' },
      { label: 'ẋ', latex: '\\dot{x}' },
      { label: '∫', latex: '\\int_{}^{}' },
      { label: '∑', latex: '\\sum_{}^{}' },
      { label: 'Δ', latex: '\\Delta ' },
      { label: 'lim', latex: '\\lim_{x \\to 0}' },
    ],
  },
  {
    id: 'greek',
    symbols: GREEK.map(([label, name]) => ({ label, latex: `\\${name} ` })),
  },
  {
    id: 'operators',
    symbols: [
      { label: '×', latex: '\\times ' },
      { label: '·', latex: '\\cdot ' },
      { label: '≈', latex: '\\approx ' },
      { label: '≠', latex: '\\neq ' },
      { label: '≤', latex: '\\leq ' },
      { label: '≥', latex: '\\geq ' },
      { label: '∝', latex: '\\propto ' },
      { label: '±', latex: '\\pm ' },
      { label: '∞', latex: '\\infty ' },
      { label: '°', latex: '^{\\circ}' },
    ],
  },
  {
    id: 'units',
    symbols: [
      { label: 'm·s⁻¹', latex: '\\,\\text{m}\\cdot\\text{s}^{-1}' },
      { label: 'm·s⁻²', latex: '\\,\\text{m}\\cdot\\text{s}^{-2}' },
      { label: 'kg', latex: '\\,\\text{kg}' },
      { label: 'N', latex: '\\,\\text{N}' },
      { label: 'J', latex: '\\,\\text{J}' },
      { label: 'W', latex: '\\,\\text{W}' },
      { label: 'Pa', latex: '\\,\\text{Pa}' },
      { label: 'V', latex: '\\,\\text{V}' },
      { label: 'A', latex: '\\,\\text{A}' },
      { label: 'Ω', latex: '\\,\\Omega' },
      { label: 'Hz', latex: '\\,\\text{Hz}' },
      { label: 'mol', latex: '\\,\\text{mol}' },
    ],
  },
  {
    id: 'arrows',
    symbols: [
      { label: '→', latex: '\\rightarrow ' },
      { label: '⇌', latex: '\\rightleftharpoons ' },
      { label: '⇒', latex: '\\Rightarrow ' },
      { label: '⇔', latex: '\\Leftrightarrow ' },
      { label: 'H₂O', latex: '\\ce{H2O}' },
      { label: 'A→B', latex: '\\ce{A -> B}' },
    ],
  },
];

/** Insère un code LaTeX à la place de la sélection ; le curseur se place dans la 1re accolade vide. */
export const insertSnippet = (
  source: string,
  selectionStart: number,
  selectionEnd: number,
  snippet: string,
): { text: string; cursor: number } => {
  const text = source.slice(0, selectionStart) + snippet + source.slice(selectionEnd);
  const emptyBraces = snippet.indexOf('{}');
  const cursor = selectionStart + (emptyBraces >= 0 ? emptyBraces + 1 : snippet.length);
  return { text, cursor };
};
