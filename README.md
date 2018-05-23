# Installation
```
npm install azure-search-client
```

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

```JavaScript
client.indexes.use('myIndex').search({
  count: true,
  facets: ['field1', 'field2'],
  filter: `field1 eq 123 and field2 ne 'foo'`,
  highlight: 'field1, field2'
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
client.indexes.use('myIndex').search(new QueryBuilder()
  .count(true)
  .facet('field1')
  .facet(new FacetBuilder('field2')
    .count(100)
    .sortByValue('asc'))
  .filter(new FilterBuilder()
    .eq('field1', 123)
    .any('myCollection', new LambdaQueryFilter().in('one', 'two', 'three'))
    .geoDistance('myGeo', [122, 80], GeoComparison.lt, 10)
    .eq('field2', 'foo'))
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
  .query);
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

---

You can set the default API version for your client:

```JavaScript
const client = new SearchService('myService', 'myKey', 'myDefaultApiVersion');
```

---

JSON has no date representation, so Azure Search returns `Date` fields as strings. The search client will automatically parse any string value that looks like a date. You can disable automatic date parsing in the request options:

```JavaScript
client.indexes.use('myIndex').search({
  search: 'hello world',
}, {
  parseDates: false,
});
```

---

Any resource group with a `list()` function accepts an optional `$select` property to limit the fields that are fetched:

```JavaScript
client.indexes.list({ $select: 'name' });
```

### Response properties
Every API response has some common properties (not every property is set for every request):

```JavaScript
const resp = await client.indexes.use('myIndex').search({
  search: 'hello world',
});

/*
 * :: response body
 * resp.result
 * 
 * :: current request id
 * resp.properties.requestId
 * 
 * :: time spent by the search engine
 * resp.properties.elapsedTime
 * 
 * :: an identifier specified by the caller in the original request, if present
 * resp.properties.clientRequestId
 * 
 * :: An opaque string representing the current version of a resource (returned for indexers, indexes, and data sources, but not documents). Use this string in the If-Match or If-None-Match header for optimistic concurrency control.
 * resp.properties.eTag
 * 
 * :: The URL of the newly-created index definition for POST and PUT /indexes requests.
 * resp.properties.location
 * 
 * :: HTTP status code of the current request
 * resp.statusCode
 * 
 * :: Local time when the request started
 * resp.timer.start
 * 
 * :: Node 'hrtime' until the first response header arrived
 * resp.timer.response
 * 
 * :: Node 'hrtime' until the full response body is read
 * resp.timer.end
 */
```

## Manage search resources

With an admin key, the search client can the search resources

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

> Note: `search`, `suggest`, and `lookup` APIs will automatically parse document fields that look like Dates. To disable this, reference the [parseDate option](#options)

---

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

---

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

---

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

If you are using TypeScript, this module can support your custom document types (strongly typed documents are always optional).

```TypeScript
import { SearchService } from 'azure-search-client';

interface MyDoc {
  id: string;
  num: number;
}

const resp = await client.indexes.use('myIndex').search<MyDoc>({
  search: 'hello',
});

const doc = resp.result.value[0];
```

`doc` is typed as `MyDoc & SearchDocument`, giving you first class access to `id` and `num` properties, as well as `@search.score` and `@search.highlights`.

Use your own Document types wherever documents are used: indexing, search, suggest.

---

To ensure type safety when using the `QueryBuilder`, `QueryFilter`, and `FacetBuilder` utilities, switch to their typed equivilents (`TypedQueryBuilder<TDocument>`, `TypedQueryFilter<TDocument>`, and `TypedFacetBuilder<TDocument>`). These classes are strongly typed to ensure that field names and values correspond with the actual properties of your document model:

```TypeScript
interface MyDoc {
  id: string;
  num: number;
  date: Date;
  content: string;
}

new TypedQueryBuilder<MyDoc>()
    .searchFields('content') // ok
    .facet('num') // ok

    // following will cause compile errors since 'blah' and 'foo' are not part of the document model
    .facet(new TypedFacetBuilder<MyDoc>('blah').count(100))
    .select('id', 'foo')
    .highlight('foo')
    .orderbyAsc('foo');

new TypedQueryFilter<MyDoc>()
  .eq('id', 'foo') // ok
  .lt('date', new Date()) // ok
  .eq('num', 'not a number'); // compile failure: string is not assignable to number field
```

The typed utilities are interchangable with their non-typed counterparts. Use them to catch simple field name typos early.