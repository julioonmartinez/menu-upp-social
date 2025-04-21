import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

/**
 * Landing Page - Página de inicio pública
 * 
 * Presenta la plataforma Menu-UPP Social y sus principales características
 * para atraer nuevos usuarios.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  // Características destacadas de la plataforma
  features = [
    {
      icon: 'fa-route',
      title: 'Rutas Gastronómicas',
      description: 'Descubre y comparte rutas culinarias. Visita restaurantes seleccionados y prueba los mejores platos de cada lugar.'
    },
    {
      icon: 'fa-passport',
      title: 'Pasaporte Gastronómico',
      description: 'Colecciona sellos y cumple desafíos mientras exploras diferentes cocinas. Conviértete en un verdadero experto culinario.'
    },
    {
      icon: 'fa-users',
      title: 'Comunidad Foodie',
      description: 'Conecta con otros amantes de la gastronomía, comparte tus experiencias y descubre recomendaciones personalizadas.'
    },
    {
      icon: 'fa-star',
      title: 'Reseñas y Valoraciones',
      description: 'Califica los restaurantes y platos que pruebas. Ayuda a otros a encontrar las mejores opciones en cada ciudad.'
    }
  ];
  
  // Testimonios de usuarios
  testimonials = [
    {
      quote: "Menu-UPP ha cambiado completamente mi forma de explorar restaurantes. Las rutas gastronómicas son increíbles para descubrir joyas ocultas.",
      author: "María López",
      role: "Foodie entusiasta",
      image: "assets/images/users/profile1.jpg"
    },
    {
      quote: "Como chef, valoro mucho poder conectar con clientes apasionados por la gastronomía. La plataforma nos ayuda a destacar nuestros mejores platos.",
      author: "Carlos García",
      role: "Chef y propietario",
      image: "assets/images/users/profile2.jpg"
    },
    {
      quote: "El pasaporte gastronómico es adictivo. Me encanta coleccionar sellos y descubrir nuevos sabores que nunca habría probado por mi cuenta.",
      author: "Ana Martínez",
      role: "Aventurera culinaria",
      image: "assets/images/users/profile3.jpg"
    }
  ];
  
  // Métricas de la plataforma
  stats = [
    { value: '2,500+', label: 'Restaurantes' },
    { value: '15,000+', label: 'Usuarios activos' },
    { value: '850+', label: 'Rutas creadas' },
    { value: '45,000+', label: 'Reseñas' }
  ];
}