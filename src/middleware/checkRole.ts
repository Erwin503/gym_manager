import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

// Middleware для проверки ролей
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Проверяем, что роль пользователя есть в списке разрешённых ролей
    if (req.user && allowedRoles.includes(req.user.role)) {
      next(); // Если роль совпадает, продолжаем выполнение
    } else {
      res.status(403).json({ message: 'Доступ запрещён: недостаточно прав' });
    }
  };
};
