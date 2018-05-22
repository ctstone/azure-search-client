import { SearchRequester } from './search-requester';
import { SearchResource } from './search-resource';
import { AzureSearchResponse, ListOptions, ListResults, SearchOptions, SearchRequest } from './types';

export type Resource<T extends SearchResource<TSchema>, TSchema>
  = new (requester: SearchRequester, type: string, name: string) => T;

/**
 * Base class for search resource groups
 */
export abstract class SearchResourceGroup<TResource extends SearchResource<TSchema>, TSchema> {

  /**
   * Create new instance of the search resource group
   * @param requester http handler
   * @param type the type of resource (should match /{resource}/ in the REST url path)
   * @param resource resource handler class
   */
  constructor(private requester: SearchRequester, private type: string, private resource: Resource<TResource, TSchema>) {
  }

  /**
   * Access a named resource
   * @param name the resource name
   */
  use(name: string) {
    const Resource = this.resource;
    return new Resource(this.requester, this.type, name);
  }

  /**
   * Create a new resource
   * @param schema resource definition
   * @param options optional request parameters
   */
  create(schema: TSchema, options?: SearchOptions) {
    return this.request<void>({
      method: 'post',
      path: '/',
      body: schema,
    }, options);
  }

  /**
   * Update a resource
   * @param schema resource definition
   * @param options optional request parameters
   */
  update(schema: TSchema, options?: SearchOptions) {
    return this.create(schema, options);
  }

  /**
   * List all instances
   * @param options optional request parameters
   */
  list(options?: SearchOptions & ListOptions) {
    return this.request<ListResults<TSchema>>({
      method: 'get',
      path: '/',
      query: options ? { $select: options.$select } : null,
    }, options);
  }

  private request<T>(req: SearchRequest<T>, options: SearchOptions) {
    req.path = `/${this.type}${req.path}`;
    return this.requester.request<T>(req, options);
  }
}
