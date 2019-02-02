# Change Log

## v3.1.2

- Add support for updating search resources

## v3.1.1

- Pass indexing batch results downstream for `index.createIndexingStream()`
- Add parameter to process indexing batch results for `index.index(...)`

## v3.0.6

- Fix streaming error for `createIndexingStream`

## v3.0.5

- Add `SearchError` class to propagate errors
- Fix error parsing for non-JSON responses

## v3.0.4

- Add support for Skill Sets

## v3.0.3

- Add support for streaming index API

## v3.0.0

- Refactor use of interfaces and function overloading to simplify TypeScript usage. Minor breaking changes

## v2.2.4

- Move all type definitions to types-only package at `azure-search-types`