# Installation

    npm install azure-search-client

## Usage

### Basic query (async/await)

Responses may be retrieved using the `async/await` pattern:

```JavaScript
const { SearchService } = require('azure-search-client');

const client = new SearchService('myService', 'myKey');
const resp = await client.indexes.use('myIndex').search({
  search: 'hello world',
});
console.log(resp.result.value); // array of result docs
```

### Basic query (callback)

Or Responses may be retrieved using the Node callback pattern:

```JavaScript
client.indexes.use('myIndex').search({
  search: 'hello world',
}, (err, resp) => {
  if (err) { throw err; }
  console.log(resp.result.value); // array of result docs
});
```

### Full query API

Use the Azure Search POST query representation

> If you are using **TypeScript** see [how to use your own document models](#typescript-generics) on index operations.

```JavaScript
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
  searchMode: 'any',
  select: 'field1, field2',
  queryType: 'simple',
  skip: 0,
  top: 10,
});
```

### Query builders

Use `QueryBuilder`, `FilterBuilder`, `FacetBuilder`, and `LambdaQueryFilter` helpers to build a query using method chaining.

```JavaScript
client.indexes.use('myIndex')
  .buildQuery()
  .count(true)
  .buildFacet('field1', (facet) => facet
    .count(20)
    .sortByValue('desc'))
  .facet('field2', 'field3', new FacetBuilder('field4').count(20)) // can combine .buildFacet with .facet
  .buildFilter((filter) => filter
    .eq('field1', 123)
    .any('myCollection', (lambda) => lambda.in('a', 'b', 'c'))
    .geoDistance('myGeo', [122, 80], GeoComparison.lt, 10)
    .eq('field2', 'foo'))
  // .filter(`field1 eq 'whatever'`) // use .buildFilter or .filter
  .highlight('field1', 'field2')
  .highlightTag('<b>', '</b>')
  .minimumCoverage(90)
  .orderbyAsc('field1')
  .orderByGeoDistance('geoField', [122, 80])
  .orderByScore()
  .scoringProfile('myProfile')
  .scoringParameter('currentLocation', '-122.123', '44.77233')
  .scoringParameter('lastLocation', '-121.499', '44.2113')
  .search('hello world')
  .searchFields('field1', 'field2')
  .searchMode('any')
  .select('field1', 'field2')
  .queryType('simple')
  .skip(0)
  .top(10)
  // .query // use .query to retrieve the query object or call .executeQuery() to retrieve results
  .executeQuery();
```

> Strongly typed versions of these utilites are also available. See [TypeScript Generics](#typescript-generics)

### Options

You can set optional request-specific options for any request:

```JavaScript
client.indexes.use('myIndex').search({
  search: 'hello',
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

```JavaScript
const client = new SearchService('myService', 'myKey', 'myDefaultApiVersion');
```

* * *

JSON has no date representation, so Azure Search returns `Date` fields as strings. The search client will automatically parse any string value that looks like a date. You can disable automatic date parsing in the request options:

```JavaScript
client.indexes.use('myIndex').search({
  search: 'hello world',
}, {
  parseDates: false,
});
```

* * *

Any object with a `list()` function accepts an optional `$select` option to limit the fields that are fetched:

```JavaScript
client.indexes.list({ $select: ['name1', 'name2'] });
```

### Response properties

Every API response has some common properties (not every property is available for every request):

```JavaScript
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

```JavaScript
const indexes = client.indexes;

// CREATE INDEX
await indexes.create({
  /* IndexSchema */
});

// UPDATE INDEX
await indexes.update({
  /* IndexSchema */
});

// LIST INDEXES
await indexes.list();
```

### Manage an index

```JavaScript
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

> Note: `search`, `suggest`, and `lookup` APIs will automatically parse document fields that look like Dates, returning JavaScript `Date` objects instead. To disable this, use the [parseDate option](#options)

* * *

### Manage Data Sources

```JavaScript
const dataSources = client.dataSources;

// dataSources => .create, .update, .list
```

### Manage a Data Source

```JavaScript
const dataSource = client.dataSources.use('myDataSource');

// dataSource => .get, .delete
```

* * *

### Manage Indexers

```JavaScript
const indexers = client.indexers;

// indexers => .create, .update, .list
```

### Manage an Indexer

```JavaScript
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

```JavaScript
const synonymMaps = client.synonymMaps;

// synonymMaps => .create, .update, .list
```

### Manage a Synonym Map

```JavaScript
const synonymMap = client.synonymMap.use('mySynonymMap');

// synonymMap => .get, .delete
```

## TypeScript Generics

If you are using **TypeScript**, this module can support your custom document types (strongly typed documents are optional).

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

> If you omit the generic parameter, the default document type is `IDocument` which allows for arbitrary document fields.

* * *

When using a generic `TDocument` parameter on your `SearchIndex`, type safety also applies to the `QueryBuilder`, `QueryFilter`, and `FacetBuilder` utilities.

```TypeScript
import { FacetBuilder, QueryBuilder, QueryFilter  } from 'azure-search-client';

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

    // these cause compile errors since 'blah' and 'foo' are not part of the document model
    .buildFacet('blah', (facet) => facet.count(20))
    .select('id', 'foo')
    .highlight('foo')
    .orderbyAsc('foo');

const filter = query.buildFilter((filter) => filter // or new QueryFilter<MyDoc>()
  .eq('id', 'foo') // ok
  .lt('date', new Date()) // ok
  .eq('num', 'oops, a string'); // compile failure: string is not assignable to number field
```
