import { LambdaQueryFilter } from './lambda-query-filter';
import { FieldName, QueryBuilder } from './query-builder';

export enum Logical {
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

type Expression<TDocument> = string | QueryFilter<TDocument>;

const LAMBDA_VAR = 'x';

export type Scalar = string | number | boolean | Date;

export enum GeoComparison {
  gt = 'gt',
  lt = 'lt',
  ge = 'ge',
  le = 'le',
}

/** Construct a filter string to be used with Azure Search */
export class QueryFilter<TDocument = any> {

  /** join multiple filters together with a logical NOT */
  static not<TDocument>(...filters: Array<QueryFilter<TDocument>>) {
    return QueryFilter.join(Logical.not, ...filters);
  }

  /** join multiple filters together with a logical OR */
  static or<TDocument>(...filters: Array<QueryFilter<TDocument>>) {
    return QueryFilter.join(Logical.or, ...filters);
  }

  /** join multiple filters together with a logical AND */
  static and<TDocument>(...filters: Array<QueryFilter<TDocument>>) {
    return QueryFilter.join(Logical.and, ...filters);
  }

  private static join<TDocument>(mode: Logical, ...filters: Array<QueryFilter<TDocument>>) {
    const qf = new QueryFilter<TDocument>();
    qf.mode = mode;
    qf.expressions = filters;
    return qf;
  }

  private expressions: Array<Expression<TDocument>> = [];

  constructor(private mode = Logical.and) { }

  /** append a new filter to this query using a logical AND */
  and(...filters: Array<QueryFilter<TDocument>>): this {
    return this.append(QueryFilter.and(...filters));
  }

  /** append a new filter to this query using a logical OR */
  or(...filters: Array<QueryFilter<TDocument>>): this {
    return this.append(QueryFilter.or(...filters));
  }

  /** append a new filter to this query using a logical NOT */
  not(...filters: Array<QueryFilter<TDocument>>): this {
    return this.append(QueryFilter.not(...filters));
  }

  /** apply the equals operator */
  eq<K extends FieldName<TDocument>>(field: K, value: TDocument[K]) {
    return this.compare(Comparison.eq, field, value);
  }

  /** apply the not-equal operator */
  ne<K extends FieldName<TDocument>>(field: K, value: TDocument[K]) {
    return this.compare(Comparison.ne, field, value);
  }

  /** apply the greater-than operator */
  gt<K extends FieldName<TDocument>>(field: K, value: TDocument[K]) {
    return this.compare(Comparison.gt, field, value);
  }

  /** apply the less-than operator */
  lt<K extends FieldName<TDocument>>(field: K, value: TDocument[K]) {
    return this.compare(Comparison.lt, field, value);
  }

  /** apply the greater-than-or-equal-to operator */
  ge<K extends FieldName<TDocument>>(field: K, value: TDocument[K]) {
    return this.compare(Comparison.ge, field, value);
  }

  /** apply the less-than-or-equal-to operator */
  le<K extends FieldName<TDocument>>(field: K, value: TDocument[K]) {
    return this.compare(Comparison.le, field, value);
  }

  /** apply the search.in filter */
  in<K extends FieldName<TDocument>>(field: K, values: string[], separator = '|') {
    values = values.map((x) => x.replace(`'`, `\\'`));
    this.append(`search.in(${field}, '${values.join(separator)}', '${separator}')`);
    return this;
  }

  /**
   * Evaluates search query as a part of a filter expression
   * @param search the search query (in either simple or full query syntax).
   * @param searchFields searchable fields to search in, defaults to all searchable fields in the index.
   * @param queryType "simple" or "full", defaults to "simple". Specifies what query language was used in the search parameter.
   * @param searchMode "any" or "all", defaults to "any". Indicates whether any or all of the search terms must be matched in order to count the document as a match.
   */
  isMatch(search: string, searchFields?: Array<FieldName<TDocument>>, queryType?: 'simple' | 'full', searchMode?: 'any' | 'all') {
    const params = [search, searchFields ? searchFields.join(',') : null, queryType, searchMode]
      .filter((x) => !!x)
      .map((x) => `'${x.replace(/'/g, `\'`)}'`)
      .join(', ');
    this.append(`search.ismatch(${params})`);
    return this;
  }

  /**
   * Evaluates search query as a part of a filter expression (with relevance score of documents matching this filter contributing to the overall document score)
   * @param search the search query (in either simple or full query syntax).
   * @param searchFields searchable fields to search in, defaults to all searchable fields in the index.
   * @param queryType "simple" or "full", defaults to "simple". Specifies what query language was used in the search parameter.
   * @param searchMode "any" or "all", defaults to "any". Indicates whether any or all of the search terms must be matched in order to count the document as a match.
   */
  isMatchScoring(search: string, searchFields?: Array<FieldName<TDocument>>, queryType?: 'simple' | 'full', searchMode?: 'any' | 'all') {
    const params = [search, searchFields ? searchFields.join(',') : null, queryType, searchMode]
      .filter((x) => !!x)
      .map((x) => `'${x.replace(/'/g, `\'`)}'`)
      .join(', ');
    this.append(`search.ismatchscoring(${params})`);
    return this;
  }

  /**
   * Filter string collection such that any member may match a predicate
   * @param field index field name
   * @param filter optional lambda filter. If omitted, the filter will return true if the collection has at least 1 item.
   */
  any<K extends FieldName<TDocument>>(field: K, filter?: (lambda: LambdaQueryFilter) => LambdaQueryFilter): this {
    const expression = filter ? filter(new LambdaQueryFilter()) : null;
    this.append(`${field}/any(${LAMBDA_VAR}: ${expression ? expression.toString(LAMBDA_VAR) : ''})`);
    return this;
  }

  /**
   * Filter string collection such that all members must match a predicate
   * @param field index field name
   * @param filter optional lambda filter. If omitted, the filter will return true if the collection has at least 1 item.
   */
  all<K extends FieldName<TDocument>>(field: K, filter?: (lambda: LambdaQueryFilter) => LambdaQueryFilter): this {
    const expression = filter ? filter(new LambdaQueryFilter()) : null;
    this.append(`${field}/all(${LAMBDA_VAR}: ${expression ? expression.toString(LAMBDA_VAR) : ''})`);
    return this;
  }

  /** apply a field reference filter */
  field(fieldName: FieldName<TDocument>) {
    this.append(fieldName as string);
    return this;
  }

  /**
   * Returns the distance in kilometers between two points, one being a field and one being a constant passed as part of the filter.
   * @param field index field name
   * @param point [lat, lon]
   * @param op comparison operator
   * @param value comparison operand
   */
  geoDistance<K extends FieldName<TDocument>>(field: K, point: [number, number], op: GeoComparison, value: number) {
    this.append(`geo.distance(${field}, geography'POINT(${point[0]} ${point[1]})') ${op} ${value}`);
    return this;
  }

  /**
   * Returns true if a given point is within a given polygon, where the point is a field and the polygon is specified as a constant passed as part of the filter.
   * @param field index field name
   * @param polygon array of [lat, lon]
   */
  geoIntersects<K extends FieldName<TDocument>>(field: K, polygon: Array<[number, number]>) {
    const points = polygon
      .map(([x, y]) => `${x} ${y}`)
      .join(', ');
    this.append(`geo.intersects(${field}, geography'POLYGON((${points}))')`);
    return this;
  }

  /** return filter as a string */
  toString(): string {
    const ops = this.expressions
      .filter((x) => x)
      .map((x) => typeof (x) === 'string' ? x : `${x.toString()}`)
      .filter((x) => x.trim())
      .map((x) => `(${x})`)
      .map((x) => this.isUnary() ? ` ${this.mode} ${x} ` : x);
    return ops.length ? ops.join(this.isUnary() ? ' ' : ` ${this.mode} `) : '';
  }

  private compare<K extends FieldName<TDocument>>(op: Comparison, field: K, value: TDocument[K]) {
    return this.append(`${field} ${op} ${this.prepValue(value)}`);
  }

  private append(expression: Expression<TDocument>) {
    this.expressions.push(expression);
    return this;
  }

  private prepValue<K extends FieldName<TDocument>>(value: TDocument[K]) {
    if (typeof value === 'string') {
      value = `'${value.replace(`'`, `\\'`)}'` as any;
    } else if (value instanceof Date) {
      value = value.toISOString() as any;
    }
    return value;
  }

  private isUnary() {
    return this.mode === Logical.not;
  }
}
