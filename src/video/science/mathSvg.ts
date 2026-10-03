import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js';
import 'mathjax-full/js/input/tex/base/BaseConfiguration.js';
import 'mathjax-full/js/input/tex/boldsymbol/BoldsymbolConfiguration.js';
import 'mathjax-full/js/input/tex/mhchem/MhchemConfiguration.js';
import 'mathjax-full/js/input/tex/newcommand/NewcommandConfiguration.js';
import 'mathjax-full/js/input/tex/noundefined/NoUndefinedConfiguration.js';
import 'mathjax-full/js/input/tex/physics/PhysicsConfiguration.js';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { SVG } from 'mathjax-full/js/output/svg.js';

// MathJax en sortie SVG, sans DOM (liteAdaptor) : même résultat dans l'aperçu et le rendu MP4.
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const mathDocument = mathjax.document('', {
  InputJax: new TeX({
    packages: ['base', 'ams', 'newcommand', 'noundefined', 'boldsymbol', 'mhchem', 'physics'],
  }),
  OutputJax: new SVG({ fontCache: 'none' }),
});

const cache = new Map<string, string>();

/** Convertit une formule LaTeX en code SVG (mis en cache). Chaîne vide si la conversion échoue. */
export const texToSvg = (latex: string, display = false): string => {
  const key = `${display ? 'display' : 'inline'}:${latex}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  let svg = '';
  try {
    svg = adaptor.innerHTML(mathDocument.convert(latex, { display }));
  } catch {
    svg = '';
  }
  cache.set(key, svg);
  return svg;
};
