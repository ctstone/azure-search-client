# Installation
```
npm install --save azure-search-client
```

# Usage
## TypeScript

```TypeScript
import { SearchClient } from 'azure-search-client';

const search = new SearchClient('serviceName', 'key');
search.query('indexName', {search: 'query text'}, (err: Error, resp: SearchResponse) => {
  console.log(resp.result.value);
});
```
