export class PagingRequest {
  public limit: number;
  public skip: number;

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
