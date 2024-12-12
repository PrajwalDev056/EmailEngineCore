/**
 * Interface for the authentication service.
 */
export interface IAuthService {
  /**
   * Retrieves an on-behalf-of token using the provided ID token.
   * @param idToken - The ID token of the user.
   * @returns A promise that resolves to the on-behalf-of token.
   * @throws Error if the token retrieval fails.
   */
  getOnBehalfToken(idToken: string): Promise<string>;
}
