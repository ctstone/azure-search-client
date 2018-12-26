import { SearchRequester } from './search-requester';
import { AzureSearchResponse, ListOptions, ListResults, OptionsOrCallback, SearchCallback, SearchOptions, SearchRequest } from './types';

/**
 * Base class for search resource groups
 */
export abstract class SearchResourceGroup<TSchema> {

  /**
   * Create new instance of the search resource group
   * @param requester http handler
   * @param type the type of resource (should match /{resource}/ in the REST url path)
   * @param resource resource handler class
   */
  constructor(protected requester: SearchRequester, protected type: string) {
  }

  /**
   * Create a new resource
   * @param schema resource definition
   * @param options optional request options
   */
  create(schema: TSchema, options?: SearchOptions): Promise<AzureSearchResponse<void>>;
  create(schema: TSchema, callback: SearchCallback<void>): void;
  create(schema: TSchema, options: SearchOptions, callback: SearchCallback<void>): void;
  create(schema: TSchema, optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.request<void>({
      method: 'post',
      path: '/',
      body: schema,
    }, optionsOrCallback, callback);
  }

  /**
   * List all resources
   * @param options optional request options
   */
  list(options?: SearchOptions & ListOptions): Promise<AzureSearchResponse<ListResults<TSchema>>>;
  list(callback: SearchCallback<ListResults<TSchema>>): void;
  list(options: SearchOptions & ListOptions, callback: SearchCallback<ListResults<TSchema>>): void;
  list(optionsOrCallback?: (SearchOptions & ListOptions) | SearchCallback<ListResults<TSchema>>, callback?: SearchCallback<ListResults<TSchema>>) {
    const options: SearchOptions & ListOptions = typeof optionsOrCallback === 'function' ? {} : optionsOrCallback;
    return this.request<ListResults<TSchema>>({
      method: 'get',
      path: '/',
      query: options ? { $select: options.$select ? options.$select.join(',') : undefined } : undefined,
    }, optionsOrCallback, callback);
  }

  private request<T>(req: SearchRequest<T>, optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>) {
    req.path = `/${this.type}${req.path}`;
    return this.requester.request<T>(req, optionsOrCallback, callback);
  }
}
