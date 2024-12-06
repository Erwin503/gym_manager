import express from 'express';
import {
  addTrainerDetails,
  getTrainerDetails,
  updateTrainerDetails,
  deleteTrainerDetails,
} from '../controllers/trainerDetailsController';
import { authenticateToken } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// Все маршруты требуют аутентификации и роли "trainer"
router.use(authenticateToken, checkRole(['trainer', ' gym_admin', 'super_admin']));

// Добавление информации о тренере
router.post('/', addTrainerDetails);

// Получение информации о тренере по ID пользователя
router.get('/', getTrainerDetails);

// Обновление информации о тренере по ID пользователя
router.put('/', updateTrainerDetails);

// Удаление информации о тренере по ID пользователя
router.delete('/', deleteTrainerDetails);

export default router;
