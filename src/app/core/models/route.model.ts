import { ImageData } from './user.model';

export interface GastronomicRoute {
  id?: string;
  name: string;
  description?: string;
  creatorId: string;
  creatorName?: string;
  creatorImage?: ImageData;
  coverImage?: ImageData;
  stops: RouteStop[];
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;  // En minutos
  distance?: number;       // En kilómetros
  likes?: number;
  followers?: number;      // Gente que guarda la ruta
  completed?: number;      // Cuántas personas la han completado
  completionStatus?: RouteCompletionStatus; // Estado de completado para el usuario actual
  isPublic?: boolean;      // Si es pública o privada
  city?: string;
  country?: string;
  totalRestaurants?: number; // Número total de restaurantes en la ruta
  totalDishes?: number;     // Número total de platos recomendados
  avgRating?: number;       // Valoración promedio de la ruta (0-5)
  category?: string;        // Categoría de la ruta (gourmet, street food, etc.)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RouteStop {
  id?: string;
  order: number;
  restaurantId: string;
  restaurantName?: string;
  restaurantImage?: ImageData;
  restaurantAddress?: string;
  dishId?: string;        // Opcional: plato recomendado
  dishName?: string;
  dishImage?: ImageData;
  dishPrice?: number;
  notes?: string;         // Notas del creador
  isCompleted?: boolean;  // Si el usuario ha completado esta parada
  completedDate?: Date;   // Fecha en que completó la parada
}

export interface RouteCompletionStatus {
  isStarted: boolean;    // Si el usuario ha iniciado la ruta
  completedStops: number; // Número de paradas completadas
  totalStops: number;     // Número total de paradas
  progress: number;       // Porcentaje de progreso (0-100)
  startedDate?: Date;     // Fecha de inicio
  lastVisitDate?: Date;   // Fecha de última visita
  completedDate?: Date;   // Fecha de completado (si está completada)
}

export interface RouteReview {
  id?: string;
  userId: string;
  userName?: string;
  userImage?: ImageData;
  routeId: string;
  rating: number;        // Valoración de 0 a 5
  comment?: string;
  images?: ImageData[];
  likes?: number;
  createdAt?: Date;
}

export interface SocialActivity {
  id?: string;
  userId: string;
  userName?: string;
  userImage?: ImageData;
  type: ActivityType;
  targetId?: string;      // ID del restaurante, plato, etc.
  targetName?: string;    // Nombre del objetivo
  targetImage?: ImageData; // Imagen del objetivo
  data?: any;             // Datos adicionales según el tipo
  createdAt?: Date;
}

export type ActivityType = 
  | 'rating' 
  | 'favorite' 
  | 'visit' 
  | 'route_completed'
  | 'route_started'
  | 'route_progress'
  | 'route_created'
  | 'follow_restaurant'
  | 'follow_user'
  | 'badge_earned';