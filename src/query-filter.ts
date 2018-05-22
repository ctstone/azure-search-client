import { Query } from '.';

enum Logical {
  and = 'and',
  or = 'or',
  not = 'not',
}

enum Comparison {
  eq = 'eq',
  ne = 'ne',
  gt = 'gt',
  lt = 'lt',
  ge = 'ge',
  le = 'le',
}

type Expression = string | QueryFilter;

export type Scalar = string | number | boolean | Date;

/** Construct a filter string to be used with Azure Search */
export class QueryFilter {

  /** join multiple filters together with a logical NOT */
  static not(...filters: QueryFilter[]) {
    return QueryFilter.join(Logical.not, ...filters);
  }

  /** join multiple filters together with a logical OR */
  static or(...filters: QueryFilter[]) {
    return QueryFilter.join(Logical.or, ...filters);
  }

  /** join multiple filters together with a logical AND */
  static and(...filters: QueryFilter[]) {
    return QueryFilter.join(Logical.and, ...filters);
  }

  private static join(mode: Logical, ...filters: QueryFilter[]) {
    const qf = new QueryFilter();
    qf.mode = mode;
    qf.expressions = filters;
    return qf;
  }

  private mode = Logical.and;
  private expressions: Expression[] = [];

  /** append a new filter to this query using a logical AND */
  and(...filters: QueryFilter[]) {
    return this.append(QueryFilter.and(...filters));
  }

  /** append a new filter to this query using a logical OR */
  or(...filters: QueryFilter[]) {
    return this.append(QueryFilter.or(...filters));
  }

  /** append a new filter to this query using a logical NOT */
  not(...filters: QueryFilter[]) {
    return this.append(QueryFilter.not(...filters));
  }

  /** apply the equals operator */
  eq(field: string, value: Scalar) {
    return this.compare(Comparison.eq, field, value);
  }

  /** apply the not-equal operator */
  ne(field: string, value: Scalar) {
    return this.compare(Comparison.ne, field, value);
  }

  /** apply the greater-than operator */
  gt(field: string, value: Scalar) {
    return this.compare(Comparison.gt, field, value);
  }

  /** apply the less-than operator */
  lt(field: string, value: Scalar) {
    return this.compare(Comparison.lt, field, value);
  }

  /** apply the greater-than-or-equal-to operator */
  ge(field: string, value: Scalar) {
    return this.compare(Comparison.ge, field, value);
  }

  /** apply the less-than-or-equal-to operator */
  le(field: string, value: Scalar) {
    return this.compare(Comparison.le, field, value);
  }

  /** apply the search.in filter */
  in(field: string, values: string[], separator = '|') {
    values = values.map((x) => x.replace(`'`, `\\'`));
    this.append(`search.in(${field}, '${values.join(separator)}', '${separator}')`);
    return this;
  }

  /**
   * @throws Not Implemented
   */
  isMatch() {
    throw new Error('Not implemented');
  }

  /**
   * @throws Not Implemented
   */
  isMatchScoring() {
    throw new Error('Not implemented');
  }

  /**
   * @throws Not Implemented
   */
  any() {
    throw new Error('Not implemented');
  }

  /**
   * @throws Not Implemented
   */
  all() {
    throw new Error('Not implemented');
  }

  /** apply a field reference filter */
  ref(fieldName: string) {
    this.append(fieldName);
  }

  /**
   * @throws Not Implemented
   */
  geoDistance() {
    throw new Error('Not implemented');
  }

  /**
   * @throws Not Implemented
   */
  geoIntersects() {
    throw new Error('Not implemented');
  }

  /** return filter as a string */
  compile(): string {
    const ops = this.expressions
      .filter((x) => x)
      .map((x) => typeof (x) === 'string' ? x : `${x.compile()}`)
      .filter((x) => x.trim())
      .map((x) => `(${x})`)
      .map((x) => this.isUnary() ? ` ${this.mode} ${x} ` : x);
    return ops.length ? ops.join(this.isUnary() ? ' ' : ` ${this.mode} `) : '';
  }

  private compare(op: Comparison, field: string, value: Scalar) {
    return this.append(`${field} ${op} ${this.prepValue(value)}`);
  }

  private append(expression: Expression) {
    this.expressions.push(expression);
    return this;
  }

  private prepValue(value: Scalar) {
    if (typeof value === 'string') {
      value = `'${value.replace(`'`, `\\'`)}'`;
    } else if (value instanceof Date) {
      value = value.toISOString();
    }
    return value;
  }

  private isUnary() {
    return this.mode === Logical.not;
  }
}
