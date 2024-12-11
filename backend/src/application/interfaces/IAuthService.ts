export interface IAuthService {
  getOnBehalfToken(idToken: string): Promise<string>;
}
