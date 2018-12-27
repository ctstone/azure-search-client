# Azure Search Client

[![Build Status](https://dev.azure.com/ctstone/stonedev/_apis/build/status/ctstone.azure-search-client?branchName=master)](https://dev.azure.com/ctstone/stonedev/_build/latest?definitionId=2?branchName=master)

    npm install azure-search-client

## Usage

### Basic query (async/await)

Use the `async/await` pattern:

```js
const { SearchService } = require('azure-search-client');

const client = new SearchService('myservice', 'mykey');
const resp = await client.indexes.use('myIndex').search({
  search: 'hello world',
});
console.log(resp.result.value); // array of result docs
```

### Basic query (callback)

Or use the Node `callback` pattern:

```js
client.indexes.use('myIndex').search({
  search: 'hello world',
}, (err, resp) => {
  if (err) { throw err; }
  console.log(resp.result.value); // array of result docs
});
```

### Query API

Use the Azure Search [POST query representation](https://docs.microsoft.com/en-us/rest/api/searchservice/search-documents#request)

> If you are using **TypeScript** see [how to use your own document models](#typescript-generics) on index operations.

```js
client.indexes.use('myIndex').search({
  count: true,
  facets: ['field1', 'field2'],
  filter: `field1 eq 123 and field2 ne 'foo'`,
  highlight: 'field1, field2',
  highlightPreTag: '<b>',
  highlightPostTag: '</b>',
  minimumCoverage: 90,
  orderby: 'field1 desc, field2',
  scoringProfile: 'myProfile',
  scoringParameters: [
    "currentLocation--122.123,44.77233",
    "lastLocation--121.499,44.2113"
  ],
  search: 'hello world',
  searchFields: 'field1, field2',
  searchMode: SearchMode.any,
  select: 'field1, field2',
  queryType: QueryType.simple,
  skip: 0,
  top: 10,
});
```

## Query builders

Use `QueryBuilder`, `QueryFilter`, `QueryFacet`, and `LambdaQueryFilter` helpers to build a query using method chaining.

Build a simple query:

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .count(true)
  .search('some search query')
  .top(20)
  .executeQuery();
```

Build a query with facets:

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .buildFacet('myFacetField1', (f) => f.count(20).sortByValue('desc'))
  .buildFacet('myFacetField2', (f) => f.interval('day'))
  .executeQuery();
```

There are multiple ways to specify facets (combine them as needed):

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .facet('myFacetField1', 'myFacetField2') // simple facet parameters
  .buildFacet('myFacetField3', (f) => f.count(20).sortByValue('desc')) // callback builder
  .facet(new QueryFacet('myFacetField4').count(20)) // constructor builder
  .facetExpression('myFacetField5,count:5,interval:100', 'myFacetField6,count10') // raw expression strings
  .executeQuery();
```

Build an `and` filtered query:

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .filter((f) => f.eq('myField1', 123).ne('myField2', 'foo')) // by default, filters are chained with 'and' operator
  .executeQuery();
```

Build an `or` filtered query:

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .filterOr((f) => f.eq('myField1', 123).ne('myField1', 456)) // chain filters with the 'or' operator
  .executeQuery();
```

Build a `not` filtered query:

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .filterNot((f) => f.eq('myField1', 123).ne('myField1', 456)) // chain filters with the 'or' operator
  .executeQuery();
```

Filter on `geoDistance`:

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .filter((f) => f.geoDistance('myGeoField', [122, 80], GeoComparison.lt, 10)) // find documents less than 10km from the point at (122, 80)
  .executeQuery();
```

Filter on a string collection:

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .filter((f) => f.any('myField1', (x) => x.eq('foo'))) // find documents where any member of 'myField1' is 'foo'
  .executeQuery();
```

Build an arbitrarily complex filter graph:

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .filter(QueryFilter.and(
    QueryFilter.or(
      new QueryFilter().eq('field1', 123).eq('field2', 456),
      new QueryFilter().eq('field1', 999),
    ),
    new QueryFilter(Logical.not).eq('field3', 'foo'),
  ))
  .executeQuery();
```

Specify filter as a raw string expression

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .filter(`myField1 eq 123 and myField2/any(x: x eq 'foo')`)
  .executeQuery();
```

Escape user input when using [Lucene query syntax](https://docs.microsoft.com/en-us/rest/api/searchservice/lucene-query-syntax-in-azure-search).

```js
await client.indexes.use('myIndex')
  .buildQuery()
  .queryType(QueryType.full)
  .search(QueryBuilder.escape('Find at&t documents')) // => "find at\&t documents"
  .executeQuery();
```

> All of the query builders support [TypeScript Generics](#typescript-generics).

## Indexing API

`azure-search-client` automatically batches indexing operations up to 1000 documents or 16 MB, whichever is lower. Use either the fully buffered API (promise/callback based) or the streaming API, depending on your needs.

### Fully buffered indexing API

Index documents using promise `async`/`await`

```js
const docs = getDocuments(); // arbitrarily large array of document objects
const results = await client.indexes.use('myIndex')
  .index(docs);
```

Or using a callback

```js
const docs = getDocuments(); // arbitrarily large array of document objects
client.indexes.use('myIndex')
  .index(docs, (err, results) => {
    if (err) { throw err; }
  });
```

### Streaming indexing API

When it is impractical to fully buffer an indexing payload, consider using the streaming API to pipe document objects into the index as fast as they can be read (while still buffering batches up to the Azure Search payload limits). This technique works best with streaming object sources like `csv-parse` and `json-stream`.

> The Node [pipeline](https://nodejs.org/docs/latest-v10.x/api/stream.html#stream_stream_pipeline_streams_callback) API was introduced in Node.js 10.x. For use on older versions, consider using the [.pipe()](https://nodejs.org/docs/latest-v8.x/api/stream.html#stream_readable_pipe_destination_options) API.

```js
const { pipeline } = require('stream');
const csvParse = require('csv-parse'); // nmm i csv-parse

pipeline(
  createReadStream('./data.csv'),
  csvParse({ columns: ['key', 'title', 'body']}), // Must specify columns. If your csv contains a header row, skip it using 'from' csv option.
  search.indexes.use('myIndex').createIndexingStream(),
  (err) => {
    if (err) {
      console.error('Indexing failed');
    } else {
      console.log('Indexing complete');
    }
  }
)
```

## Request Options

You can set optional request-specific options for any request:

```js
client.indexes.use('myIndex').search({
  search: 'some search query',
}, {
  version: 'thisRequestApiVersion',
  key: 'thisRequestKey',
  retry: 3,
  timeout: 10000,
  clientRequestId: '{guid}',
  returnClientRequestId: true,
  ifMatch: 'someEtag',
  ifNoneMatch: 'someEtag',
});
```

* * *

You can set the default API version for your client:

```js
const client = new SearchService('myService', 'myKey', 'myDefaultApiVersion');
```

* * *

JSON has no date representation, so Azure Search returns `Date` fields as strings. The search client will automatically parse any string value that looks like a date, but you can disable date parsing in the request options:

```js
client.indexes.use('myIndex').search({
  search: 'hello world',
}, {
  parseDates: false,
});
```

* * *

Any object with a `list()` function accepts an optional `$select` option to limit the fields that are fetched:

```js
client.indexes.list({ $select: ['name', 'fields'] });
```

### Response properties

Every API response has some common properties (not every property is available for every request):

```js
const resp = await client.indexes.use('myIndex').search({
  search: 'hello world',
});

// response body
resp.result;

// request id
resp.properties.requestId;

// time spent by the search engine
resp.properties.elapsedTime

// an identifier specified by the caller in the original request, if present
resp.properties.clientRequestId

// An opaque string representing the current version of a resource (returned for indexers, indexes, and data sources, but not documents). Use this string in the If-Match or If-None-Match header for optimistic concurrency control.
resp.properties.eTag

// The URL of the newly-created index definition for POST and PUT /indexes requests.
resp.properties.location

// HTTP status code of the current request
resp.statusCode

// Timestamp when the request started
resp.timer.start

// Node `hrtime` until the response headers arrived
resp.timer.response

// Node `hrtime` until the full response body was read
resp.timer.end
```

## Manage search resources

With an admin key, the search client can manage the search resources

### Manage Indexes

```js
const indexes = client.indexes;

// CREATE INDEX
await indexes.create({
  /* IndexSchema */
});

// LIST INDEXES
await indexes.list();
```

### Manage an index

```js
const index = client.indexes.use('myIndex');

// ANALYZE TEXT
await index.analyze({
  /* AnalyzeQuery */
});

// COUNT DOCUMENTS
await index.count();

// DELETE THE INDEX
await index.delete();

// GET THE SCHEMA
await index.get();

// INDEX DOCUMENTS (add/update/delete)
await index.index([
  /* IndexDocument */
]);

// LOOKUP DOCUMENT
await index.lookup('myKey');

// SEARCH DOCUMENTS
await index.search({
  /* Query */
});

// GET INDEX STATS
await index.statistics();

// SUGGEST DOCUMENTS
await index.suggest({
  /* SuggestQuery */
});
```

> Note: `search`, `suggest`, and `lookup` APIs will automatically parse document fields that look like Dates, returning JavaScript `Date` objects instead. To disable this, use the [parseDate option](#request-options)

* * *

### Manage Data Sources

```js
const dataSources = client.dataSources;

// dataSources => .create, .list
```

### Manage a Data Source

```js
const dataSource = client.dataSources.use('myDataSource');

// dataSource => .get, .delete
```

* * *

### Manage Indexers

```js
const indexers = client.indexers;

// indexers => .create, .list
```

### Manage an Indexer

```js
const indexer = client.indexers.use('myIndexer');

// indexer => .get, .delete

// RESET INDEXER STATE
await indexer.reset();

// RUN THE INDEXER
await indexer.run();

// GET CURRENT INDEXER STATUS
await indexer.status();
```

* * *

### Manage Synonym Maps

```js
const synonymMaps = client.synonymMaps;

// synonymMaps => .create, .list
```

### Manage a Synonym Map

```js
const synonymMap = client.synonymMaps.use('mySynonymMap');

// synonymMap => .get, .delete
```

* * *

### Manage Skill Sets

> SkillSets are currently in preview, so be sure to use `ApiVersion.preview` in the `SearchService` constructor.
> 
> When referencing a skill type, input name, or output name, be sure to use the corresponding `enum` value rather than a plain string value.

```js
const skillSets = client.skillSets;

// skillSets => .create, .list
```

### Manage a Skill Set

```js
const skillSet = client.skillSets.use('mySkillSet');

// skillSet => .get, .delete
```

## TypeScript Generics

If you are using **TypeScript**, `azure-search-client` has full support for your custom document types

> Strongly typed documents are optional and default to `Document`, which allows for arbitrary document fields.

```TypeScript
import { SearchService } from 'azure-search-client';

interface MyDoc {
  id: string;
  num: number;
}

const resp = await client.indexes.use<MyDoc>('myIndex').search({
  search: 'hello',
});
const doc = resp.result.value[0];
```

`doc` is typed as `MyDoc & SearchDocument`, giving you compile-time access to `id` and `num` properties, as well as `@search.score` and `@search.highlights`.

Use your own Document types wherever documents are used: indexing, search, suggest.

* * *

When using a generic `TDocument` parameter on your `SearchIndex`, type safety also applies to the `QueryBuilder`, `QueryFilter`, and `QueryFacet` utilities.

```TypeScript
import { QueryFacet, QueryBuilder, QueryFilter  } from 'azure-search-client';

interface MyDoc {
  id: string;
  num: number;
  date: Date;
  content: string;
}

const index = client.use<MyDoc>('myIndex');

const query = index.buildQuery() // or new QueryBuilder<MyDoc>()
    .searchFields('content') // ok
    .facet('num') // ok

    // compile errors since 'blah' and 'foo' are not part of the document model
    .buildFacet('blah', (facet) => facet.count(20))
    .select('id', 'foo')
    .highlight('foo')
    .orderbyAsc('foo');

const filter = query.buildFilter((filter) => filter // or new QueryFilter<MyDoc>()
  .eq('id', 'foo') // ok
  .lt('date', new Date()) // ok
  .eq('num', 'oops, a string'); // compile failure: string is not assignable to number field
```
