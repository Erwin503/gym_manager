import db from "../db/knex";
import { AuthRequest } from "../middleware/authMiddleware";
import logger from "../utils/logger";
import { Request, Response, NextFunction } from 'express';

export const createWorkingHour = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainer_id, day_of_week, specific_date, start_time, end_time, status = 'available' } = req.body;
  
      const [newWorkingHour] = await db('TrainerWorkingHours').insert({
        trainer_id,
        day_of_week,
        specific_date,
        start_time,
        end_time,
        status,
      }).returning('*');
  
      logger.debug('Новый рабочий час успешно создан', { newWorkingHour });
  
      res.status(201).json({
        message: 'Рабочий час успешно создан',
        working_hour: newWorkingHour
      });
    } catch (error) {
      logger.error('Ошибка при создании рабочего часа', { error });
      next(error);
    }
  };

export const getTrainerWorkingHoursWithSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const trainer_id = req.user.id;
  
      logger.debug('Получение рабочих часов тренера с ID', { trainer_id });
  
      // Получаем все рабочие часы тренера вместе с сессиями (статус = 'booked')
      const workingHoursWithSessions = await db('TrainerWorkingHours as twh')
        .leftJoin('TrainingSessions as ts', function() {
          this.on('twh.id', '=', 'ts.working_hour_id')
            .andOn('ts.status', '=', db.raw('?', ['booked']));
        })
        .where('twh.trainer_id', trainer_id)
        .select(
          'twh.id as working_hour_id',
          'twh.trainer_id',
          'twh.day_of_week',
          'twh.specific_date',
          'twh.start_time',
          'twh.end_time',
          'twh.status as working_hour_status',
          db.raw('JSON_ARRAYAGG(JSON_OBJECT(' +
            '"id", ts.id, ' +
            '"user_id", ts.user_id, ' +
            '"working_hour_id", ts.working_hour_id, ' +
            '"gym_id", ts.gym_id, ' +
            '"status", ts.status, ' +
          ')) as sessions')
        )
        .groupBy(
          'twh.id',
          'twh.trainer_id',
          'twh.day_of_week',
          'twh.specific_date',
          'twh.start_time',
          'twh.end_time',
          'twh.status'
        );
  
      logger.debug('Рабочие часы с сессиями успешно получены', { workingHoursWithSessions });
  
      res.status(200).json(workingHoursWithSessions);
    } catch (error) {
      logger.error('Ошибка при получении рабочих часов тренера с сессиями', { error });
      next(error);
    }
  };

  export const updateWorkingHour = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { day_of_week, specific_date, start_time, end_time, status } = req.body;
  
      const updatedCount = await db('TrainerWorkingHours')
        .where({ id })
        .update({
          day_of_week,
          specific_date,
          start_time,
          end_time,
          status,
          updated_at: new Date()
        });
  
      if (!updatedCount) {
        res.status(404).json({ message: 'Рабочий час не найден' });
      }
  
      logger.debug('Рабочий час успешно обновлён', { id });
  
      res.status(200).json({ message: 'Рабочий час успешно обновлён' });
    } catch (error) {
      logger.error('Ошибка при обновлении рабочего часа', { error });
      next(error);
    }
  };

  export const deleteWorkingHour = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
  
      const deletedCount = await db('TrainerWorkingHours')
        .where({ id })
        .del();
  
      if (!deletedCount) {
        res.status(404).json({ message: 'Рабочий час не найден' });
      }
  
      logger.debug('Рабочий час успешно удалён', { id });
  
      res.status(200).json({ message: 'Рабочий час успешно удалён' });
    } catch (error) {
      logger.error('Ошибка при удалении рабочего часа', { error });
      next(error);
    }
  };
  