import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import type { LiteElement, LiteNode } from 'mathjax-full/js/adaptors/lite/Element.js';
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
import { parseTranslate, withWidths, type MathLayout, type MathTerm } from './mathLayout';

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

const isElement = (node: LiteNode): node is LiteElement => adaptor.kind(node) !== '#text';

const elementChildren = (node: LiteElement): LiteElement[] =>
  adaptor.childNodes(node).filter(isElement);

/** Empreinte d'un terme : suite des glyphes (data-c) et des types de nœuds. */
const signatureOf = (node: LiteElement): string => {
  const own = `${adaptor.kind(node)}:${String(adaptor.getAttribute(node, 'data-c') ?? adaptor.getAttribute(node, 'data-mml-node') ?? '')}`;
  return [own, ...elementChildren(node).map(signatureOf)].join('|');
};

/** Termes de premier niveau (on descend dans un groupe unique, ex. une accolade). */
const collectTerms = (node: LiteElement, offsetX: number, offsetY: number) => {
  let children = elementChildren(node);
  let x = offsetX;
  let y = offsetY;
  while (children.length === 1) {
    const only = children[0] as LiteElement;
    const kind = String(adaptor.getAttribute(only, 'data-mml-node') ?? '');
    if (kind !== 'mrow' && kind !== 'TeXAtom') break;
    const position = parseTranslate(adaptor.getAttribute(only, 'transform') as string | null);
    if (position.rest) break;
    x += position.x;
    y += position.y;
    children = elementChildren(only);
  }
  return children.map((child): Omit<MathTerm, 'width'> => {
    const position = parseTranslate(adaptor.getAttribute(child, 'transform') as string | null);
    const signature = signatureOf(child);
    adaptor.removeAttribute(child, 'transform');
    // pathLength : permet l'animation « Tracé » de chaque glyphe (longueur normalisée).
    const svg = adaptor.innerHTML(child).replace(/<path /g, '<path pathLength="1" ');
    return { svg, x: x + position.x, y: y + position.y, signature, extraTransform: position.rest };
  });
};

const layoutCache = new Map<string, MathLayout | null>();

/** Équation découpée en termes animables (mis en cache) ; null si le LaTeX est invalide. */
export const texToLayout = (latex: string): MathLayout | null => {
  const cached = layoutCache.get(latex);
  if (cached !== undefined) return cached;
  let layout: MathLayout | null = null;
  try {
    const container = mathDocument.convert(latex, { display: true }) as LiteElement;
    const svg = elementChildren(container).find((node) => adaptor.kind(node) === 'svg');
    const root = svg ? elementChildren(svg)[0] : undefined;
    const math = root ? elementChildren(root)[0] : undefined;
    const viewBox = svg ? String(adaptor.getAttribute(svg, 'viewBox') ?? '') : '';
    const [, minY = 0, width = 0, height = 0] = viewBox.split(/\s+/).map(Number);
    if (svg && root && math && width > 0 && !latex.includes('\\tag')) {
      layout = {
        minY,
        width,
        height,
        rootTransform: String(adaptor.getAttribute(root, 'transform') ?? 'scale(1,-1)'),
        terms: withWidths(collectTerms(math, 0, 0), width),
      };
    }
  } catch {
    layout = null;
  }
  layoutCache.set(latex, layout);
  return layout;
};
