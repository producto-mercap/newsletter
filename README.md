# Newsletter Unitrade

Aplicación web para el newsletter del producto Unitrade, permitiendo gestionar y visualizar funcionalidades del catálogo, newsletter y próximas funcionalidades.

## 📋 Descripción

Esta aplicación permite:
- **Catálogo**: Visualizar funcionalidades productivas organizadas por categorías (Operatorias, Backoffice, Market Data, Valuación y Contabilidad, Reportes/Interfaces)
- **Newsletter**: Ver funcionalidades recientemente desplegadas
- **Próximamente**: Explorar funcionalidades en análisis y desarrollo
- **ABM**: Administrar funcionalidades (crear, editar, eliminar)
- **Suscripciones**: Formulario para suscribirse al newsletter

## 🚀 Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL (Neon)
- **Vistas**: EJS
- **Estilos**: CSS personalizado (estilo Google/Mercap)
- **Hosting**: Vercel

## 📁 Estructura del Proyecto

```
Newsletter/
├── src/
│   ├── app.js                 # Entrada principal
│   ├── config/
│   │   └── database.js        # Configuración de base de datos
│   ├── controllers/
│   │   ├── funcionalidadesController.js
│   │   ├── suscripcionesController.js
│   │   └── indexController.js
│   ├── models/
│   │   ├── FunctionalityModel.js
│   │   └── NewsletterSubscriptionModel.js
│   ├── routes/
│   │   ├── indexRoutes.js
│   │   ├── funcionalidadesRoutes.js
│   │   └── suscripcionesRoutes.js
│   ├── public/
│   │   ├── css/
│   │   │   └── main.css
│   │   ├── js/
│   │   │   └── main.js
│   │   └── images/
│   │       └── logo.png
│   └── views/
│       ├── layouts/
│       │   └── main.ejs
│       ├── partials/
│       │   ├── header.ejs
│       │   └── footer.ejs
│       └── pages/
│           ├── home.ejs
│           ├── catalogo.ejs
│           ├── newsletter.ejs
│           ├── proximamente.ejs
│           ├── detalle.ejs
│           ├── abm.ejs
│           ├── 404.ejs
│           └── error.ejs
├── Database/
│   ├── 01_create_tables.sql
│   └── 02_sample_data.sql
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

## 🔧 Instalación

1. **Clonar el repositorio** (o navegar a la carpeta del proyecto):
```bash
cd Newsletter
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Editar `.env` y configurar:
```env
DATABASE_URL=postgresql://usuario:password@host.neon.tech/database?sslmode=require
PORT=3000
NODE_ENV=development
```

4. **Configurar base de datos**:
   - Conectar a Neon usando la URL proporcionada
   - Ejecutar los scripts en `Database/01_create_tables.sql` (si las tablas no existen)
   - Opcional: Ejecutar `Database/02_sample_data.sql` para datos de prueba

5. **Ejecutar en desarrollo**:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📊 Base de Datos

### Tabla: `functionalities`
- `id` (UUID): Identificador único
- `title` (TEXT): Título de la funcionalidad
- `description` (TEXT): Descripción detallada
- `icon` (TEXT): URL o emoji del ícono
- `section` (TEXT): Categoría (Operatorias, Backoffice, Market Data, etc.)
- `pdf_url` (TEXT): URL del PDF de documentación
- `type` (VARCHAR): Tipo (catalogo, newsletter, proximamente)
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de actualización

### Tabla: `newsletter_subscriptions`
- `id` (SERIAL): Identificador único
- `name` (VARCHAR): Nombre del suscriptor
- `email` (VARCHAR): Email (único)
- `bank_entity` (VARCHAR): Entidad bancaria
- `is_active` (BOOLEAN): Estado de la suscripción
- `subscribed_at` (TIMESTAMP): Fecha de suscripción
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de actualización

## 🌐 Deploy en Vercel

### Configuración Inicial

1. **Conectar repositorio de GitHub a Vercel**:
   - Ir a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click en "Add New Project"
   - Seleccionar el repositorio `Newsletter`
   - Vercel detectará automáticamente la configuración

2. **Configurar variables de entorno en Vercel**:
   - En el proyecto de Vercel, ir a Settings → Environment Variables
   - Agregar:
     - `DATABASE_URL`: URL completa de conexión a Neon
     - `NODE_ENV`: `production`

3. **Verificar configuración**:
   - El archivo `vercel.json` ya está configurado
   - El build command es: `npm run vercel-build`
   - El output directory no es necesario (serverless)

### Actualizar Proyecto Existente

Si ya tienes un proyecto Newsletter en Vercel:

1. **Conectar el nuevo código**:
   - Si el repositorio ya está conectado, hacer push a GitHub
   - Vercel desplegará automáticamente

2. **Si necesitas sobreescribir completamente**:
   - Opción A: Eliminar el proyecto en Vercel y crear uno nuevo
   - Opción B: Hacer push forzado (si es el mismo repositorio)

3. **Verificar variables de entorno**:
   - Asegurarse de que `DATABASE_URL` esté configurada correctamente
   - Verificar que apunte a la base de datos correcta en Neon

## 🔗 Configuración de Neon

### URL de Conexión

La URL de conexión debe obtenerse desde Neon Console:
```
postgresql://usuario:password@host.neon.tech/database?sslmode=require
```

**⚠️ IMPORTANTE**: Reemplazar `usuario`, `password`, `host` y `database` con tus credenciales reales de Neon.

### Verificar Tablas

Para verificar que las tablas existen:
```sql
-- Conectar a Neon usando psql o el SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Ejecutar Scripts de Adecuación

1. **Desde el SQL Editor de Neon**:
   - Ir a tu proyecto en Neon
   - Abrir el SQL Editor
   - Copiar y pegar el contenido de `Database/01_create_tables.sql`
   - Ejecutar

2. **Desde línea de comandos** (si tienes psql):
```bash
psql "postgresql://usuario:password@host.neon.tech/database?sslmode=require" -f Database/01_create_tables.sql
```

**⚠️ IMPORTANTE**: Reemplazar con tu URL de conexión real de Neon.

## 📝 Rutas Principales

- `/` - Página de inicio
- `/catalogo` - Catálogo de funcionalidades
- `/newsletter` - Funcionalidades recientes
- `/proximamente` - Funcionalidades en desarrollo
- `/detalle/:id` - Detalle de una funcionalidad
- `/abm` - Administración de funcionalidades

### API Endpoints

- `POST /api/funcionalidades` - Crear funcionalidad
- `PUT /api/funcionalidades/:id` - Actualizar funcionalidad
- `DELETE /api/funcionalidades/:id` - Eliminar funcionalidad
- `POST /api/suscripciones` - Suscribirse al newsletter
- `POST /api/suscripciones/desuscribir` - Desuscribirse
- `GET /api/suscripciones` - Obtener todas las suscripciones (admin)

## 🎨 Características

- **Vista de tarjetas y lista**: Toggle entre vistas
- **Búsqueda**: Buscar funcionalidades por título o descripción
- **Filtros**: Filtrar por sección en el catálogo
- **Responsive**: Diseño adaptativo para móviles
- **Estilo Google/Mercap**: Interfaz minimalista y moderna

## 🐛 Solución de Problemas

### Error de conexión a base de datos
- Verificar que `DATABASE_URL` esté correctamente configurada
- Verificar que la URL incluya `?sslmode=require`
- Comprobar que las tablas existan en Neon

### Error 404 en Vercel
- Verificar que `vercel.json` esté configurado correctamente
- Asegurarse de que `src/app.js` exporte la app correctamente

### Estilos no se cargan
- Verificar que los archivos estáticos estén en `src/public/`
- Verificar la ruta en `app.js`: `app.use(express.static(...))`

## 📞 Soporte

Para más información, consultar la documentación de:
- [Express.js](https://expressjs.com/)
- [Vercel](https://vercel.com/docs)
- [Neon](https://neon.tech/docs)


