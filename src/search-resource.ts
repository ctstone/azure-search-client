import { SearchRequester } from './search-requester';
import { AzureSearchResponse, OptionsOrCallback, SearchCallback, SearchOptions, SearchRequest } from './types';

interface Named {
  name: string;
}

interface OptionalName<T> {
  name?: string;
}

/**
 * Base class for search resources
 */
export abstract class SearchResource<T extends Named> {

  /**
   * Create new instance of the search resource
   * @param requester http handler
   * @param type the type of resource (should match /{resource}/ in the REST url path)
   * @param name the name of the current resource (should match /{resource}/{name} in the REST url path)
   */
  constructor(protected requester: SearchRequester, private type: string, public name: string) { }

  /**
   * Get the current schema
   * @param options optional request options
   */
  get(options?: SearchOptions): Promise<AzureSearchResponse<T>>;
  get(callback: SearchCallback<T>): void;
  get(options: SearchOptions, callback: SearchCallback<T>): void;
  get(optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>) {
    return this.request<T>({
      method: 'get',
      path: '/',
    }, optionsOrCallback, callback);
  }

  /**
   * Delete this resource
   * @param options optional request options
   */
  delete(options?: SearchOptions): Promise<AzureSearchResponse<void>>;
  delete(callback: SearchCallback<void>): void;
  delete(options: SearchOptions, callback: SearchCallback<void>): void;
  delete(optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.request<void>({
      method: 'delete',
      path: '/',
    }, optionsOrCallback, callback);
  }

  /**
   * Update or create this resource
   * @param resource new definition
   * @param options optional request options
   */
  update(resource: OptionalName<T>, options?: SearchOptions): Promise<AzureSearchResponse<void>>;
  update(resource: OptionalName<T>, callback: SearchCallback<void>): void;
  update(resource: OptionalName<T>, options: SearchOptions, callback: SearchCallback<void>): void;
  update(resource: OptionalName<T>, optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.request<void>({
      method: 'put',
      path: '/',
      body: resource,
    }, optionsOrCallback, callback);
  }

  protected request<T>(req: SearchRequest<T>, optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>) {
    req.path = `/${this.type}/${this.name}${req.path}`;
    return this.requester.request<T>(req, optionsOrCallback, callback);
  }
}
