// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type StructuredQuery from "../StructuredQuery";
// eslint-disable-next-line import/no-default-export -- deprecated usage
export default class MBQLArrayClause extends Array {
  _index: number;
  _query: StructuredQuery;

  constructor(
    mbql: Array<any>,
    index?: number | null | undefined,
    query?: StructuredQuery,
  ) {
    super(...mbql);

    _private(this, "_index", index);

    _private(this, "_query", query);
  }

  // There is a mismatch between the constructor args for `MBQLArrayClause` and `Array`
  // so we need to reconcile things in the MBQLArrayClause[Symbol.species] constructor function
  // See https://stackoverflow.com/questions/54522949
  static get [Symbol.species]() {
    return Object.assign(function (...items) {
      return new MBQLArrayClause(new Array(...items), this._index, this._query);
    }, MBQLArrayClause);
  }

  set(mbql: any[]) {
    return new this.constructor(mbql, this._index, this._query);
  }

  replace(_replacement: Array<any>): StructuredQuery {
    throw new Error("Abstract method `replace` not implemented");
  }

  /**
   * returns the parent query object
   */
  legacyQuery(): StructuredQuery {
    return this._query;
  }

  setQuery(query: StructuredQuery) {
    return new this.constructor(this, this._index, query);
  }

  index() {
    return this._index;
  }

  parent() {
    return this.replace(this);
  }

  /**
   * return the Metadata instance from the linked Query
   */
  metadata() {
    return this._query.metadata();
  }

  raw(): any[] {
    return [...this];
  }
}
export class MBQLObjectClause {
  _index: number;
  _query: StructuredQuery;

  constructor(
    mbql: Record<string, any>,
    index?: number | null | undefined,
    query?: StructuredQuery,
  ) {
    Object.assign(this, mbql);

    _private(this, "_index", index);

    _private(this, "_query", query);
  }

  set(mbql: any) {
    return new this.constructor(mbql, this._index, this._query);
  }

  replace(_replacement: any): StructuredQuery {
    throw new Error("Abstract method `replace` not implemented");
  }

  /**
   * returns the parent query object
   */
  legacyQuery(): StructuredQuery {
    return this._query;
  }

  setQuery(query: StructuredQuery) {
    return new this.constructor(this, this._index, query);
  }

  index() {
    return this._index;
  }

  parent() {
    return this.replace(this);
  }

  /**
   * return the Metadata instance from the linked Query
   */
  metadata() {
    return this._query.metadata();
  }

  raw() {
    const entriesWithDefinedValue = Object.entries(this).filter(entry => {
      const [, value] = entry;
      return value !== undefined;
    });
    return Object.fromEntries(entriesWithDefinedValue);
  }
}

function _private(object, key, value) {
  // this prevents properties from being serialized
  Object.defineProperty(object, key, {
    value: value,
    enumerable: false,
  });
}
