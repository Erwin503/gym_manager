import express from 'express';
import userRoutes from './authRouter';
import gymRoutes from './gymRouter';
import trainerScheduleRoutes from './trainerScheduleRoutes';

const router = express.Router();

// Подключение маршрутов для пользователей
router.use('/users', userRoutes);

// Подключение маршрутов для залов
router.use('/gyms', gymRoutes);

// Подключение маршрутов для расписания тренеров
router.use('/trainer-schedule', trainerScheduleRoutes);

export default router;
