import express from 'express';
import userRoutes from './authRouter';
import gymRoutes from './gymRouter';
import trainerScheduleRoutes from './trainerScheduleRoutes';
import trainerDetailsRoutes from './trainerDetailsRoutes';

const router = express.Router();

// Подключение маршрутов для пользователей
router.use('/users', userRoutes);

// Подключение маршрутов для залов
router.use('/gyms', gymRoutes);

// Подключение маршрутов для расписания тренеров
router.use('/trainer-schedule', trainerScheduleRoutes);

// Подключение маршрутов для информации о тренерах
router.use('/trainer-details', trainerDetailsRoutes);

export default router;
