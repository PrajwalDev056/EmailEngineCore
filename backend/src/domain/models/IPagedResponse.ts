/**
 * Interface representing a paged response.
 * @template T - The type of items in the list.
 */
export interface IPagedResponse<T> {
  /**
   * The list of items in the paged response.
   */
  list: T[];

  /**
   * The total count of items available.
   */
  count: number;
}
