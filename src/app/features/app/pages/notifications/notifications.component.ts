import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

/**
 * Interfaz para el modelo de notificación
 */
interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'achievement' | 'system';
  content: string;
  fromUser?: {
    id: string;
    name: string;
    username: string;
    image: string;
  };
  targetId?: string;
  targetType?: 'dish' | 'restaurant' | 'review' | 'route' | 'user';
  targetName?: string;
  read: boolean;
  createdAt: Date;
}

/**
 * Componente para la página de notificaciones
 * 
 * Muestra las diferentes notificaciones del usuario como likes,
 * comentarios, seguidores, menciones, logros, etc.
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  // Notificaciones
  notifications = signal<Notification[]>([]);
  
  // Estado de carga
  isLoading = signal<boolean>(true);
  
  ngOnInit(): void {
    // Simular carga de notificaciones
    setTimeout(() => {
      this.notifications.set(this.getMockNotifications());
      this.isLoading.set(false);
    }, 800);
  }
  
  /**
   * Marcar una notificación como leída
   */
  markAsRead(notificationId: string): void {
    const updatedNotifications = this.notifications().map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    this.notifications.set(updatedNotifications);
  }
  
  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): void {
    const updatedNotifications = this.notifications().map(notification => ({
      ...notification,
      read: true
    }));
    
    this.notifications.set(updatedNotifications);
  }
  
  /**
   * Eliminar una notificación
   */
  removeNotification(notificationId: string): void {
    const updatedNotifications = this.notifications().filter(
      notification => notification.id !== notificationId
    );
    
    this.notifications.set(updatedNotifications);
  }
  
  /**
   * Obtiene la ruta para una notificación según su tipo y target
   */
  getNotificationRoute(notification: Notification): string[] {
    if (!notification.targetType || !notification.targetId) {
      return ['/app/explore'];
    }
    
    switch (notification.targetType) {
      case 'dish':
        return ['/profile', notification.fromUser?.username || '', 'dish', notification.targetId];
      case 'restaurant':
        return ['/profile', notification.targetId];
      case 'review':
        return ['/profile', notification.fromUser?.username || '', 'reviews'];
      case 'route':
        return ['/app/routes', notification.targetId];
      case 'user':
        return ['/profile', notification.targetId];
      default:
        return ['/app/explore'];
    }
  }
  
  /**
   * Obtiene el icono para una notificación según su tipo
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'like': return 'fa-solid fa-heart';
      case 'comment': return 'fa-solid fa-comment';
      case 'follow': return 'fa-solid fa-user-plus';
      case 'mention': return 'fa-solid fa-at';
      case 'achievement': return 'fa-solid fa-award';
      case 'system': return 'fa-solid fa-bell';
      default: return 'fa-solid fa-bell';
    }
  }
  
  /**
   * Formatea la fecha de la notificación en formato amigable
   */
  formatNotificationDate(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return notificationDate.toLocaleDateString();
  }
  
  /**
   * Obtiene el color de fondo según el tipo de notificación
   */
  getNotificationColor(type: string): string {
    switch (type) {
      case 'like': return 'notification-like';
      case 'comment': return 'notification-comment';
      case 'follow': return 'notification-follow';
      case 'mention': return 'notification-mention';
      case 'achievement': return 'notification-achievement';
      case 'system': return 'notification-system';
      default: return '';
    }
  }
  
  /**
   * Comprueba si hay notificaciones no leídas
   */
  hasUnreadNotifications(): boolean {
    return this.notifications().some(notification => !notification.read);
  }
  
  /**
   * Cuenta las notificaciones no leídas
   */
  getUnreadCount(): number {
    return this.notifications().filter(notification => !notification.read).length;
  }
  
  /**
   * Obtiene datos de notificaciones para demostración
   */
  private getMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        type: 'like',
        content: 'le ha dado me gusta a tu reseña de',
        fromUser: {
          id: 'user2',
          name: 'Carlos García',
          username: 'carlos_chef',
          image: 'assets/images/users/profile2.jpg'
        },
        targetId: 'dish1',
        targetType: 'dish',
        targetName: 'Croquetas caseras de jamón ibérico',
        read: false,
        createdAt: new Date(Date.now() - 15 * 60000) // 15 minutos atrás
      },
      {
        id: '2',
        type: 'follow',
        content: 'ha comenzado a seguirte',
        fromUser: {
          id: 'user3',
          name: 'Ana Martínez',
          username: 'ana_foodlover',
          image: 'assets/images/users/profile3.jpg'
        },
        targetId: 'user1',
        targetType: 'user',
        read: false,
        createdAt: new Date(Date.now() - 3 * 3600000) // 3 horas atrás
      },
      {
        id: '3',
        type: 'comment',
        content: 'ha comentado en tu reseña de',
        fromUser: {
          id: 'user2',
          name: 'Carlos García',
          username: 'carlos_chef',
          image: 'assets/images/users/profile2.jpg'
        },
        targetId: 'dish1',
        targetType: 'dish',
        targetName: 'Croquetas caseras de jamón ibérico',
        read: true,
        createdAt: new Date(Date.now() - 1 * 86400000) // 1 día atrás
      },
      {
        id: '4',
        type: 'achievement',
        content: '¡Has ganado una nueva insignia!',
        targetId: 'badge2',
        targetType: 'user',
        targetName: 'Crítico Culinario',
        read: false,
        createdAt: new Date(Date.now() - 2 * 86400000) // 2 días atrás
      },
      {
        id: '5',
        type: 'mention',
        content: 'te ha mencionado en un comentario',
        fromUser: {
          id: 'user3',
          name: 'Ana Martínez',
          username: 'ana_foodlover',
          image: 'assets/images/users/profile3.jpg'
        },
        targetId: 'dish11',
        targetType: 'dish',
        targetName: 'Nigiri de salmón',
        read: true,
        createdAt: new Date(Date.now() - 4 * 86400000) // 4 días atrás
      },
      {
        id: '6',
        type: 'system',
        content: 'Bienvenido a MenuUPP Social. ¡Explora y disfruta!',
        read: true,
        createdAt: new Date(Date.now() - 7 * 86400000) // 7 días atrás
      }
    ];
  }
}