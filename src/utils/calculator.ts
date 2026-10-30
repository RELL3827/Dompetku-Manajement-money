/**
 * Math Expression Evaluator for Financial Calculator
 * 100% CSP Safe: Pure Recursive Descent Parser without `eval()` or `new Function()`
 */

export function evaluateMathExpression(rawExpr: string): number {
  if (!rawExpr || typeof rawExpr !== 'string') return 0;

  // Replace multiplication and division symbols, Indonesian comma decimal separator
  let expr = rawExpr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/,/g, '.')
    .replace(/\s+/g, '');

  if (!expr) return 0;

  // Trim trailing operator(s) for live preview while user is typing
  expr = expr.replace(/[+\-*/(]+$/, '');
  if (!expr) return 0;

  let pos = 0;

  function peek(): string {
    return expr[pos] || '';
  }

  function get(): string {
    return expr[pos++] || '';
  }

  function parseFactor(baseForAddSub: number | null = null): number {
    // Unary plus/minus
    if (peek() === '+') {
      get();
      return parseFactor(baseForAddSub);
    }
    if (peek() === '-') {
      get();
      return -parseFactor(baseForAddSub);
    }

    // Parentheses
    if (peek() === '(') {
      get(); // consume '('
      const val = parseExpression();
      if (peek() === ')') {
        get(); // consume ')'
      }
      return parsePercent(val, baseForAddSub);
    }

    // Number with optional decimals
    let numStr = '';
    while ((peek() >= '0' && peek() <= '9') || peek() === '.') {
      numStr += get();
    }

    if (!numStr) {
      return 0;
    }

    let val = parseFloat(numStr);
    if (isNaN(val)) val = 0;

    return parsePercent(val, baseForAddSub);
  }

  function parsePercent(val: number, baseForAddSub: number | null): number {
    if (peek() === '%') {
      get();
      // If used in addition/subtraction (e.g. 100000 + 10%), scale with base
      if (baseForAddSub !== null && baseForAddSub !== 0) {
        return (baseForAddSub * val) / 100;
      }
      return val / 100;
    }
    return val;
  }

  function parseTerm(baseForAddSub: number | null = null): number {
    let val = parseFactor(baseForAddSub);
    while (peek() === '*' || peek() === '/') {
      const op = get();
      // For multiplication and division, do not scale percent by base
      const nextFactor = parseFactor(null);
      if (op === '*') {
        val = val * nextFactor;
      } else {
        val = nextFactor !== 0 ? val / nextFactor : 0;
      }
    }
    return val;
  }

  function parseExpression(): number {
    let val = parseTerm(null);
    while (peek() === '+' || peek() === '-') {
      const op = get();
      // Pass previous value to scale percent if user types e.g. 100000 + 10%
      const nextTerm = parseTerm(val);
      if (op === '+') {
        val = val + nextTerm;
      } else {
        val = val - nextTerm;
      }
    }
    return val;
  }

  try {
    const res = parseExpression();
    if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
      return Math.round(res);
    }
    return 0;
  } catch {
    return 0;
  }
}
