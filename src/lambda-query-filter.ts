enum Comparison {
  eq = 'eq',
  ne = 'ne',
  gt = 'gt',
  lt = 'lt',
  ge = 'ge',
  le = 'le',
}

enum Logical {
  and = 'and',
  or = 'or',
  not = 'not',
}

type Expression = ((token: string) => string) | LambdaQueryFilter;

export class LambdaQueryFilter {

  /** join multiple filters together with a logical NOT */
  static not(...filters: LambdaQueryFilter[]) {
    return LambdaQueryFilter.join(Logical.not, ...filters);
  }

  /** join multiple filters together with a logical OR */
  static or(...filters: LambdaQueryFilter[]) {
    return LambdaQueryFilter.join(Logical.or, ...filters);
  }

  /** join multiple filters together with a logical AND */
  static and(...filters: LambdaQueryFilter[]) {
    return LambdaQueryFilter.join(Logical.and, ...filters);
  }

  private static join(mode: Logical, ...filters: LambdaQueryFilter[]) {
    const qf = new LambdaQueryFilter();
    qf.mode = mode;
    qf.expressions = filters;
    return qf;
  }

  private expressions: Expression[] = [];
  private mode = Logical.and;

  /** append a new filter to this query using a logical AND */
  and(...filters: LambdaQueryFilter[]) {
    return this.append(LambdaQueryFilter.and(...filters));
  }

  /** append a new filter to this query using a logical OR */
  or(...filters: LambdaQueryFilter[]) {
    return this.append(LambdaQueryFilter.or(...filters));
  }

  /** append a new filter to this query using a logical NOT */
  not(...filters: LambdaQueryFilter[]) {
    return this.append(LambdaQueryFilter.not(...filters));
  }

  /** apply the equals operator */
  eq(value: string) {
    return this.compare(Comparison.eq, value);
  }

  /** apply the not-equal operator */
  ne(value: string) {
    return this.compare(Comparison.ne, value);
  }

  /** apply the greater-than operator */
  gt(value: string) {
    return this.compare(Comparison.gt, value);
  }

  /** apply the less-than operator */
  lt(value: string) {
    return this.compare(Comparison.lt, value);
  }

  /** apply the greater-than-or-equal-to operator */
  ge(value: string) {
    return this.compare(Comparison.ge, value);
  }

  /** apply the less-than-or-equal-to operator */
  le(value: string) {
    return this.compare(Comparison.le, value);
  }

  /** apply the search.in filter */
  in(values: string[], separator = '|') {
    values = values.map((x) => x.replace(`'`, `\\'`));
    this.append((x) => `search.in(${x}, '${values.join(separator)}', '${separator}')`);
    return this;
  }

  /** return filter as a string */
  toString(variable: string): string {
    const ops = this.expressions
      .filter((x) => x)
      .map((x) => typeof (x) === 'function' ? x(variable) : `${x.toString(variable)}`)
      .filter((x) => x.trim())
      .map((x) => `(${x})`)
      .map((x) => this.isUnary() ? ` ${this.mode} ${x} ` : x);
    return ops.length ? ops.join(this.isUnary() ? ' ' : ` ${this.mode} `) : '';
  }

  private compare(op: Comparison, value: string) {
    return this.append((x) => `${x} ${op} ${this.prepValue(value)}`);
  }

  private prepValue(value: string) {
    return `'${value.replace(`'`, `\\'`)}'`;
  }

  private append(expression: Expression) {
    this.expressions.push(expression);
    return this;
  }

  private isUnary() {
    return this.mode === Logical.not;
  }
}
