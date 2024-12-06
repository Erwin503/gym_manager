import express from 'express';
import {
  addTrainerDetails,
  getTrainerDetails,
  updateTrainerDetails,
  deleteTrainerDetails,
  getTrainerDetailsById,
  getAllTrainers,
} from '../controllers/trainerDetailsController';
import { authenticateToken } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// Добавление информации о тренере
router.post('/', authenticateToken, checkRole(['trainer', ' gym_admin', 'super_admin']), addTrainerDetails);

// Получение информации о тренере по ID пользователя
router.get('/', getTrainerDetails);

// Обновление информации о тренере по ID пользователя
router.put('/', authenticateToken, checkRole(['trainer', ' gym_admin', 'super_admin']), updateTrainerDetails);

// Удаление информации о тренере по ID пользователя
router.delete('/', authenticateToken, checkRole(['trainer', ' gym_admin', 'super_admin']), deleteTrainerDetails);

router.get('/byid/:id', getTrainerDetailsById)

// Получение ввсех тренеров
router.get('/trainers', getAllTrainers)



export default router;
