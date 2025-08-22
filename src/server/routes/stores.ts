import express from 'express';
import { auth, requirePrivilege } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

router.get('/', auth, requirePrivilege('VIEW_STORES'), asyncHandler(async (_req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Stores route - Coming soon',
    data: { stores: [] }
  });
}));

export default router;
