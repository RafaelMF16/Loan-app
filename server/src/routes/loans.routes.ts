import { Router, Response } from 'express';
import { loansService } from '../services/loans.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const loansRouter = Router();

loansRouter.use(authMiddleware);

loansRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query['page'] as string || '1', 10));
    const status = (req.query['status'] as string) || undefined;
    const itemId = req.query['itemId'] ? Number(req.query['itemId']) : undefined;
    const startDate = (req.query['startDate'] as string) || undefined;
    const endDate = (req.query['endDate'] as string) || undefined;
    const result = await loansService.getAll(page, { status, itemId, startDate, endDate }, req.user!.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Erro interno.' });
  }
});

loansRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const loan = await loansService.getById(Number(req.params['id']), req.user!.userId);
    res.json(loan);
  } catch (error) {
    const status = (error as any).statusCode ?? 404;
    res.status(status).json({ message: error instanceof Error ? error.message : 'Empréstimo não encontrado.' });
  }
});

loansRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, borrowerName, borrowerEmail, borrowerContact, expectedReturnDate, notes } = req.body;

    if (!itemId || !borrowerName) {
      res.status(400).json({ message: 'itemId e borrowerName são obrigatórios.' });
      return;
    }

    const loan = await loansService.createLoan(
      { itemId: Number(itemId), borrowerName, borrowerEmail, borrowerContact, expectedReturnDate, notes },
      req.user!.userId
    );
    res.status(201).json(loan);
  } catch (error) {
    const status = (error as any).statusCode ?? 400;
    res.status(status).json({ message: error instanceof Error ? error.message : 'Erro ao registrar empréstimo.' });
  }
});

loansRouter.put('/:id/return', async (req: AuthRequest, res: Response) => {
  try {
    const loan = await loansService.returnLoan(Number(req.params['id']), req.user!.userId);
    res.json(loan);
  } catch (error) {
    const status = (error as any).statusCode ?? 400;
    res.status(status).json({ message: error instanceof Error ? error.message : 'Erro ao registrar devolução.' });
  }
});
