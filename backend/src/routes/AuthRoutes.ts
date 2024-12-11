import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { container } from '../infrastructure/dependencyInjection/container';
import { TYPES } from '../infrastructure/dependencyInjection/types';

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const asyncHandler =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.post(
  '/login',
  asyncHandler((req: Request, res: Response) => authController.login(req, res)),
);

export default router;
