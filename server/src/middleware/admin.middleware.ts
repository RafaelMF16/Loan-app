import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Acesso negado. Somente administradores.' });
    return;
  }
  next();
}
