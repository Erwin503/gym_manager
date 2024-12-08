import express from 'express';
import { bookTrainingSession, completeTrainingSession, getUserTrainingSessions } from '../controllers/trainingSessionsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, bookTrainingSession);
router.put('/:id/complete', authenticateToken, completeTrainingSession);
router.get('/my-sessions', authenticateToken, getUserTrainingSessions);

export default router;
