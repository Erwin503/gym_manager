import express from 'express';
import {
  createWorkingHour,
  getTrainerWorkingHoursWithSessions,
  updateWorkingHour,
  deleteWorkingHour,
  getTrainerWorkingHoursWithSessionsForAdmin
} from '../controllers/trainerWorkingHoursController';
import { authenticateToken } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

router.post('/', authenticateToken, createWorkingHour);
router.get('/', authenticateToken, checkRole(['trainer']), getTrainerWorkingHoursWithSessions);
router.get('/:id', authenticateToken, checkRole(['gym_admin', 'super_admin']), getTrainerWorkingHoursWithSessionsForAdmin);
router.put('/:id', authenticateToken, updateWorkingHour);
router.delete('/:id', authenticateToken, deleteWorkingHour);

export default router;
