import express from 'express';
import { signup, login, getUserProfile, updateUserProfile, deleteUser, assignRoleToUser, getAllUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/checkRole';

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

// Маршрут для повышения роли
router.post('/promote', authenticateToken, checkRole(['gym_admin', 'super_admin']), assignRoleToUser);

router.get('/all', authenticateToken, checkRole(['gym_admin', 'super_admin']), getAllUsers);

export default router;
