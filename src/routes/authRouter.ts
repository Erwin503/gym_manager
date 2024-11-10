import express from 'express';
import { signup, login, getUserProfile, updateUserProfile, deleteUser } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Маршрут для регистрации
router.post('/signup', signup);

// Маршрут для входа
router.post('/login', login);

// Маршрут для получения профиля пользователя (доступен только авторизованным пользователям)
router.get('/profile', authenticateToken, getUserProfile);

// Маршрут для обновления профиля пользователя (доступен только авторизованным пользователям)
router.put('/profile', authenticateToken, updateUserProfile);

// Маршрут для удаления пользователя (доступен только авторизованным пользователям)
router.delete('/profile', authenticateToken, deleteUser);

export default router;
