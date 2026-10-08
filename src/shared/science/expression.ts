/**
 * Lecture sûre d'expressions mathématiques saisies par l'enseignant (jamais `eval`) :
 * nombres, variables, + − × ÷ ^, parenthèses, multiplication implicite (2x, 3(x+1), 2 pi),
 * fonctions usuelles et constantes pi, e.
 */
export type Scope = Readonly<Record<string, number>>;
export type CompiledExpression = (scope: Scope) => number;
export type ParseResult =
  | { ok: true; evaluate: CompiledExpression; variables: string[] }
  | { ok: false; error: string; position: number };

const FUNCTIONS: Readonly<Record<string, (...args: number[]) => number>> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  log10: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
};

const CONSTANTS: Readonly<Record<string, number>> = { pi: Math.PI, e: Math.E };

type Token =
  | { type: 'number'; value: number; position: number }
  | { type: 'name'; value: string; position: number }
  | { type: 'op'; value: string; position: number };

class ExpressionError extends Error {
  readonly position: number;

  constructor(message: string, position: number) {
    super(message);
    this.position = position;
  }
}

/** Symboles saisis au clavier ou collés depuis un traitement de texte. */
const SYMBOLS: Readonly<Record<string, string>> = { '×': '*', '·': '*', '÷': '/', '−': '-' };

const tokenize = (source: string): Token[] => {
  const tokens: Token[] = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index] ?? '';
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    const number = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(source.slice(index));
    if (number) {
      tokens.push({ type: 'number', value: Number(number[0]), position: index });
      index += number[0].length;
      continue;
    }
    const name = /^[A-Za-z_Ͱ-Ͽ][A-Za-z0-9_Ͱ-Ͽ]*/.exec(source.slice(index));
    if (name) {
      tokens.push({ type: 'name', value: name[0], position: index });
      index += name[0].length;
      continue;
    }
    const normalized = SYMBOLS[char] ?? char;
    if (char === '²') {
      tokens.push({ type: 'op', value: '^', position: index });
      tokens.push({ type: 'number', value: 2, position: index });
      index += 1;
      continue;
    }
    if ('+-*/^(),'.includes(normalized)) {
      tokens.push({ type: 'op', value: normalized, position: index });
      index += 1;
      continue;
    }
    throw new ExpressionError(`Caractère inattendu « ${char} »`, index);
  }
  return tokens;
};

/** Grec écrit en toutes lettres : « theta » → θ, « omega » → ω (variables usuelles). */
const GREEK: Readonly<Record<string, string>> = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  theta: 'θ',
  lambda: 'λ',
  mu: 'μ',
  omega: 'ω',
  phi: 'φ',
  tau: 'τ',
};

export const canonicalName = (name: string) => GREEK[name] ?? name;

const parseTokens = (tokens: Token[], variables: Set<string>): CompiledExpression => {
  let index = 0;
  const peek = () => tokens[index];
  const isOp = (value: string) => {
    const token = peek();
    return token?.type === 'op' && token.value === value;
  };
  const expectOp = (value: string) => {
    const token = peek();
    if (!(token?.type === 'op' && token.value === value)) {
      throw new ExpressionError(`« ${value} » attendu`, token?.position ?? -1);
    }
    index += 1;
  };
  /** Un facteur peut suivre directement (multiplication implicite) : nombre, nom, parenthèse. */
  const startsFactor = () => {
    const token = peek();
    return token !== undefined && (token.type !== 'op' || token.value === '(');
  };

  const parseSum = (): CompiledExpression => {
    let left = parseProduct();
    while (isOp('+') || isOp('-')) {
      const op = (peek() as Token).value;
      index += 1;
      const right = parseProduct();
      const a = left;
      left = op === '+' ? (s) => a(s) + right(s) : (s) => a(s) - right(s);
    }
    return left;
  };

  const parseProduct = (): CompiledExpression => {
    let left = parseUnary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = (peek() as Token).value;
        index += 1;
        const right = parseUnary();
        const a = left;
        left = op === '*' ? (s) => a(s) * right(s) : (s) => a(s) / right(s);
      } else if (startsFactor()) {
        const right = parsePower();
        const a = left;
        left = (s) => a(s) * right(s);
      } else {
        return left;
      }
    }
  };

  const parseUnary = (): CompiledExpression => {
    if (isOp('-')) {
      index += 1;
      const operand = parseUnary();
      return (s) => -operand(s);
    }
    if (isOp('+')) {
      index += 1;
      return parseUnary();
    }
    return parsePower();
  };

  const parsePower = (): CompiledExpression => {
    const base = parseAtom();
    if (isOp('^')) {
      index += 1;
      const exponent = parseUnary(); // associatif à droite : 2^3^2 = 2^9
      return (s) => Math.pow(base(s), exponent(s));
    }
    return base;
  };

  const parseAtom = (): CompiledExpression => {
    const token = peek();
    if (!token) throw new ExpressionError('Expression incomplète', -1);
    if (token.type === 'number') {
      index += 1;
      const value = token.value;
      return () => value;
    }
    if (token.type === 'op' && token.value === '(') {
      index += 1;
      const inner = parseSum();
      expectOp(')');
      return inner;
    }
    if (token.type === 'name') {
      index += 1;
      const fn = FUNCTIONS[token.value];
      if (fn && isOp('(')) {
        index += 1;
        const args: CompiledExpression[] = [parseSum()];
        while (isOp(',')) {
          index += 1;
          args.push(parseSum());
        }
        expectOp(')');
        return (s) => fn(...args.map((arg) => arg(s)));
      }
      const constant = CONSTANTS[token.value];
      if (constant !== undefined) return () => constant;
      const name = canonicalName(token.value);
      variables.add(name);
      return (s) => s[name] ?? Number.NaN;
    }
    throw new ExpressionError(`« ${token.value} » inattendu`, token.position);
  };

  const result = parseSum();
  const rest = peek();
  if (rest) throw new ExpressionError(`« ${String(rest.value)} » inattendu`, rest.position);
  return result;
};

const cache = new Map<string, ParseResult>();

/** Analyse une expression (résultat mis en cache). */
export const parseExpression = (source: string): ParseResult => {
  const cached = cache.get(source);
  if (cached) return cached;
  let result: ParseResult;
  try {
    const tokens = tokenize(source);
    if (tokens.length === 0) throw new ExpressionError('Expression vide', 0);
    const variables = new Set<string>();
    const evaluate = parseTokens(tokens, variables);
    result = { ok: true, evaluate, variables: [...variables] };
  } catch (error) {
    const position = error instanceof ExpressionError ? error.position : -1;
    const message = error instanceof Error ? error.message : String(error);
    result = { ok: false, error: message, position };
  }
  cache.set(source, result);
  return result;
};

/** Évalue directement une expression ; NaN si elle est invalide. */
export const evaluateExpression = (source: string, scope: Scope): number => {
  const parsed = parseExpression(source);
  return parsed.ok ? parsed.evaluate(scope) : Number.NaN;
};
