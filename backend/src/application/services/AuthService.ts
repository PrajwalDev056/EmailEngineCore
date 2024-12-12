import { inject, injectable } from 'inversify';
import { IAuthService } from '../interfaces/IAuthService';
import { OnBehalfOfCredential } from '@azure/identity';
import AppConst from '../../utils/Constants';
import { TYPES } from '../../infrastructure/dependencyInjection/types';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { UserModel } from '../../infrastructure/persistence/documents/UserModel';
import logger from '../../utils/Logger';
import { Client } from '@microsoft/microsoft-graph-client';

/**
 * Service for handling authentication-related operations.
 */
@injectable()
class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
  ) {}

  /**
   * Retrieves an on-behalf-of token using the provided ID token.
   * @param idToken - The ID token of the user.
   * @returns A promise that resolves to the on-behalf-of token.
   * @throws Error if the token retrieval fails.
   */
  public async getOnBehalfToken(idToken: string): Promise<string> {
    try {
      const oboCredential = new OnBehalfOfCredential({
        tenantId: 'common',
        clientId: AppConst.OutlookClientId,
        clientSecret: AppConst.OutlookClientSecret,
        userAssertionToken: idToken,
      });
      const tokenResponse = await oboCredential.getToken([
        'https://graph.microsoft.com/.default',
      ]);
      await this.storeUser(tokenResponse.token);
      return tokenResponse.token;
    } catch (error: any) {
      logger.error('Error getting on-behalf token', { message: error.message });
      throw new Error('Failed to get on-behalf token');
    }
  }

  /**
   * Stores the user information in the repository.
   * @param token - The token of the user.
   * @returns A promise that resolves when the user information is stored.
   */
  private async storeUser(token: string): Promise<void> {
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });
    try {
      const user = await client.api('/me').get();
      const email = user.mail || user.userPrincipalName;
      const existingUser = await this.userRepository.findByEmail(email);
      const userModel = new UserModel(email, undefined, token);
      if (existingUser != null) {
        this.userRepository.update(existingUser.id!, userModel);
      } else {
        this.userRepository.create(userModel);
      }
      logger.info(`User stored with Email: ${email}`);
    } catch (error: any) {
      logger.error('Error storing user', { message: error.message });
    }
  }
}

export default AuthService;
