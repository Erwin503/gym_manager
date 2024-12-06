import { Request, Response, NextFunction } from "express";
import db from "../db/knex";
import { TrainerDetails, User } from "../interfaces/model";
import logger from "../utils/logger";
import { AuthRequest } from "../middleware/authMiddleware";


// Добавление информации о тренере
export const addTrainerDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      specialization,
      experience_years,
      bio,
      certifications,
      photo_url,
    } = req.body;
    const user_id = req.user.id

    logger.debug(
      `Добавление информации о тренере для пользователя ID: ${user_id}`,
      { data: req.body }
    );

    const user: User = (await db<User>("Users").where({id: user_id}).first())!;

    if (!user) {
      logger.error(`Пользователь не найден: ${user_id}`);
      res.status(404).json({ message: "Информация о пользователе не найдена" });
      return;
    }
    logger.debug(`Роль пользователя: ${user.role}`)

    if (user.role != "trainer") {
      logger.error(`У пользователя ${user_id} не подходящая роль`);
      res.status(404).json({ message: "У пользователя не подходящая роль" });
      return;
    }

    const trainerInfo = await db<TrainerDetails>("TrainersDetails")
      .where({ user_id: parseInt(user_id, 10) })
      .first();

    if (trainerInfo) {
      logger.error(
        `У тренера уже есть информация, пожалуйста обновите уже существующую. ${trainerInfo}`
      );
      res
        .status(404)
        .json({
          message: `У тренера уже есть информация, пожалуйста обновите уже существующую. ${trainerInfo}`,
        });
      return;
    }

    const [trainer] = await db<TrainerDetails>("TrainersDetails")
      .insert({
        user_id,
        specialization,
        experience_years,
        bio,
        certifications,
        photo_url,
      })
      .returning("*");

    logger.debug(
      `Информация о тренере успешно добавлена для пользователя ID: ${user_id}`,
      { trainer }
    );

    res.status(201).json({
      message: "Информация о тренере успешно добавлена",
      trainer,
    });
  } catch (error) {
    logger.error(
      `Ошибка при добавлении информации о тренере для пользователя ID: ${req.body.user_id}`,
      { error }
    );
    next(error);
  }
};

// Получение информации о тренере по ID пользователя
export const getTrainerDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user.id;

    logger.debug(
      `Получение информации о тренере для пользователя ID: ${user_id}`
    );

    const trainer = await db<TrainerDetails>("TrainersDetails")
      .where({ user_id: parseInt(user_id, 10) })
      .first();

    if (!trainer) {
      logger.error(
        `Информация о тренере не найдена для пользователя ID: ${user_id}`
      );
      res.status(404).json({ message: "Информация о тренере не найдена" });
      return;
    }

    res.status(200).json(trainer);
  } catch (error) {
    logger.error(
      `Ошибка при получении информации о тренере для пользователя ID: ${JSON.stringify(req.user)}`,
      { error }
    );
    next(error);
  }
};
// Получение информации о тренере по ID пользователя
export const getTrainerDetailsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = parseInt(req.params.id, 10);

    logger.debug(
      `Получение информации о тренере для пользователя ID: ${user_id}`
    );

    const trainer = await db<TrainerDetails>("TrainersDetails")
      .where({ user_id: user_id })
      .first();

    if (!trainer) {
      logger.error(
        `Информация о тренере не найдена для пользователя ID: ${user_id}`
      );
      res.status(404).json({ message: "Информация о тренере не найдена" });
      return;
    }

    res.status(200).json(trainer);
  } catch (error) {
    logger.error(
      `Ошибка при получении информации о тренере для пользователя ID: ${JSON.stringify(req.params.id)}`,
      { error }
    );
    next(error);
  }
};

// Обновление информации о тренере
export const updateTrainerDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user.id;
    const { specialization, experience_years, bio, certifications, photo_url } =
      req.body;

    logger.debug(
      `Обновление информации о тренере для пользователя ID: ${user_id}`,
      { data: req.body }
    );

    const updatedCount = await db<TrainerDetails>("TrainersDetails")
      .where({ user_id: parseInt(user_id, 10) })
      .update({
        specialization,
        experience_years,
        bio,
        certifications,
        photo_url,
      });

    if (!updatedCount) {
      logger.debug(
        `Информация о тренере не найдена для пользователя ID: ${user_id}`
      );
      res.status(404).json({ message: "Информация о тренере не найдена" });
    }

    const updatedTrainer = await db<TrainerDetails>("TrainersDetails")
      .where({ user_id: parseInt(user_id, 10) })
      .first();

    logger.debug(
      `Информация о тренере успешно обновлена для пользователя ID: ${user_id}`,
      { updatedTrainer }
    );

    res.status(200).json({
      message: "Информация о тренере успешно обновлена",
      updatedTrainer,
    });
  } catch (error) {
    logger.error(
      `Ошибка при обновлении информации о тренере для пользователя ID: ${req.params.user_id}`,
      { error }
    );
    next(error);
  }
};

// Удаление информации о тренере
export const deleteTrainerDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user.id;

    logger.debug(
      `Удаление информации о тренере для пользователя ID: ${user_id}`
    );

    const deletedCount = await db<TrainerDetails>("TrainersDetails")
      .where({ user_id: parseInt(user_id, 10) })
      .del();

    if (!deletedCount) {
      logger.debug(
        `Информация о тренере не найдена для пользователя ID: ${user_id}`
      );
      res.status(404).json({ message: "Информация о тренере не найдена" });
    }

    logger.debug(
      `Информация о тренере успешно удалена для пользователя ID: ${user_id}`
    );

    res.status(200).json({ message: "Информация о тренере успешно удалена" });
  } catch (error) {
    logger.error(
      `Ошибка при удалении информации о тренере для пользователя ID: ${req.params.user_id}`,
      { error }
    );
    next(error);
  }
};
