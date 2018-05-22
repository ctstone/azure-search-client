import { SearchRequester } from './search-requester';
import { SearchResourceGroup } from './search-resource-group';
import { AzureSearchResponse, OptionsOrCallback, SearchCallback, SearchOptions, SearchRequest } from './types';

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
   * @param optionsOrCallback Either options or a callback. If no callback is supplied, the request should be handled as a promise.
   * @param callback Callback when done. If no callback is supplied, the request should be handled as a promise.
   */
  get(optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>) {
    return this.request<T>({
      method: 'get',
      path: '/',
    }, optionsOrCallback, callback);
  }

  /**
   * Delete this resource
   * @param optionsOrCallback Either options or a callback. If no callback is supplied, the request should be handled as a promise.
   * @param callback Callback when done. If no callback is supplied, the request should be handled as a promise.
   */
  delete(optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.request<void>({
      method: 'delete',
      path: '/',
    }, optionsOrCallback, callback);
  }

  protected request<T>(req: SearchRequest<T>, optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>) {
    req.path = `/${this.type}/${this.name}${req.path}`;
    return this.requester.request<T>(req, optionsOrCallback, callback);
  }
}
