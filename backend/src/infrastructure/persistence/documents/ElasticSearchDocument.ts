export class ElasticSearchDocument {
  /**
   * Unique identifier for the document. Optional for new documents.
   */
  id?: string;

  /**
   * Any other properties specific to the document.
   */
  [key: string]: any;

  constructor(id?: string, fields?: { [key: string]: any }) {
    if (id) {
      this.id = id;
    }
    if (fields) {
      Object.assign(this, fields);
    }
  }

  /**
   * Convert the document to a plain object.
   */
  toObject(): { [key: string]: any } {
    const { id, ...rest } = this;
    return { id, ...rest };
  }
}
