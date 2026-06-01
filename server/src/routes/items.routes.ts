import { Router, Response } from 'express';
import { itemsService } from '../services/items.service';
import { loansService } from '../services/loans.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const itemsRouter = Router();

itemsRouter.use(authMiddleware);

itemsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query['page'] as string || '1', 10));
    const search = ((req.query['search'] as string) || '').trim();
    const result = await itemsService.getAll(page, search, req.user!.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Erro interno.' });
  }
});

itemsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await itemsService.getById(Number(req.params['id']), req.user!.userId);
    res.json(item);
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : 'Item não encontrado.' });
  }
});

itemsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const item = await itemsService.create(req.body, req.user!.userId);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Erro ao criar item.' });
  }
});

itemsRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await itemsService.update(Number(req.params['id']), req.body, req.user!.userId);
    res.json(item);
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : 'Item não encontrado.' });
  }
});

itemsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await itemsService.delete(Number(req.params['id']), req.user!.userId);
    res.status(204).send();
  } catch (error) {
    if ((error as any).code === '23503') {
      res.status(409).json({ message: 'Não é possível excluir um item com histórico de empréstimos.' });
      return;
    }
    res.status(404).json({ message: error instanceof Error ? error.message : 'Item não encontrado.' });
  }
});

itemsRouter.get('/:id/loans', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query['page'] as string || '1', 10));
    const result = await loansService.getByItemId(Number(req.params['id']), page);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Erro interno.' });
  }
});
