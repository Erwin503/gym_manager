import express from 'express';
import {
  addWorkingHours,
  getWorkingHours,
  updateWorkingHours,
  deleteWorkingHours,
} from '../controllers/trainerScheduleController';
import { authenticateToken } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// Все маршруты требуют аутентификации и роли "trainer"
router.use(authenticateToken, checkRole(['trainer']));

// Добавление рабочего времени
router.post('/', addWorkingHours);

// Получение рабочего расписания
router.get('/', getWorkingHours);

// Обновление рабочего времени по ID
router.put('/:id', updateWorkingHours);

// Удаление рабочего времени по ID
router.delete('/:id', deleteWorkingHours);

export default router;
