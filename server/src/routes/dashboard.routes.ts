import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { dashboardService } from '../services/dashboard.service';

export const dashboardRouter = Router();

dashboardRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await dashboardService.getStats(req.user!.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Erro interno.' });
  }
});
