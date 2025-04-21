import { ImageData } from './user.model';

export interface Restaurant {
  id?: string;
  name: string;
  description?: string;
  username: string;          // Para URL amigable
  logo?: ImageData;
  coverImage?: ImageData;
  address?: Address;
  contact?: Contact;
  schedule?: Schedule[];
  categories?: string[];     // IDs de categorías
  rating?: Rating;
  followers?: number;
  menuSections?: MenuSection[];
  socialLinks?: SocialLink[];
  features?: string[];       // Características como "Terraza", "WiFi", etc.
  priceRange?: '€' | '€€' | '€€€';
  cuisineType?: string[];    // Tipo de cocina: "Italiana", "Mexicana", etc.
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Address {
  street: string;
  number?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface Schedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: boolean;
  openTime?: string;  // Formato: "HH:MM"
  closeTime?: string; // Formato: "HH:MM"
}

export interface Rating {
  average: number;
  count: number;
}

export interface MenuSection {
  id?: string;
  name: string;
  description?: string;
  order: number;
  dishes?: string[];  // IDs de platos
}

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'website' | 'other';
  url: string;
  icon?: string;     // Nombre del ícono de Font Awesome
}