import express from 'express';
import {
  createWorkingHour,
  getTrainerWorkingHoursWithSessions,
  updateWorkingHour,
  deleteWorkingHour
} from '../controllers/trainerWorkingHoursController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, createWorkingHour);
router.get('/:trainer_id/working-hours', authenticateToken, getTrainerWorkingHoursWithSessions);
router.put('/:id', authenticateToken, updateWorkingHour);
router.delete('/:id', authenticateToken, deleteWorkingHour);

export default router;
