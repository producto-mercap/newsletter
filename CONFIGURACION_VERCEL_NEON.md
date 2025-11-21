# 📋 Guía de Configuración: Newsletter Unitrade

Esta guía te ayudará a configurar el proyecto Newsletter en Vercel y Neon paso a paso.

---

## 🎯 Paso 1: Verificar Base de Datos en Neon

### 1.1 Conectar a Neon

Ya tienes la URL de conexión:
```
postgresql://neondb_owner:npg_IcZ3Mmd9VTuf@ep-odd-thunder-adg9pmsi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 1.2 Verificar Tablas Existentes

1. Ir a [Neon Console](https://console.neon.tech)
2. Seleccionar tu proyecto
3. Abrir el **SQL Editor**
4. Ejecutar:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('functionalities', 'newsletter_subscriptions');
```

### 1.3 Crear Tablas si No Existen

Si alguna tabla no existe, ejecutar el script `Database/01_create_tables.sql`:

1. Abrir el **SQL Editor** en Neon
2. Copiar y pegar el contenido completo de `Database/01_create_tables.sql`
3. Ejecutar el script
4. Verificar que las tablas se crearon correctamente

---

## 🚀 Paso 2: Configurar GitHub

### 2.1 Verificar Repositorio

**Pregunta importante**: ¿Ya tienes un repositorio de GitHub para este proyecto?

- **Si SÍ**: 
  - Anotar la URL completa (ej: `https://github.com/usuario/newsletter.git`)
  - Continuar al Paso 2.2

- **Si NO**:
  - Ir a [GitHub.com](https://github.com)
  - Click en "New repository" o "Crear repositorio"
  - Nombre: `newsletter` (o el que prefieras)
  - Descripción: "Newsletter web application for Unitrade"
  - Visibilidad: Público o Privado (según prefieras)
  - **NO** inicializar con README, .gitignore o licencia (ya los tenemos)
  - Click en "Create repository"
  - Anotar la URL completa del repositorio

### 2.2 Configurar Git Local

Abrir PowerShell en la carpeta del proyecto y ejecutar:

```powershell
cd C:\Users\pablo\Documentos\ProyectosCursor\Newsletter

# Verificar configuración de Git
git config user.name
git config user.email

# Si no están configurados, configurarlos:
git config user.name "Tu Nombre"
git config user.email "tu-email@ejemplo.com"
```

### 2.3 Inicializar Git y Primer Commit

```powershell
# Inicializar repositorio (si no está inicializado)
git init

# Agregar remote (reemplazar con tu URL)
git remote add origin https://github.com/USUARIO/newsletter.git

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "feat: inicializar proyecto Newsletter Unitrade"

# Push inicial
git push -u origin main
```

**Nota**: Si tu rama por defecto es `master` en lugar de `main`, usar:
```powershell
git push -u origin master
```

---

## 🌐 Paso 3: Configurar Vercel

### 3.1 Conectar Repositorio

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New Project"** o **"New Project"**
3. Si es la primera vez, conectar tu cuenta de GitHub
4. Seleccionar el repositorio `newsletter`
5. Vercel detectará automáticamente:
   - Framework Preset: **Other**
   - Root Directory: `./` (dejar por defecto)
   - Build Command: `npm run vercel-build` (ya configurado)
   - Output Directory: (dejar vacío, es serverless)

### 3.2 Configurar Variables de Entorno

Antes de hacer deploy, configurar variables de entorno:

1. En la pantalla de configuración del proyecto, ir a **"Environment Variables"**
2. Agregar las siguientes variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_IcZ3Mmd9VTuf@ep-odd-thunder-adg9pmsi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `NODE_ENV` | `production` |

3. Asegurarse de que estén marcadas para:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### 3.3 Hacer Deploy

1. Click en **"Deploy"**
2. Esperar a que Vercel construya y despliegue el proyecto
3. Una vez completado, Vercel te dará una URL (ej: `newsletter.vercel.app`)

### 3.4 Verificar Deploy

1. Abrir la URL proporcionada por Vercel
2. Verificar que la página carga correctamente
3. Probar las diferentes secciones:
   - `/` - Página de inicio
   - `/catalogo` - Catálogo
   - `/newsletter` - Newsletter
   - `/proximamente` - Próximamente

---

## 🔄 Paso 4: Actualizar Proyecto Existente (Si Aplicable)

Si ya tienes un proyecto Newsletter en Vercel y quieres sobreescribirlo:

### Opción A: Mismo Repositorio

1. Hacer push de los cambios a GitHub:
```powershell
git add .
git commit -m "feat: actualizar proyecto Newsletter"
git push
```

2. Vercel detectará automáticamente los cambios y redesplegará

### Opción B: Repositorio Diferente

1. En Vercel Dashboard, ir a Settings → General
2. Scroll hasta "Delete Project"
3. Eliminar el proyecto anterior
4. Crear nuevo proyecto siguiendo el Paso 3

---

## ✅ Paso 5: Verificación Final

### 5.1 Verificar Base de Datos

1. Probar crear una funcionalidad desde `/abm`
2. Verificar que se guarda en la base de datos
3. Verificar que aparece en `/catalogo`

### 5.2 Verificar Suscripciones

1. Probar el formulario de suscripción (botón "Suscribirse" en el header)
2. Verificar que se guarda en `newsletter_subscriptions`
3. Verificar que el email es único (intentar suscribirse dos veces con el mismo email)

### 5.3 Verificar Funcionalidades

- ✅ Búsqueda funciona
- ✅ Filtros funcionan
- ✅ Cambio de vista (tarjetas/lista) funciona
- ✅ Detalle de funcionalidad se muestra correctamente
- ✅ ABM permite crear, editar y eliminar

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Solución**:
1. Verificar que `DATABASE_URL` esté correctamente configurada en Vercel
2. Verificar que la URL incluya `?sslmode=require`
3. Verificar que las tablas existan en Neon

### Error: "Table does not exist"

**Solución**:
1. Ejecutar `Database/01_create_tables.sql` en el SQL Editor de Neon
2. Verificar que las tablas se crearon:
```sql
SELECT * FROM information_schema.tables WHERE table_schema = 'public';
```

### Error: "404 Not Found" en Vercel

**Solución**:
1. Verificar que `vercel.json` esté en la raíz del proyecto
2. Verificar que `src/app.js` exporte la app correctamente
3. Verificar los logs en Vercel Dashboard → Deployments → View Function Logs

### Estilos no se cargan

**Solución**:
1. Verificar que los archivos estén en `src/public/css/`
2. Verificar que `app.js` tenga: `app.use(express.static(...))`
3. Verificar la ruta en el HTML: `/css/main.css`

---

## 📞 Recursos Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Neon](https://neon.tech/docs)
- [Guía de conexión Neon + Vercel](https://neon.tech/docs/guides/vercel)
- [Express.js Documentation](https://expressjs.com/)

---

## 📝 Checklist Final

Antes de considerar el proyecto completamente configurado:

- [ ] Repositorio de GitHub creado y conectado
- [ ] Código subido a GitHub
- [ ] Proyecto conectado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Tablas creadas en Neon
- [ ] Deploy exitoso en Vercel
- [ ] Página principal carga correctamente
- [ ] Base de datos funciona (crear/leer funcionalidades)
- [ ] Formulario de suscripción funciona
- [ ] Búsqueda y filtros funcionan

---

¡Listo! Tu proyecto Newsletter Unitrade debería estar funcionando correctamente. 🎉


