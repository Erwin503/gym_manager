import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/knex";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/authMiddleware";
import logger from "../utils/logger";

// Функция регистрации пользователя
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, phone } = req.body;
    logger.debug(`name: ${name}, email: ${email}, password: ${password}`);

    // Проверка существования пользователя
    const existingUser = await db("Users").where({ email }).first();
    if (existingUser) {
      throw new AppError("Пользователь с таким email уже существует", 400);
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const [user] = await db("Users")
      .insert({
        name,
        email,
        password_hash: hashedPassword,
        phone,
        role: "user",
      })
      .returning(["id", "name", "email", "phone", "role"]);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res
      .status(201)
      .json({ message: "Пользователь успешно зарегистрирован", token: token});
  } catch (error) {
    next(error);
  }
};

// Функция авторизации пользователя
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    logger.debug(`email: ${email}, password: ${password}`);

    const user = await db("Users").where({ email }).first();
    if (!user) {
      throw new AppError("Неверный email или пароль", 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError("Неверный email или пароль", 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res
      .status(200)
      .json({
        message: "Вход успешен",
        token: token,
        user: { id: user.id, name: user.name, email: user.email },
      });
  } catch (error) {
    next(error);
  }
};

// Функция для получения профиля пользователя
export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    logger.debug(`id: ${userId}`);

    const user = await db("Users").where({ id: userId }).first();
    if (!user) {
      throw new AppError("Пользователь не найден", 404);
    }

    res
      .status(200)
      .json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
  } catch (error) {
    next(error);
  }
};

// Функция для обновления профиля пользователя
export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { name, email, phone } = req.body;

    logger.debug(`id: ${userId}, name: ${name}, email: ${email}, phone: ${phone}`);

    await db("Users")
      .where({ id: userId })
      .update({ name, email, phone, updated_at: new Date() });

    res.status(200).json({ message: "Профиль успешно обновлен" });
  } catch (error) {
    next(error);
  }
};

// Функция для удаления пользователя
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    
    logger.debug(`id: ${userId}`);

    await db("Users").where({ id: userId }).del();

    res.status(200).json({ message: "Пользователь успешно удален" });
  } catch (error) {
    next(error);
  }
};
