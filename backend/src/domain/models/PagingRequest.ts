/**
 * Class representing a paging request.
 */
export class PagingRequest {
  /**
   * The maximum number of items to return.
   */
  public limit: number;

  /**
   * The number of items to skip before starting to collect the result set.
   */
  public skip: number;

  /**
   * Creates an instance of PagingRequest.
   * @param pageNumber - The page number to retrieve.
   * @param perPage - The number of items per page. Default is 100.
   * @throws Error if pageNumber or perPage is less than 1.
   */
  constructor(pageNumber: number, perPage: number = 100) {
    if (pageNumber < 1) {
      throw new Error('Page number must be greater than or equal to 1');
    }
    if (perPage < 1) {
      throw new Error('Items per page must be greater than or equal to 1');
    }
    this.skip = (pageNumber - 1) * perPage;
    this.limit = perPage;
  }
}
