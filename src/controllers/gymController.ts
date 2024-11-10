import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { Gym } from '../interfaces/model'; // Импортируем интерфейс Gym

// Добавление нового зала
export const addGym = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, phone, email } = req.body;

    const [gym] = await db<Gym>('Gyms')
      .insert({
        name,
        address,
        phone,
        email,
      })
      .returning('*'); // Получаем все данные о созданном зале

    res.status(201).json({
      message: 'Зал успешно добавлен',
      gym,
    });
  } catch (error) {
    next(error);
  }
};

// Получение всех залов
export const getAllGyms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gyms = await db<Gym>('Gyms').select('*');
    res.status(200).json(gyms);
  } catch (error) {
    next(error);
  }
};

// Получение одного зала по ID
export const getGymById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const gym = await db<Gym>('Gyms').where({ id: parseInt(id, 10) }).first();

    if (!gym) {
      res.status(404).json({ message: 'Зал не найден' });
    }

    res.status(200).json(gym);
  } catch (error) {
    next(error);
  }
};

// Обновление информации о зале
export const updateGym = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email } = req.body;

    const updatedCount = await db<Gym>('Gyms')
      .where({ id: parseInt(id, 10) })
      .update({
        name,
        address,
        phone,
        email,
      });

    if (!updatedCount) {
      res.status(404).json({ message: 'Зал не найден' });
    }

    const updatedGym = await db<Gym>('Gyms').where({ id: parseInt(id, 10) }).first();
    res.status(200).json({
      message: 'Зал успешно обновлен',
      updatedGym,
    });
  } catch (error) {
    next(error);
  }
};

// Удаление зала
export const deleteGym = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deletedCount = await db<Gym>('Gyms').where({ id: parseInt(id, 10) }).del();

    if (!deletedCount) {
        res.status(404).json({ message: 'Зал не найден' });
    }

    res.status(200).json({ message: 'Зал успешно удален' });
  } catch (error) {
    next(error);
  }
};
