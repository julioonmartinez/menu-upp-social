export interface ImageData {
    url: string;
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
  }
  
  // Interfaz para Categoría
  export interface Category {
      id?: string;
      name: string;
      description?: string;
      restaurantId?: string;
    }
    
    // Interfaz para opciones personalizables de platillos
    export interface DishOption {
      name: string;
      price: number;
      description?: string;
    }
    
    // Interfaz para información nutricional
    export interface NutritionalInfo {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      allergens?: string[];
    }
    
    // Interfaz para Platillo
    export interface Dish {
      id?: string;
      name: string;
      description: string;
      price: number;
      rating: number;
      reviewsCount?: number;
      image: string;
      image_data?: ImageData;
      favorites: number;
      categoryId: string;
      restaurantId?: string;
      userRating?: number;
      userFav?: boolean;
      
      // Campos para tienda
      inStock?: boolean;
      quantity?: number;
      options?: DishOption[];
      discount?: number;
      nutritionalInfo?: NutritionalInfo;
    }
  
    export interface SocialIcons {
      [key: string]: string;
    }
  
    export interface SocialLinks {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      tiktok?: string;
      youtube?: string;
      linkedin?: string;
      whatsapp?: string;
      telegram?: string;
      pinterest?: string;
      snapchat?: string;
      other?: string;
    }
  
    
    // Interfaz para Restaurante
    export interface Restaurant {
    // Información básica (requerida inicialmente)
    id?: string;
    name: string;
    description?: string;
    isPremium?: boolean;
    username?: string; // Nombre de usuario para el login
    // Contacto y ubicación (segundo paso de configuración)
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    
    // Horarios (tercer paso de configuración)
    schedule?: string;  // Formato simple
    businessHours?: {   // Formato avanzado
      monday?: { open?: string; close?: string; closed?: boolean };
      tuesday?: { open?: string; close?: string; closed?: boolean };
      wednesday?: { open?: string; close?: string; closed?: boolean };
      thursday?: { open?: string; close?: string; closed?: boolean };
      friday?: { open?: string; close?: string; closed?: boolean };
      saturday?: { open?: string; close?: string; closed?: boolean };
      sunday?: { open?: string; close?: string; closed?: boolean };
    };
    
    // Identidad visual (cuarto paso de configuración)
    logo?: string;  // Logo principal
    imageProfile?: string;  // Imagen de perfil (cuadrada)
    imageCover?: string;    // Imagen de portada (banner)
    image?: string;         // Imagen general
    primaryColor?: string;  // Color principal de la marca
    secondaryColor?: string; // Color secundario
    fontFamily?: string;    // Tipografía principal
    imageText: string; // Nombre del restaurante en la imagen
    // Redes sociales (quinto paso de configuración)
    socialLinks?: SocialLinks;
    
    // Características específicas (sexto paso de configuración)
    features?: string[];    // ["delivery", "takeaway", "outdoor_seating", etc]
    cuisineType?: string[]; // ["mexicana", "italiana", "vegana", etc]
    paymentMethods?: string[]; // ["efectivo", "tarjeta", "online", etc]
    priceRange?: "low" | "medium" | "high" | "premium";  // Rango de precios
    
    // QR y configuraciones técnicas (paso final)
    qrCode?: string;  // URL de la imagen QR generada
    customDomain?: string;  // Dominio personalizado
    showRatings?: boolean;  // Mostrar valoraciones
    allowReviews?: boolean; // Permitir reseñas
    allowOrders?: boolean;  // Permitir pedidos online
    
    // Meta-información
    ownerId?: string;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    planType?: "free" | "basic" | "premium" | "enterprise";
    
    // Analíticas básicas para mostrar en el dashboard
    analytics?: {
      visitsCount?: number;
      ordersCount?: number;
      favoritesCount?: number;
      reviewsCount?: number;
      averageRating?: number;
    };
    }
    
    // Interfaz para roles de usuario
    export enum UserRole {
      CUSTOMER = "customer",
      OWNER = "owner",
      ADMIN = "admin"
    }
    
    // Interfaz para Usuario
    export interface User {
      id?: string;
      email: string;
      name: string;
      role?: UserRole;
      active?: boolean;
    }
    
    // Extensión para creación de usuario
    export interface UserCreate extends User {
      password: string;
    }
    
    // Extensión para actualización de usuario
    export interface UserUpdate {
      email?: string;
      name?: string;
      role?: UserRole;
      password?: string;
    }
    
    // Interfaz para valoraciones
    export interface Rating {
      id?: string;
      dishId: string;
      userId?: string;
      rating: number;
      comment?: string;
      timestamp?: string;
    }
    
    // Interfaz para favoritos
    export interface Favorite {
      id?: string;
      dishId: string;
      userId: string;
      timestamp?: string;
    }
    
    // Interfaces para autenticación
    export interface LoginCredentials {
      username: string; // En realidad es el email, pero se usa username por el estándar OAuth
      password: string;
    }
    
    export interface AuthToken {
      access_token: string;
      token_type: string;
    }
    
    // Interfaces para paginación
    export interface Pagination {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    }
    
    // Interfaces para respuestas paginadas
    export interface PaginatedDishes {
      dishes: Dish[];
      pagination: Pagination;
    }
    
    export interface PaginatedRatings {
      ratings: Rating[];
      pagination: Pagination;
    }
    
    // Interfaces para respuestas de acciones
    export interface FavoriteResponse {
      id: string;
      favorites: number;
      userFav: boolean;
      message: string;
    }