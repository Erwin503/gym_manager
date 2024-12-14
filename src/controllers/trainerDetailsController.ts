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
    const { specialization, experience_years, bio, certifications, photo_url } =
      req.body;
    let user_id;

    if (req.user.role === "gym_admin" || req.user.role === "super_admin") {
      user_id = req.body.user_id;
    }
    else if (req.user.role === "trainer") {
      user_id = req.user.id;
    }

    logger.debug(
      `Добавление информации о тренере для пользователя ID: ${user_id}`,
      { data: req.body }
    );

    const user: User = (await db<User>("Users")
      .where({ id: user_id })
      .first())!;

    if (!user) {
      logger.error(`Пользователь не найден: ${user_id}`);
      res.status(404).json({ message: "Информация о пользователе не найдена" });
      return;
    }
    logger.debug(`Роль пользователя: ${user.role}`);

    if (user.role != "trainer") {
      res.status(403).json({ message: `У выбранного пользователя неподходящая роль: ${user.role}, требуется роль: trainer` });
    }


    logger.debug(`user_id: ${user_id}, role: ${user.role}, user.id: ${user.id}, req.user.id: ${req.user.id}`);

    const trainerInfo = await db<TrainerDetails>("TrainersDetails")
      .where({ user_id: parseInt(user_id, 10) })
      .first();

    if (trainerInfo) {
      logger.error(
        `У тренера уже есть информация, пожалуйста обновите уже существующую. ${trainerInfo}`
      );
      res.status(404).json({
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
    const user_id = req.params.id;

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
      `Ошибка при получении информации о тренере для пользователя ID: ${JSON.stringify(
        req.user
      )}`,
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
      `Ошибка при получении информации о тренере для пользователя ID: ${JSON.stringify(
        req.params.id
      )}`,
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

// Обновление информации о тренере
export const updateTrainerDetailsForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.params.id;
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

export const getAllTrainers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Выполняем запрос к базе данных
    const trainers = await db("Users")
      .leftJoin("TrainersDetails", "Users.id", "=", "TrainersDetails.user_id") // Присоединяем таблицу TrainersDetails
      .where("Users.role", "trainer") // Фильтруем только тренеров
      .select(
        "Users.id as user_id",
        "Users.name",
        "Users.email",
        "TrainersDetails.specialization",
        "TrainersDetails.experience_years",
        "TrainersDetails.bio",
        "TrainersDetails.certifications",
        "TrainersDetails.photo_url"
      );

    // Преобразуем данные, чтобы при отсутствии деталей добавлялось сообщение
    const formattedTrainers = trainers.map(trainer => {
      const hasDetails = trainer.specialization || trainer.experience_years || trainer.bio || trainer.certifications || trainer.photo_url;
      if (!hasDetails) {
        return {
          user_id: trainer.user_id,
          name: trainer.name,
          email: trainer.email,
          message: "У этого тренера нет дополнительной информации"
        };
      }
      return {
        user_id: trainer.user_id,
        name: trainer.name,
        email: trainer.email,
        specialization: trainer.specialization,
        experience_years: trainer.experience_years,
        bio: trainer.bio,
        certifications: trainer.certifications,
        photo_url: trainer.photo_url
      };
    });

    // Возвращаем список тренеров
    res.status(200).json(formattedTrainers);
  } catch (error) {
    logger.error("Ошибка при получении всех тренеров", { error });
    next(error);
  }
};

