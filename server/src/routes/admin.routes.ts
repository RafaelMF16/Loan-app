import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { userRepository } from '../repositories/user.repository';
import { itemRepository } from '../repositories/item.repository';
import { loanRepository } from '../repositories/loan.repository';
import { dashboardService } from '../services/dashboard.service';

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

adminRouter.get('/users', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await userRepository.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Erro interno.' });
  }
});

adminRouter.get('/items', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query['page'] as string) || '1', 10));
    const search = ((req.query['search'] as string) || '').trim();
    const result = await itemRepository.findAllAdmin(page, search);
    const perPage = 10;
    res.json({
      data: result.rows,
      total: result.total,
      page,
      totalPages: Math.max(1, Math.ceil(result.total / perPage)),
      perPage,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Erro interno.' });
  }
});

adminRouter.get('/loans', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query['page'] as string) || '1', 10));
    const status = (req.query['status'] as string) || undefined;
    const result = await loanRepository.findAllAdmin(page, { status });
    const perPage = 10;
    res.json({
      data: result.rows,
      total: result.total,
      page,
      totalPages: Math.max(1, Math.ceil(result.total / perPage)),
      perPage,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Erro interno.' });
  }
});

adminRouter.get('/dashboard', async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await dashboardService.getAdminStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Erro interno.' });
  }
});
