// models/linkTree.ts
import { ImageData } from './restaurantOld.model';

// Interfaz para un enlace individual
export interface Link {
  id?: string;
  title: string;          // Título visible del enlace
  url: string;            // URL de destino
  icon?: string;          // Icono (puede ser nombre de icono o URL)
  description?: string;   // Descripción breve opcional
  type: LinkType;         // Tipo de enlace (social, menú, contacto, etc.)
  order: number;          // Orden de visualización
  active: boolean;        // Si el enlace está activo o no
  customColor?: string;   // Color personalizado opcional
  analytics?: {           // Analíticas básicas
    clicks: number;
    lastClicked?: Date;
  };
}

// Tipos de enlaces disponibles
export enum LinkType {
  SOCIAL = "social",      // Redes sociales
  MENU = "menu",          // Enlaces al menú digital
  CONTACT = "contact",    // Información de contacto
  WEBSITE = "website",    // Enlaces a sitios web
  STORE = "store",        // Enlaces a tienda
  CUSTOM = "custom"       // Enlaces personalizados
}

// Interfaz principal para la estructura LinkTree
export interface LinkTree {
  id?: string;
  restaurantId: string;    // ID del restaurante asociado
  title?: string;          // Título para la página de links
  description?: string;    // Descripción breve
  
  // Personalización visual
  profileImage?: ImageData; // Imagen de perfil (usualmente logo)
  coverImage?: ImageData;   // Imagen de portada (background)
  textImage?: ImageData; // Imagen con el nombre del restaurante (reemplaza el texto)
  backgroundColor?: string; // Color de fondo
  textColor?: string;       // Color del texto
  buttonStyle?: "rounded" | "square" | "pill"; // Estilo de botones
  theme?: "light" | "dark" | "custom";        // Tema visual
  customCss?: string;       // CSS personalizado opcional
  
  // La lista de enlaces
  links: Link[];
  
  // Configuraciones
  isPublic: boolean;        // Si la página es pública o no
  customSlug?: string;      // URL personalizada (ejemplo: mirestaurante)
  
  // Meta-información
  createdAt?: Date;
  updatedAt?: Date;
  
  // Analíticas básicas
  analytics?: {
    totalVisits: number;
    totalClicks: number;
    uniqueVisitors: number;
  };
}

// Interfaz para la creación de un nuevo LinkTree
export interface LinkTreeCreate {
  restaurantId: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  customSlug?: string;
}

// Interfaz para la actualización de un LinkTree existente
export interface LinkTreeUpdate {
  title?: string;
  description?: string;
  profileImage?: ImageData;
  coverImage?: ImageData;
  textImage?: ImageData;
  backgroundColor?: string;
  textColor?: string;
  buttonStyle?: "rounded" | "square" | "pill";
  theme?: "light" | "dark" | "custom";
  customCss?: string;
  isPublic?: boolean;
  customSlug?: string;
}

// Interfaz para crear un nuevo enlace
export interface LinkCreate {
  title: string;
  url: string;
  icon?: string;
  description?: string;
  type: LinkType;
  order?: number;
  active?: boolean;
  customColor?: string;
}

// Interfaz para actualizar un enlace existente
export interface LinkUpdate {
  title?: string;
  url?: string;
  icon?: string;
  description?: string;
  type?: LinkType;
  order?: number;
  active?: boolean;
  customColor?: string;
}

// Interfaz para respuestas con analíticas
export interface LinkTreeAnalytics {
  views: {
    total: number;
    unique: number;
    daily: {
      date: string;
      count: number;
    }[];
  };
  clicks: {
    total: number;
    byLink: {
      linkId: string;
      linkTitle: string;
      count: number;
    }[];
    daily: {
      date: string;
      count: number;
    }[];
  };
}