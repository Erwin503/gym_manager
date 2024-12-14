import db from "../db/knex";
import { AuthRequest } from "../middleware/authMiddleware";
import logger from "../utils/logger";
import { Request, Response, NextFunction } from "express";

export const createWorkingHour = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      trainer_id,
      day_of_week,
      specific_date,
      start_time,
      end_time,
      status = "available",
    } = req.body;

    const [newWorkingHour] = await db("TrainerWorkingHours")
      .insert({
        trainer_id,
        day_of_week,
        specific_date,
        start_time,
        end_time,
        status,
      })
      .returning("*");

    logger.debug("Новый рабочий час успешно создан", { newWorkingHour });

    res.status(201).json({
      message: "Рабочий час успешно создан",
      working_hour: newWorkingHour,
    });
  } catch (error) {
    logger.error("Ошибка при создании рабочего часа", { error });
    next(error);
  }
};

export const getTrainerWorkingHoursWithSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, id: userId } = req.user; // Получаем роль и ID пользователя
    let trainer_id;

    if (role === "trainer") {
      trainer_id = userId; // Если тренер, работаем только с его ID
      logger.debug("Получение рабочих часов тренера с ID", { trainer_id });
    } else if (role === "super_admin" || role === "gym_admin") {
      // Если админ, требуем передать ID тренера
      trainer_id = req.query.trainer_id;
      if (!trainer_id) {
        res.status(400).json({
          message:
            "Для администратора необходимо указать ID тренера в параметре запроса trainer_id.",
        });
      }
      logger.debug("Получение рабочих часов для тренера с ID", { trainer_id });
    } else {
      res.status(403).json({
        message: "У вас нет прав для получения рабочих часов тренера.",
      });
    }

    // Получаем все рабочие часы тренера вместе с сессиями (статус = 'booked')
    const workingHoursWithSessions = await db("TrainerWorkingHours as twh")
      .leftJoin("TrainingSessions as ts", function () {
        this.on("twh.id", "=", "ts.working_hour_id").andOn(
          "ts.status",
          "=",
          db.raw("?", ["booked"])
        );
      })
      .where("twh.trainer_id", trainer_id)
      .select(
        "twh.id as working_hour_id",
        "twh.trainer_id",
        "twh.day_of_week",
        "twh.specific_date",
        "twh.start_time",
        "twh.end_time",
        "twh.status as working_hour_status",
        db.raw(`
          CASE 
            WHEN twh.status != 'available' THEN 
              JSON_ARRAYAGG(JSON_OBJECT(
                'id', ts.id, 
                'user_id', ts.user_id, 
                'working_hour_id', ts.working_hour_id, 
                'gym_id', ts.gym_id, 
                'status', ts.status
              )) 
            ELSE NULL 
          END as sessions
        `)
      )
      .groupBy(
        "twh.id",
        "twh.trainer_id",
        "twh.day_of_week",
        "twh.specific_date",
        "twh.start_time",
        "twh.end_time",
        "twh.status"
      );

    logger.debug("Рабочие часы с сессиями успешно получены", {
      workingHoursWithSessions,
    });

    res.status(200).json(workingHoursWithSessions);
  } catch (error) {
    logger.error("Ошибка при получении рабочих часов тренера с сессиями", {
      error,
    });
    next(error);
  }
};
export const getTrainerWorkingHoursWithSessionsForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Получаем id тренера из параметров запроса
    const trainer_id = req.params.id;

    if (!trainer_id) {
      res.status(400).json({
        message: "Необходимо передать ID тренера в параметре запроса.",
      });
    }

    logger.debug("Получение рабочих часов тренера с ID", { trainer_id });

    // Проверяем, существует ли пользователь с таким id и имеет ли он роль 'trainer'
    const trainer = await db("Users")
      .where({ id: trainer_id, role: "trainer" })
      .first();

    if (!trainer) {
      res.status(404).json({
        message:
          "Пользователь с указанным ID не найден или не является тренером.",
      });
    }

    // Получаем все рабочие часы тренера вместе с сессиями (статус = 'booked')
    const workingHoursWithSessions = await db("TrainerWorkingHours as twh")
      .leftJoin("TrainingSessions as ts", function () {
        this.on("twh.id", "=", "ts.working_hour_id").andOn(
          "ts.status",
          "=",
          db.raw("?", ["booked"])
        );
      })
      .leftJoin("Users as trainers", "twh.trainer_id", "trainers.id")
      .leftJoin("Users as clients", "ts.user_id", "clients.id")
      .where("twh.trainer_id", trainer_id)
      .select(
        "twh.id as working_hour_id",
        "twh.trainer_id",
        "twh.day_of_week",
        "twh.specific_date",
        "twh.start_time",
        "twh.end_time",
        "twh.status as working_hour_status",
        "trainers.name as trainer_name",
        "clients.name as client_name",
        db.raw(`
          CASE 
            WHEN twh.status != 'available' THEN JSON_ARRAYAGG(JSON_OBJECT(
              'id', ts.id, 
              'user_id', ts.user_id, 
              'working_hour_id', ts.working_hour_id, 
              'gym_id', ts.gym_id, 
              'status', ts.status
            ))
            ELSE NULL
          END as sessions
        `)
      )
      .groupBy(
        "twh.id",
        "twh.trainer_id",
        "twh.day_of_week",
        "twh.specific_date",
        "twh.start_time",
        "twh.end_time",
        "twh.status",
        "trainers.name",
        "clients.name",
      );
    logger.debug("Рабочие часы с сессиями успешно получены", {
      workingHoursWithSessions,
    });

    res.status(200).json(workingHoursWithSessions);
  } catch (error) {
    logger.error("Ошибка при получении рабочих часов тренера с сессиями", {
      error,
    });
    next(error);
  }
};

export const updateWorkingHour = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const { day_of_week, specific_date, start_time, end_time, status } =
      req.body;

    const updatedCount = await db("TrainerWorkingHours").where({ id }).update({
      day_of_week,
      specific_date,
      start_time,
      end_time,
      status,
      updated_at: new Date(),
    });

    if (!updatedCount) {
      res.status(404).json({ message: "Рабочий час не найден" });
    }

    logger.debug("Рабочий час успешно обновлён", { id });

    res.status(200).json({ message: "Рабочий час успешно обновлён" });
  } catch (error) {
    logger.error("Ошибка при обновлении рабочего часа", { error });
    next(error);
  }
};

export const deleteWorkingHour = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deletedCount = await db("TrainerWorkingHours").where({ id }).del();

    if (!deletedCount) {
      res.status(404).json({ message: "Рабочий час не найден" });
    }

    logger.debug("Рабочий час успешно удалён", { id });

    res.status(200).json({ message: "Рабочий час успешно удалён" });
  } catch (error) {
    logger.error("Ошибка при удалении рабочего часа", { error });
    next(error);
  }
};
