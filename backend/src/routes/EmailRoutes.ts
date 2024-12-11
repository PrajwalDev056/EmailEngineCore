import { Router, Request, Response, NextFunction } from 'express';
import { EmailController } from '../controllers/EmailController';
import { container } from '../infrastructure/dependencyInjection/container';
import { TYPES } from '../infrastructure/dependencyInjection/types';

const router = Router();
const emailController = container.get<EmailController>(TYPES.EmailController);

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const asyncHandler =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.get(
  '/get',
  asyncHandler((req: Request, res: Response) =>
    emailController.getEmails(req, res),
  ),
);

router.post(
  '/listen',
  asyncHandler((req: Request, res: Response) =>
    emailController.listen(req, res),
  ),
);

export default router;
