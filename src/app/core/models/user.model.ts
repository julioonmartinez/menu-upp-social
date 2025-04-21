export interface User {
    id?: string;
    email: string;
    name: string;
    lastName?: string;
    role: 'USER' | 'RESTAURANT' | 'ADMIN';
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface SocialUser extends User {
    username?: string;          // Username único para URL
    profileImage?: ImageData;   // Avatar
    followers?: number;         // Conteo de seguidores
    following?: number;         // Conteo de seguidos
    bio?: string;               // Biografía corta
    location?: string;          // Ubicación
    passport?: UserPassport;    // Datos del pasaporte gastronómico
    favorites?: string[];       // IDs de platillos favoritos
    visitedRestaurants?: string[]; // IDs de restaurantes visitados
    completedRoutes?: string[]; // IDs de rutas completadas
    badges?: string[];          // IDs de insignias obtenidas
  }
  
  export interface UserPassport {
    level: number;
    experience: number;
    badges: Badge[];
    visited: number;
    reviews: number;
    routes: number;
  }
  
  export interface ImageData {
    url: string;
    alt?: string;
  }
  
  export interface Badge {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    dateEarned?: Date;
  }