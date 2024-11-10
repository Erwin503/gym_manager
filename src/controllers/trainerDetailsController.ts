import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { TrainerDetails } from '../interfaces/model';
import logger from '../utils/logger';

// Добавление информации о тренере
export const addTrainerDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, specialization, experience_years, bio, certifications, photo_url } = req.body;

    logger.debug(`Добавление информации о тренере для пользователя ID: ${user_id}`, { data: req.body });

    const [trainer] = await db<TrainerDetails>('TrainersDetails')
      .insert({
        user_id,
        specialization,
        experience_years,
        bio,
        certifications,
        photo_url,
      })
      .returning('*');

    logger.debug(`Информация о тренере успешно добавлена для пользователя ID: ${user_id}`, { trainer });

    res.status(201).json({
      message: 'Информация о тренере успешно добавлена',
      trainer,
    });
  } catch (error) {
    logger.error(`Ошибка при добавлении информации о тренере для пользователя ID: ${req.body.user_id}`, { error });
    next(error);
  }
};

// Получение информации о тренере по ID пользователя
export const getTrainerDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;

    logger.debug(`Получение информации о тренере для пользователя ID: ${user_id}`);

    const trainer = await db<TrainerDetails>('TrainersDetails').where({ user_id: parseInt(user_id, 10) }).first();

    if (!trainer) {
      logger.debug(`Информация о тренере не найдена для пользователя ID: ${user_id}`);
      res.status(404).json({ message: 'Информация о тренере не найдена' });
    }

    res.status(200).json(trainer);
  } catch (error) {
    logger.error(`Ошибка при получении информации о тренере для пользователя ID: ${req.params.user_id}`, { error });
    next(error);
  }
};

// Обновление информации о тренере
export const updateTrainerDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const { specialization, experience_years, bio, certifications, photo_url } = req.body;

    logger.debug(`Обновление информации о тренере для пользователя ID: ${user_id}`, { data: req.body });

    const updatedCount = await db<TrainerDetails>('TrainersDetails')
      .where({ user_id: parseInt(user_id, 10) })
      .update({
        specialization,
        experience_years,
        bio,
        certifications,
        photo_url,
      });

    if (!updatedCount) {
      logger.debug(`Информация о тренере не найдена для пользователя ID: ${user_id}`);
      res.status(404).json({ message: 'Информация о тренере не найдена' });
    }

    const updatedTrainer = await db<TrainerDetails>('TrainersDetails').where({ user_id: parseInt(user_id, 10) }).first();

    logger.debug(`Информация о тренере успешно обновлена для пользователя ID: ${user_id}`, { updatedTrainer });

    res.status(200).json({
      message: 'Информация о тренере успешно обновлена',
      updatedTrainer,
    });
  } catch (error) {
    logger.error(`Ошибка при обновлении информации о тренере для пользователя ID: ${req.params.user_id}`, { error });
    next(error);
  }
};

// Удаление информации о тренере
export const deleteTrainerDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;

    logger.debug(`Удаление информации о тренере для пользователя ID: ${user_id}`);

    const deletedCount = await db<TrainerDetails>('TrainersDetails').where({ user_id: parseInt(user_id, 10) }).del();

    if (!deletedCount) {
      logger.debug(`Информация о тренере не найдена для пользователя ID: ${user_id}`);
      res.status(404).json({ message: 'Информация о тренере не найдена' });
    }

    logger.debug(`Информация о тренере успешно удалена для пользователя ID: ${user_id}`);

    res.status(200).json({ message: 'Информация о тренере успешно удалена' });
  } catch (error) {
    logger.error(`Ошибка при удалении информации о тренере для пользователя ID: ${req.params.user_id}`, { error });
    next(error);
  }
};
