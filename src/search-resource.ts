import { SearchRequester } from './search-requester';
import { SearchResourceGroup } from './search-resource-group';
import { AzureSearchResponse, SearchOptions, SearchRequest } from './types';

/**
 * Base class for search resources
 */
export abstract class SearchResource<T> {

  /**
   * Create new instance of the search resource
   * @param requester http handler
   * @param type the type of resource (should match /{resource}/ in the REST url path)
   * @param name the name of the current resource (should match /{resource}/{name} in the REST url path)
   */
  constructor(private requester: SearchRequester, private type: string, public name: string) { }

  /**
   * Get the current schema
   * @param options optional request parameters
   */
  get(options?: SearchOptions) {
    return this.request<T>({
      method: 'get',
      path: '/',
    }, options);
  }

  /**
   * Delete this resource
   * @param options optional request parameters
   */
  delete(options?: SearchOptions) {
    return this.request<void>({
      method: 'delete',
      path: '/',
    }, options);
  }

  protected request<T>(req: SearchRequest<T>, options: SearchOptions) {
    req.path = `/${this.type}/${this.name}${req.path}`;
    return this.requester.request<T>(req, options);
  }
}
