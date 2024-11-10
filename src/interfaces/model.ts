// Интерфейс для таблицы Users
export interface User {
    id?: number;
    name?: string;
    email: string;
    password_hash: string;
    phone?: string;
    role: 'super_admin' | 'gym_admin' | 'trainer' | 'user';
  }
  
  // Интерфейс для таблицы TrainersDetails
  export interface TrainerDetails {
    id?: number;
    user_id: number; // Ссылка на пользователя
    specialization?: string;
    experience_years?: number;
    bio?: string;
    certifications?: string;
    photo_url?: string;
  }
  
  // Интерфейс для таблицы TrainerWorkingHours
  export interface TrainerWorkingHour {
    id?: number;
    trainer_id: number; // Ссылка на тренера
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    specific_date?: Date; // Необязательное поле для специфической даты
    start_time: string; // Используем строку для времени
    end_time: string;
  }
  
  // Интерфейс для таблицы Gyms
  export interface Gym {
    id?: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  }
  
  // Интерфейс для таблицы TrainingSessions
  export interface TrainingSession {
    id: number;
    user_id: number; // Ссылка на пользователя
    trainer_id: number; // Ссылка на тренера
    gym_id: number; // Ссылка на тренажерный зал
    date: Date;
    training_type?: string;
    comments?: string; // Необязательное поле
  }
  
  // Интерфейс для таблицы BookedSessions
  export interface BookedSession {
    id: number;
    user_id: number; // Ссылка на пользователя
    trainer_id: number; // Ссылка на тренера
    gym_id: number; // Ссылка на тренажерный зал
    session_id: number; // Ссылка на тренировочную сессию
    date: Date;
    status: 'booked' | 'completed' | 'canceled';
  }
  
  // Интерфейс для таблицы Memberships
  export interface Membership {
    id: number;
    user_id: number; // Ссылка на пользователя
    gym_id: number; // Ссылка на тренажерный зал
    start_date: Date;
    end_date: Date;
    sessions_included: number;
    sessions_used: number;
  }
  
  // Интерфейс для таблицы Payments
  export interface Payment {
    id: number;
    user_id: number; // Ссылка на пользователя
    gym_id: number; // Ссылка на тренажерный зал
    amount: number;
    payment_method: string;
    payment_date: Date;
  }
  