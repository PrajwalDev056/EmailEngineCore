import { Router, Request, Response, NextFunction } from 'express';
import { ElasticSearchController } from '../controllers/ElasticSearchController';
import { container } from '../infrastructure/dependencyInjection/container';
import { TYPES } from '../infrastructure/dependencyInjection/types';

const router = Router();
const elasticsearchController = container.get<ElasticSearchController>(
  TYPES.ElasticSearchController,
);

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
  '/forcereindex',
  asyncHandler((req: Request, res: Response) =>
    elasticsearchController.forceReIndex(req, res),
  ),
);

export default router;
