import { ImageData } from './user.model';

export interface Dish {
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;     // EUR, USD, etc.
  images?: ImageData[];
  mainImage?: ImageData;
  restaurantId: string;
  categoryId?: string;
  ingredients?: string[];
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  rating?: DishRating;
  restaurantUsername?: string;
  reviews?: DishReview[];
  favorites?: number;    // Número de favoritos
  featured?: boolean;    // Destacado en el menú
  available?: boolean;   // Disponible o no
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DishRating {
  average: number;   // Promedio de 0 a 5
  count: number;     // Número total de valoraciones
}

export interface DishReview {
  id?: string;
  userId: string;
  userName?: string;
  userImage?: ImageData;
  rating: number;      // De 0 a 5
  comment?: string;
  images?: ImageData[];
  createdAt?: Date;
  likes?: number;
}

export interface Category {
  id?: string;
  name: string;
  description?: string;
  icon?: string;        // Nombre del ícono de Font Awesome
  restaurantId?: string;
  order?: number;       // Para ordenar categorías
}