import { SearchRequester } from './search-requester';
import { SearchResource } from './search-resource';
import { AzureSearchResponse, ListOptions, ListResults, OptionsOrCallback, SearchCallback, SearchOptions, SearchRequest } from './types';

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
   * @param optionsOrCallback Either options or a callback. If no callback is supplied, the request should be handled as a promise.
   * @param callback Callback when done. If no callback is supplied, the request should be handled as a promise.
   */
  create(schema: TSchema, optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.request<void>({
      method: 'post',
      path: '/',
      body: schema,
    }, optionsOrCallback, callback);
  }

  /**
   * Update a resource
   * @param schema resource definition
   * @param optionsOrCallback Either options or a callback. If no callback is supplied, the request should be handled as a promise.
   * @param callback Callback when done. If no callback is supplied, the request should be handled as a promise.
   */
  update(schema: TSchema, optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.create(schema, optionsOrCallback, callback);
  }

  /**
   * List all instances
   * @param optionsOrCallback Either options or a callback. If no callback is supplied, the request should be handled as a promise.
   * @param callback Callback when done. If no callback is supplied, the request should be handled as a promise.
   */
  list(optionsOrCallback?: (SearchOptions & ListOptions) | SearchCallback<ListResults<TSchema>>, callback?: SearchCallback<ListResults<TSchema>>) {
    const options: SearchOptions & ListOptions = typeof optionsOrCallback === 'function' ? {} : optionsOrCallback;
    return this.request<ListResults<TSchema>>({
      method: 'get',
      path: '/',
      query: options ? { $select: options.$select } : null,
    }, optionsOrCallback, callback);
  }

  private request<T>(req: SearchRequest<T>, optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>) {
    req.path = `/${this.type}${req.path}`;
    return this.requester.request<T>(req, optionsOrCallback);
  }
}
