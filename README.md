# Menu-UPP Social

Plataforma social gastronómica construida con Angular. Este proyecto transforma un sistema administrativo de menús digitales en una experiencia social completa centrada en la gastronomía.

## Características

- **Perfiles de Restaurantes**: Página de perfil completa con menú, reseñas e información.
- **Perfiles de Usuarios**: Actividad social, rutas creadas y pasaporte gastronómico.
- **Feed Social**: Actividades de usuarios, restaurantes en tendencia y platos populares.
- **Gamificación**: Pasaporte gastronómico con insignias y rutas a completar.
- **Sistema de Valoraciones**: Calificaciones y reseñas para platillos y restaurantes.

## Stack Tecnológico

- **Framework**: Angular 19+ con enfoque standalone
- **Estilos**: SCSS con patrón 7-1
- **Estado**: Signals de Angular
- **Iconografía**: Font Awesome 6
- **Responsive**: Mobile-first
- **Datos**: Mocks para desarrollo inicial

## Prerrequisitos

- Node.js (v18+)
- npm (v9+)
- Angular CLI (v19+)

## Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/menu-upp-social.git
   cd menu-upp-social
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   ng serve
   ```

4. **Acceder a la aplicación**:
   Abrir http://localhost:4200 en tu navegador

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                # Servicios core, interceptors, guards
│   ├── shared/              # Elementos compartidos entre módulos
│   ├── features/            # Módulos principales por característica
│   │   ├── public/          # Páginas públicas (landing, login, registro)
│   │   ├── app/             # Funcionalidad principal autenticada 
│   │   └── profiles/        # Perfiles públicos (restaurantes/usuarios)
│   └── layout/              # Layouts principales de la aplicación
├── assets/                  # Recursos estáticos
└── styles/                  # SCSS global (patrón 7-1)
```

## Secciones Principales

### Explorar (Feed)

- **URL**: `/app/explore`
- **Descripción**: Feed de actividades recientes, restaurantes en tendencia, platillos populares

### Perfiles de Restaurante

- **URL**: `/profile/:username`
- **Subsecciones**: Inicio, Menú, Información, Reseñas
- **Descripción**: Visualización completa de un restaurante

### Perfiles de Usuario

- **URL**: `/profile/:username`
- **Subsecciones**: Actividad, Rutas, Favoritos
- **Descripción**: Perfil social de un usuario

### Pasaporte Gastronómico

- **URL**: `/app/passport`
- **Descripción**: Gamificación con logros, insignias y estadísticas

## Desarrollo

### Convenciones de Código

- Utilizar componentes standalone
- Lazy loading para todas las rutas
- Usar signals para estado local y global
- Seguir estructura de carpetas definida

### Comandos Útiles

- **Generar componente**:
  ```bash
  ng generate component shared/components/nombre-componente --standalone
  ```

- **Generar servicio**:
  ```bash
  ng generate service core/services/nombre-servicio
  ```

- **Generar interfaz**:
  ```bash
  ng generate interface core/models/nombre-modelo
  ```

## Notas sobre los Datos Mock

El proyecto utiliza datos mock para desarrollo. Los archivos JSON se encuentran en:

```
assets/mocks/
├── users.json              # Usuarios y perfiles
├── restaurants.json        # Restaurantes con detalles
├── dishes.json             # Platillos con valoraciones
├── activities.json         # Actividades sociales
├── routes.json             # Rutas gastronómicas
├── badges.json             # Insignias y logros
└── categories.json         # Categorías de platillos
```

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).