import { FieldName } from "./query-builder";

interface FacetParameters {
  count?: number;
  sort?: string;
  values?: string;
  interval?: string;
  timeoffset?: string;
}

export enum FacetDateInterval {
  minute = 'minute',
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  quarter = 'quarter',
  year = 'year',
}

export class QueryFacet<TDocument = any> {
  private params: FacetParameters = {};

  constructor(private field: FieldName<TDocument>) { }

  /**
   * Set the max number of facet terms
   * @param maxFacetTerms maximum number of facet terms to return
   */
  count(maxFacetTerms: number) {
    this.params.count = maxFacetTerms;
    return this;
  }

  /**
   * Sort facet terms by number of occurences
   * @param dir sort direction
   */
  sortByCount(dir: 'asc' | 'desc' = 'desc') {
    this.params.sort = `${dir === 'asc' ? '-' : ''}count`;
    return this;
  }

  /**
   * Sort facet terms alphabetically
   * @param dir sort direction
   */
  sortByValue(dir: 'asc' | 'desc' = 'asc') {
    this.params.sort = `${dir === 'desc' ? '-' : ''}value`;
    return this;
  }

  /**
   * Assign facet values to a dynamic set of buckets
   * @param values list of values against which facet values will be partitioned
   */
  values(...values: Array<number | Date>) {
    this.params.values = values
      .map((x) => x instanceof Date ? x.toISOString() : x.toString())
      .join('|');
    return this;
  }

  /**
   * Assign fact values to a static set of buckets
   * @param value size of each bucket
   */
  interval(value: number | FacetDateInterval) {
    this.params.interval = value.toString();
    return this;
  }

  /**
   * Set the UTC time offset to account for time boundaries
   * @param hours offset hours (may be negative)
   * @param minutes optional offset minutes
   */
  timeoffset(hours: number, minutes = 0) {
    const sign = hours < 0 ? '-' : '';
    const h = Math.abs(hours).toString();
    const hh = h.length === 1 ? `0${h}` : h;
    const m = Math.abs(minutes).toString();
    const mm = m.length === 1 ? `0${m}` : m;
    this.params.timeoffset = `${sign}${hh}:${mm}}`;
    return this;
  }

  /**
   * Return the facet string directive
   */
  toString() {
    const params = [
      ['count', this.params.count],
      ['sort', this.params.sort],
      ['values', this.params.values],
      ['interval', this.params.interval],
      ['timeoffset', this.params.timeoffset],
    ]
      .filter(([key, val]) => !!val)
      .map(([key, val]) => `${key}:${val}`)
      .join(',');
    return this.field + (params ? `,${params}` : '');
  }
}
