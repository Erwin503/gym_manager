import { Request, Response, NextFunction } from "express";
import db from "../db/knex";
import { TrainerWorkingHour } from "../interfaces/model"; // Интерфейс для расписания
import logger from "../utils/logger"; // Импортируем логгер
import { AuthRequest } from "../middleware/authMiddleware";

// Добавление рабочего времени тренера
export const addWorkingHours = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trainerId = req.user?.id; // ID тренера из токена пользователя
    const { day_of_week, specific_date, start_time, end_time } = req.body;

    // Логирование входящих данных
    logger.debug(`Добавление рабочего времени для тренера ID: ${trainerId}`, {
      data: req.body,
    });

    const [workingHour] = await db<TrainerWorkingHour>("TrainerWorkingHours")
      .insert({
        trainer_id: trainerId,
        day_of_week,
        specific_date,
        start_time,
        end_time,
      })
      .returning("*");

    // Логирование результата
    logger.debug(
      `Рабочее время успешно добавлено для тренера ID: ${trainerId}`,
      { workingHour }
    );

    res.status(201).json({
      message: "Рабочее время успешно добавлено",
      workingHour,
    });
  } catch (error) {
    logger.error(
      `Ошибка при добавлении рабочего времени для тренера ID: ${req.user?.id}`,
      { error }
    );
    next(error);
  }
};

// Получение рабочего расписания тренера
export const getWorkingHours = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trainerId = req.user?.id;

    const workingHours = await db<TrainerWorkingHour>(
      "TrainerWorkingHours"
    ).where({ trainer_id: trainerId });

    logger.debug(`Рабочее расписание получено для тренера ID: ${trainerId}`, {
      workingHours,
    });

    res.status(200).json(workingHours);
  } catch (error) {
    logger.error(
      `Ошибка при получении рабочего расписания для тренера ID: ${req.user?.id}`,
      { error }
    );
    next(error);
  }
};

// Обновление рабочего времени
export const updateWorkingHours = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trainerId = req.user?.id;
    const { id } = req.params;
    const { day_of_week, specific_date, start_time, end_time } = req.body;
    const workingHourId = parseInt(id, 10);

    logger.debug(
      `Обновление рабочего времени ID: ${workingHourId} для тренера ID: ${trainerId}`,
      { data: req.body }
    );

    // Проверяем, что рабочее время принадлежит текущему тренеру
    const workingHour = await db<TrainerWorkingHour>("TrainerWorkingHours")
      .where({ id: workingHourId, trainer_id: trainerId })
      .first();

    if (!workingHour) {
      logger.debug(
        `Рабочее время ID: ${id} не найдено для тренера ID: ${trainerId}`
      );
      res.status(404).json({ message: "Рабочее время не найдено" });
    }

    await db<TrainerWorkingHour>("TrainerWorkingHours")
      .where({ id: workingHourId })
      .update({
        day_of_week,
        specific_date,
        start_time,
        end_time,
      });

    const updatedWorkingHour = await db<TrainerWorkingHour>(
      "TrainerWorkingHours"
    )
      .where({ id: workingHourId })
      .first();

    logger.debug(
      `Рабочее время ID: ${id} успешно обновлено для тренера ID: ${trainerId}`,
      { updatedWorkingHour }
    );

    res.status(200).json({
      message: "Рабочее время успешно обновлено",
      updatedWorkingHour,
    });
  } catch (error) {
    logger.error(
      `Ошибка при обновлении рабочего времени ID: ${req.params.id} для тренера ID: ${req.user?.id}`,
      { error }
    );
    next(error);
  }
};

// Удаление рабочего времени
export const deleteWorkingHours = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trainerId = req.user.id;
    const { id } = req.params;
    const workingHourId = parseInt(id, 10);

    logger.debug(
      `Удаление рабочего времени ID: ${id} для тренера ID: ${trainerId}`
    );

    // Проверяем, что рабочее время принадлежит текущему тренеру
    const workingHour = await db<TrainerWorkingHour>("TrainerWorkingHours")
      .where({ id: workingHourId, trainer_id: trainerId })
      .first();

    if (!workingHour) {
      logger.debug(
        `Рабочее время ID: ${id} не найдено для тренера ID: ${trainerId}`
      );
      res.status(404).json({ message: "Рабочее время не найдено" });
    }

    await db<TrainerWorkingHour>("TrainerWorkingHours")
      .where({ id: workingHourId })
      .del();

    logger.debug(
      `Рабочее время ID: ${id} успешно удалено для тренера ID: ${trainerId}`
    );

    res.status(200).json({ message: "Рабочее время успешно удалено" });
  } catch (error) {
    logger.error(
      `Ошибка при удалении рабочего времени ID: ${req.params.id} для тренера ID: ${req.user?.id}`,
      { error }
    );
    next(error);
  }
};
