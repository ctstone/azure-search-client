import nock = require('nock');

export class MockSearchService {
  scope: nock.Scope;

  constructor(private service: string) {
    this.scope = nock(`https://${service}.search.windows.net`);
  }

  postQuery(statusCode: number, index: string, query: any, body?: any, headers?: any): MockSearchService {
    this.scope = this.scope
      .post(`/indexes/${index}/docs/search`, query)
      .query(true)
      .reply(statusCode, body, headers);
    return this;
  }
}
