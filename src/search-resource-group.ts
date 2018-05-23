import { SearchRequester } from './search-requester';
import { ISearchResource, SearchResource } from './search-resource';
import { AzureSearchResponse, ListOptions, ListResults, OptionsOrCallback, SearchCallback, SearchOptions, SearchRequest } from './types';

export interface IResourceGroup<T, TResourceInterface> {

  /**
   * Access a named resource
   * @param name the resource name
   */
  use(name: string): TResourceInterface;

  /**
   * Create a new resource
   * @param schema resource definition
   * @param options optional request options
   */
  create(schema: T, options?: SearchOptions): Promise<AzureSearchResponse<void>>;
  create(schema: T, callback: SearchCallback<void>): void;
  create(schema: T, options: SearchOptions, callback: SearchCallback<void>): void;

  /**
   * Update a resource
   * @param schema resource definition
   * @param options optional request options
   */
  update(schema: T, options?: SearchOptions): Promise<AzureSearchResponse<void>>;
  update(schema: T, callback: SearchCallback<void>): void;
  update(schema: T, options: SearchOptions, callback: SearchCallback<void>): void;

  /**
   * List all resources
   * @param options optional request options
   */
  list(options?: SearchOptions & ListOptions): Promise<AzureSearchResponse<ListResults<T>>>;
  list(callback: SearchCallback<ListResults<T>>): void;
  list(options: SearchOptions & ListOptions, callback: SearchCallback<ListResults<T>>): void;
}

export type Resource<T extends SearchResource<TSchema>, TSchema>
  = new (requester: SearchRequester, type: string, name: string) => T;

/**
 * Base class for search resource groups
 */
export abstract class SearchResourceGroup<
  TResource extends SearchResource<TSchema> & TResourceInterface,
  TSchema,
  TResourceInterface extends ISearchResource<TSchema>> implements IResourceGroup<TSchema, TResourceInterface> {

  /**
   * Create new instance of the search resource group
   * @param requester http handler
   * @param type the type of resource (should match /{resource}/ in the REST url path)
   * @param resource resource handler class
   */
  constructor(private requester: SearchRequester, private type: string, private resource: Resource<TResource, TSchema>) {
  }

  use(name: string) {
    const Resource = this.resource;
    return new Resource(this.requester, this.type, name) as TResourceInterface;
  }

  create(schema: TSchema, optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.request<void>({
      method: 'post',
      path: '/',
      body: schema,
    }, optionsOrCallback, callback);
  }

  update(schema: TSchema, optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.create(schema, optionsOrCallback, callback);
  }

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
