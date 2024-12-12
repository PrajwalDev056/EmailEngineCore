import { Request, Response } from 'express';
import { controller, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
import { TYPES } from '../infrastructure/dependencyInjection/types';
import { IAuthService } from '../application/interfaces/IAuthService';
import rateLimiter from '../middleware/rateLimiter';
import logger from '../utils/Logger';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get an on-behalf token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: ID token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved on-behalf token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: On-behalf token
 *       404:
 *         description: Id Token is undefined
 */
@controller('/api/auth')
export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}

  @httpPost('/login', rateLimiter)
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;
      if (idToken == null) {
        res.status(404).json({ error: 'Id Token is undefined' });
        return;
      }
      const obToken = await this.authService.getOnBehalfToken(idToken);
      res.json({ token: obToken });
    } catch (error: any) {
      logger.error('Error during login', { message: error.message });
      res.status(500).json({ error: 'Failed to login' });
    }
  }
}
