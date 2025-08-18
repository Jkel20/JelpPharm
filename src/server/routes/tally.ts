import express from 'express';
import { auth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

router.get('/', auth, asyncHandler(async (_req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Tally route - Coming soon',
    data: { tally: [] }
  });
}));

export default router;
