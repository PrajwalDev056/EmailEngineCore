import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { IEmailSyncService } from '../application/interfaces/IEmailSyncService';
import { TYPES } from '../infrastructure/dependencyInjection/types';
import rateLimiter from '../middleware/rateLimiter';

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email related endpoints
 */

/**
 * @swagger
 * /api/email/get:
 *   get:
 *     summary: Retrieve emails
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: Successfully retrieved emails
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Missing or invalid Authorization header
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/email/listen:
 *   post:
 *     summary: Listen for email notifications
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       202:
 *         description: Successfully processed notifications
 *       500:
 *         description: Internal server error
 */
@controller('/api/email')
export class EmailController {
  constructor(
    @inject(TYPES.EmailSyncService)
    private emailSyncService: IEmailSyncService,
  ) {}

  @httpGet('/get', rateLimiter)
  public async getEmails(req: Request, res: Response): Promise<void> {
    try {
      const accessToken = this.extractToken(req, res);
      const emails = await this.emailSyncService.synchronizeEmails(accessToken);
      res.json(emails);
    } catch (error: any) {
      res.status(500).json({ error: error?.message });
    }
  }

  @httpPost('/listen', rateLimiter)
  public async listen(req: Request, res: Response): Promise<void> {
    if (req.query.validationToken) {
      res.send(req.query.validationToken); // Validate the webhook
      return;
    }
    const notifications = req.body.value;
    const token = req.query.token as string;
    if (!token) {
      throw new Error('Access token not available');
    }
    for (const notification of notifications) {
      if (notification) {
        await this.emailSyncService.handleNotification(notification, token);
      }
    }
    res.sendStatus(202);
  }

  //#region Private Methods
  private extractToken(req: Request, res: Response): any {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid Authorization header' });
    }
    const accessToken = authHeader.split(' ')[1];
    return accessToken;
  }
  //#endregion
}
