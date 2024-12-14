import { Request, Response, NextFunction } from "express";
import db from "../db/knex";
import { AuthRequest } from "../middleware/authMiddleware";
import logger from "../utils/logger";

// Записать клиента на тренировку
export const bookTrainingSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user.id;
    const { working_hour_id, gym_id = 1 } = req.body; // Значение gym_id по умолчанию — 1

    // Проверяем, существует ли рабочий час
    const workingHour = await db("TrainerWorkingHours")
      .where({ id: working_hour_id })
      .first();
    if (!workingHour) {
      res.status(404).json({ message: "Рабочий час не найден" });
    }

    // Проверяем, не занят ли рабочий час
    if (workingHour.status === "booked") {
      res.status(400).json({ message: "Этот рабочий час уже занят" });
    }

    const [session] = await db("TrainingSessions")
      .insert({
        user_id,
        working_hour_id,
        gym_id,
        status: "booked",
      })
      .returning("*");

    // Обновляем статус рабочего часа
    await db("TrainerWorkingHours")
      .where({ id: working_hour_id })
      .update({ status: "booked" });

    res.status(201).json({
      message: "Вы успешно записаны на тренировку",
      session,
    });
  } catch (error) {
    logger.error("Ошибка при записи на тренировку:", error);
    next(error);
  }
};

// Завершить тренировочную сессию
export const completeTrainingSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const trx = await db.transaction(); // Начало транзакции
  try {
    const { id } = req.params; // ID тренировочной сессии
    const { training_type, comments } = req.body;

    // Завершаем тренировочную сессию
    const updatedCount = await trx("TrainingSessions").where({ id }).update({
      status: "completed",
      training_type,
      comments,
      updated_at: new Date(),
    });

    if (!updatedCount) {
      await trx.rollback();
      res.status(404).json({ message: "Тренировочная сессия не найдена" });
    }

    // Получаем ID рабочего часа, связанного с сессией
    const trainingSession = await trx("TrainingSessions")
      .select("working_hour_id")
      .where({ id })
      .first();

    if (!trainingSession) {
      await trx.rollback();
      res.status(404).json({ message: "Связанный рабочий час не найден" });
    }

    const { working_hour_id } = trainingSession;

    // Проверяем статус рабочего часа и обновляем его
    const workingHour = await trx("TrainerWorkingHours")
      .where({ id: working_hour_id })
      .first();

    if (workingHour && workingHour.status === "booked") {
      await trx("TrainerWorkingHours").where({ id: working_hour_id }).update({
        status: "available",
        updated_at: new Date(),
      });
    }

    await trx.commit(); // Подтверждение транзакции

    res
      .status(200)
      .json({ message: "Тренировка завершена и рабочий час обновлён" });
  } catch (error) {
    await trx.rollback(); // Откат транзакции в случае ошибки
    logger.error("Ошибка при завершении тренировки:", error);
    next(error);
  }
};

export const cancelTrainingSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const trx = await db.transaction(); // Начало транзакции
  try {
    const { id } = req.params; // ID тренировочной сессии

    // Завершаем тренировочную сессию
    const updatedCount = await trx("TrainingSessions").where({ id }).update({
      status: "canceled",
      updated_at: new Date(),
    });

    if (!updatedCount) {
      await trx.rollback();
      res.status(404).json({ message: "Тренировочная сессия не найдена" });
    }

    // Получаем ID рабочего часа, связанного с сессией
    const trainingSession = await trx("TrainingSessions")
      .select("working_hour_id")
      .where({ id })
      .first();

    if (!trainingSession) {
      await trx.rollback();
      res.status(404).json({ message: "Связанный рабочий час не найден" });
    }

    const { working_hour_id } = trainingSession;

    // Проверяем статус рабочего часа и обновляем его
    const workingHour = await trx("TrainerWorkingHours")
      .where({ id: working_hour_id })
      .first();

    if (workingHour && workingHour.status === "booked") {
      await trx("TrainerWorkingHours").where({ id: working_hour_id }).update({
        status: "available",
        updated_at: new Date(),
      });
    }

    await trx.commit(); // Подтверждение транзакции

    res
      .status(200)
      .json({ message: "Тренировка завершена и рабочий час обновлён" });
  } catch (error) {
    await trx.rollback(); // Откат транзакции в случае ошибки
    logger.error("Ошибка при завершении тренировки:", error);
    next(error);
  }
};

export const getUserTrainingSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user.id;
    logger.debug(`user_id: ${user_id}`);

    const trainingSessions = await db("TrainingSessions as ts")
      .leftJoin("TrainerWorkingHours as twh", "ts.working_hour_id", "twh.id")
      .leftJoin("Users as trainers", "twh.trainer_id", "trainers.id")
      .leftJoin("Users as clients", "ts.user_id", "clients.id")
      .where("ts.user_id", user_id)
      .select(
        "ts.id as session_id",
        "ts.status",
        "twh.specific_date",
        "twh.day_of_week",
        "twh.start_time",
        "twh.end_time",
        "trainers.name as trainer_name",
        "clients.name as client_name"
      )
      .orderBy("twh.specific_date", "asc")
      .orderBy("twh.start_time", "asc");

    logger.debug("Тренировочные сессии пользователя успешно получены", {
      user_id,
      count: trainingSessions.length,
    });

    res.status(200).json(trainingSessions);
  } catch (error) {
    logger.error("Ошибка при получении тренировочных сессий пользователя", {
      error,
    });
    next(error);
  }
};
