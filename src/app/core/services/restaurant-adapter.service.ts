import { Injectable } from '@angular/core';
import { Restaurant, Address, Contact, Schedule, Rating, SocialLink } from '../models/restaurant.model';
import { ImageData } from '../models/user.model'; // Importar ImageData directamente desde user.model

@Injectable({
  providedIn: 'root'
})
export class RestaurantAdapterService {
  
/**
   * Convierte la respuesta del backend al modelo Restaurant del frontend
   */
adaptRestaurant(backendRestaurant: any): Restaurant {
    if (!backendRestaurant) {
      // Devolver un objeto Restaurant vacío en lugar de null
      return {
        id: '',
        name: '',
        description: '',
        username: '',
        rating: { average: 0, count: 0 },
        followers: 0,
        features: [],
        cuisineType: [],
        priceRange: '$'
      };
    }
    
    // Adaptar imagen de logo - ahora correctamente tipado
    const logo: ImageData | undefined = this.createImageData(
      backendRestaurant.imageProfile || backendRestaurant.image,
      `${backendRestaurant.name} logo`
    );
    
    // Adaptar imagen de portada - ahora correctamente tipado
    const coverImage: ImageData | undefined = this.createImageData(
      backendRestaurant.imageCover,
      `${backendRestaurant.name} cover`
    );
    
    // Adaptar dirección
    const address: Address | undefined = this.createAddressObject(
      backendRestaurant.address,
      backendRestaurant.coordinates
    );
    
    // Adaptar información de contacto
    const contact: Contact = {
      phone: backendRestaurant.phone || undefined,
      email: undefined, // No disponible en la respuesta
      website: undefined // No disponible en la respuesta
    };
    
    // Adaptar horarios
    const schedule: Schedule[] = this.parseScheduleString(backendRestaurant.schedule);
    
    // Adaptar valoración (no disponible en la respuesta)
    const rating: Rating = {
      average: 0,
      count: 0
    };
    
    // Adaptar enlaces sociales
    const socialLinks: SocialLink[] = this.createSocialLinksArray(backendRestaurant.socialLinks);
    
    // Adaptar rango de precios
    const priceRange = this.mapPriceRange(backendRestaurant.priceRange);
    
    // Crear el objeto Restaurant adaptado
    const adaptedRestaurant: Restaurant = {
      id: backendRestaurant.id || '',
      name: backendRestaurant.name || '',
      description: backendRestaurant.description || '',
      username: backendRestaurant.username || '',
      logo, // Ya es correctamente ImageData | undefined
      coverImage, // Ya es correctamente ImageData | undefined
      address,
      contact,
      schedule,
      rating,
      followers: 0, // No disponible en la respuesta
      socialLinks,
      features: backendRestaurant.features || [],
      priceRange,
      cuisineType: backendRestaurant.cuisineType || [],
      updatedAt: backendRestaurant.updatedAt ? new Date(backendRestaurant.updatedAt) : undefined
    };
    
    return adaptedRestaurant;
  }
  
  /**
   * Adapta un array de restaurantes del backend
   */
  adaptRestaurants(backendRestaurants: any[]): Restaurant[] {
    if (!backendRestaurants || !Array.isArray(backendRestaurants)) return [];
    return backendRestaurants.map(item => this.adaptRestaurant(item));
  }
  
  /**
   * Crea un objeto ImageData a partir de una URL
   */
  private createImageData(url: string, alt: string): ImageData | undefined {
    if (!url) return undefined;
    
    return {
      url,
      alt: alt || ''
    };
  }
  
  /**
   * Crea un objeto Address a partir de una dirección en string
   */
  private createAddressObject(addressStr: string, coordinates: any): Address | undefined {
    if (!addressStr) return undefined;
    
    // Intenta extraer información de dirección del string
    const addressParts = this.parseAddressString(addressStr);
    
    // Crear objeto de coordenadas si está disponible
    const coords = coordinates ? {
      lat: coordinates.latitude || 0,
      lng: coordinates.longitude || 0
    } : undefined;
    
    return {
      street: addressParts.street || addressStr,
      number: addressParts.number,
      city: addressParts.city || 'Zamora de Hidalgo',
      state: addressParts.state || 'Michoacán',
      country: 'México',
      postalCode: addressParts.postalCode,
      coordinates: coords
    };
  }
  
  /**
   * Parsea una dirección en formato string para extraer sus componentes
   */
  private parseAddressString(address: string): any {
    // Ejemplo: "Dr. Alonso Martínez 620, Jardinadas, 59680 Zamora de Hidalgo, Mich."
    const result = {
      street: '',
      number: '',
      city: '',
      state: '',
      postalCode: ''
    };
    
    if (!address) return result;
    
    // Patrones para CP mexicano
    const postalCodeMatch = address.match(/\b\d{5}\b/);
    if (postalCodeMatch) {
      result.postalCode = postalCodeMatch[0];
    }
    
    // Extraer ciudad
    if (address.includes('Zamora de Hidalgo')) {
      result.city = 'Zamora de Hidalgo';
    } else if (address.includes('Zamora')) {
      result.city = 'Zamora';
    }
    
    // Extraer estado
    if (address.includes('Mich.') || address.includes('Michoacán')) {
      result.state = 'Michoacán';
    }
    
    // Extraer calle y número
    // Tomamos la primera parte hasta la primera coma
    const firstPart = address.split(',')[0];
    if (firstPart) {
      // Intentamos separar número de calle
      const matches = firstPart.match(/^(.+?)(\s+)(\d+)$/);
      if (matches) {
        result.street = matches[1].trim();
        result.number = matches[3];
      } else {
        result.street = firstPart.trim();
      }
    }
    
    return result;
  }
  
  /**
   * Convierte el string de horario a array de objetos Schedule
   */
  private parseScheduleString(scheduleStr: string): Schedule[] {
    if (!scheduleStr) return [];
    
    const days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[] = 
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const schedule: Schedule[] = [];
    
    // Mapeo español-inglés para los días
    const spanishDays = {
      'lunes': 'monday',
      'martes': 'tuesday',
      'miércoles': 'wednesday',
      'miercoles': 'wednesday',
      'jueves': 'thursday',
      'viernes': 'friday',
      'sábado': 'saturday',
      'sabado': 'saturday',
      'domingo': 'sunday'
    };
    
    // Inicializar todos los días como cerrados
    days.forEach(day => {
      schedule.push({
        day,
        open: false
      });
    });
    
    // Caso: "Lunes a Viernes 9:00 am - 10:00 PM"
    const weekdayPattern = /([a-zá-úñ]+)\s+a\s+([a-zá-úñ]+)\s+(\d{1,2}:\d{2}\s*[ap]m)\s*-\s*(\d{1,2}:\d{2}\s*[ap]m)/i;
    const weekdayMatch = scheduleStr.toLowerCase().match(weekdayPattern);
    
    if (weekdayMatch) {
      const startDay = spanishDays[weekdayMatch[1] as keyof typeof spanishDays] || weekdayMatch[1];
      const endDay = spanishDays[weekdayMatch[2] as keyof typeof spanishDays ] || weekdayMatch[2];
      const openTime = this.formatTime(weekdayMatch[3]);
      const closeTime = this.formatTime(weekdayMatch[4]);
      
      const startIndex = days.indexOf(startDay as any);
      const endIndex = days.indexOf(endDay as any);
      
      if (startIndex >= 0 && endIndex >= 0) {
        // Actualizar los días en el rango
        for (let i = startIndex; i <= endIndex; i++) {
          schedule[i] = {
            day: days[i],
            open: true,
            openTime,
            closeTime
          };
        }
      }
    }
    
    return schedule;
  }
  
  /**
   * Formatea la hora a un formato consistente "HH:MM"
   */
  private formatTime(timeStr: string): string {
    if (!timeStr) return '';
    
    // Convertir "9:00 am" a formato 24h "09:00"
    // Esta función podría ser mejorada para manejar mejor los formatos de hora
    timeStr = timeStr.toLowerCase().trim();
    
    // Extraer horas, minutos y AM/PM
    const timePattern = /(\d{1,2}):(\d{2})\s*([ap]m)/;
    const match = timeStr.match(timePattern);
    
    if (!match) return timeStr; // Devolver original si no coincide
    
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const isPm = match[3].includes('p');
    
    // Ajustar horas para formato 24h
    if (isPm && hours < 12) {
      hours += 12;
    } else if (!isPm && hours === 12) {
      hours = 0;
    }
    
    // Formatear con padding de ceros
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  /**
   * Crea un array de SocialLink a partir del objeto socialLinks del backend
   */
  private createSocialLinksArray(socialLinksObj: any): SocialLink[] {
    const result: SocialLink[] = [];
    
    if (!socialLinksObj) return result;
    
    // Facebook
    if (socialLinksObj.facebook) {
      result.push({
        platform: 'facebook',
        url: this.formatSocialUrl('facebook', socialLinksObj.facebook),
        icon: 'fa-facebook'
      });
    }
    
    // Instagram
    if (socialLinksObj.instagram) {
      result.push({
        platform: 'instagram',
        url: this.formatSocialUrl('instagram', socialLinksObj.instagram),
        icon: 'fa-instagram'
      });
    }
    
    // Twitter/X
    if (socialLinksObj.twitter) {
      result.push({
        platform: 'twitter',
        url: this.formatSocialUrl('twitter', socialLinksObj.twitter),
        icon: 'fa-twitter'
      });
    }
    
    // TikTok
    if (socialLinksObj.tiktok) {
      result.push({
        platform: 'tiktok',
        url: this.formatSocialUrl('tiktok', socialLinksObj.tiktok),
        icon: 'fa-tiktok'
      });
    }
    
    // Website
    if (socialLinksObj.website) {
      result.push({
        platform: 'website',
        url: this.formatWebsiteUrl(socialLinksObj.website),
        icon: 'fa-globe'
      });
    }
    
    return result;
  }
  
  /**
   * Formatea correctamente una URL de red social
   */
  private formatSocialUrl(platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok', username: string): string {
    if (!username) return '';
    
    // Eliminar @ si existe
    username = username.replace(/^@/, '');
    
    // URLs base para cada plataforma
    const baseUrls = {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      twitter: 'https://twitter.com/',
      tiktok: 'https://tiktok.com/@'
    };
    
    // Si ya es una URL completa, devolver como está
    if (username.startsWith('http://') || username.startsWith('https://')) {
      return username;
    }
    
    // Construir URL
    return baseUrls[platform] + username;
  }
  
  /**
   * Formatea una URL de sitio web
   */
  private formatWebsiteUrl(url: string): string {
    if (!url) return '';
    
    // Asegurarse de que tiene el protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    return url;
  }
  
  /**
   * Mapea el valor de priceRange del backend al formato del frontend
   */
  private mapPriceRange(priceRange: string): '$' | '$$' | '$$$' {
    if (!priceRange) return '$';
    
    switch (priceRange.toLowerCase()) {
      case 'economico':
      case 'económico':
        return '$';
      case 'moderado':
        return '$$';
      case 'caro':
      case 'premium':
        return '$$$';
      default:
        return '$';
    }
  }
}