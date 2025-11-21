# Configuración de Vercel Blob Storage

## 📋 Información sobre Vercel Blob

### ¿Es gratis?
**Sí, Vercel Blob tiene un tier gratuito:**
- **5 GB de almacenamiento** gratis por mes
- **100 GB de ancho de banda** gratis por mes
- Perfecto para proyectos pequeños/medianos

Para tu caso (aproximadamente 20 imágenes), el plan gratuito es más que suficiente.

---

## 🚀 Paso a Paso para Configurar Vercel Blob

### Paso 1: Instalar el SDK de Vercel Blob

En la terminal, desde la carpeta del proyecto:

```bash
npm install @vercel/blob
```

### Paso 2: Obtener el Token de Vercel Blob

1. Ve a tu cuenta de Vercel: https://vercel.com
2. Ve a **Settings** (Configuración) → **Storage** → **Blob**
3. Si no tienes un store creado, haz clic en **Create Store**
4. Nombra tu store (ej: `newsletter-images`)
5. Copia el **Token** que se genera (algo como: `vercel_blob_rw_xxxxx...`)

### Paso 3: Agregar Variable de Entorno

**En Vercel Dashboard:**
1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega una nueva variable:
   - **Name:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** El token que copiaste en el paso 2
   - **Environment:** Production, Preview, Development (marca todas)

**Localmente (archivo `.env`):**
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx...
```

### Paso 4: Crear Ruta API para Subir Imágenes

Crear el archivo: `src/routes/blobRoutes.js`

```javascript
const express = require('express');
const { put } = require('@vercel/blob');
const router = express.Router();

router.post('/api/upload-image', async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                error: 'No se proporcionó ninguna imagen'
            });
        }

        const file = req.files.image;
        
        // Validar tipo de archivo
        if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                error: 'El archivo debe ser una imagen'
            });
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                error: 'La imagen no puede ser mayor a 5MB'
            });
        }

        // Subir a Vercel Blob
        const blob = await put(file.name, file.data, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        res.json({
            success: true,
            url: blob.url
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({
            success: false,
            error: 'Error al subir la imagen'
        });
    }
});

module.exports = router;
```

### Paso 5: Instalar Multer para Manejar Archivos

```bash
npm install multer
```

### Paso 6: Actualizar app.js

Agregar la ruta de blob:

```javascript
const blobRoutes = require('./routes/blobRoutes');
app.use('/', blobRoutes);
```

Y configurar multer:

```javascript
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// En la ruta de blobRoutes, cambiar a:
router.post('/api/upload-image', upload.single('image'), async (req, res) => {
    // ... usar req.file en lugar de req.files.image
});
```

### Paso 7: Actualizar el Frontend

En lugar de convertir a base64, subir directamente a Vercel Blob:

```javascript
async function uploadAlcanceImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            return result.url; // URL de la imagen en Vercel Blob
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error al subir imagen:', error);
        alert('Error al subir la imagen');
        return null;
    }
}
```

### Paso 8: Actualizar la Base de Datos

Agregar la columna `alcance_imagen` a la tabla `functionalities`:

```sql
ALTER TABLE functionalities 
ADD COLUMN IF NOT EXISTS alcance_imagen TEXT;
```

---

## 🔄 Migración desde Base64 a Vercel Blob

Si ya tienes imágenes en base64 y quieres migrarlas:

1. Crear un script de migración que:
   - Lea las imágenes base64 de la BD
   - Las suba a Vercel Blob
   - Actualice la BD con las URLs

---

## 📝 Notas Importantes

1. **Sobrescribir proyecto existente en Vercel:**
   - Si ya tienes un proyecto en Vercel, simplemente conecta este repositorio
   - Vercel detectará los cambios y desplegará automáticamente
   - No necesitas "sobreescribir", solo conectar el repo

2. **Límites del plan gratuito:**
   - 5 GB de almacenamiento (suficiente para ~1000 imágenes de 5MB cada una)
   - 100 GB de ancho de banda mensual
   - Para 20 imágenes, estás muy por debajo del límite

3. **Ventajas de Vercel Blob:**
   - CDN global (imágenes se cargan rápido en todo el mundo)
   - Optimización automática
   - URLs públicas directas
   - No afecta el tamaño de tu base de datos

---

## 🎯 Resumen Rápido

1. `npm install @vercel/blob multer`
2. Crear store en Vercel Dashboard
3. Agregar `BLOB_READ_WRITE_TOKEN` a variables de entorno
4. Crear ruta `/api/upload-image`
5. Actualizar frontend para usar la nueva ruta
6. Agregar columna `alcance_imagen` a la BD
7. ¡Listo!

---

## ⚠️ Importante: Migración de Proyecto Existente

Si ya tienes un proyecto en Vercel y quieres "sobreescribirlo" con este:

1. **Opción A - Conectar Repositorio:**
   - En Vercel Dashboard, ve a tu proyecto
   - Settings → Git → Connect Repository
   - Selecciona este repositorio
   - Vercel desplegará automáticamente

2. **Opción B - Desplegar Manualmente:**
   - Instala Vercel CLI: `npm i -g vercel`
   - Desde la carpeta del proyecto: `vercel`
   - Sigue las instrucciones
   - Cuando pregunte si quieres sobrescribir, responde "Yes"

3. **Opción C - Eliminar y Recrear:**
   - Elimina el proyecto actual en Vercel
   - Crea uno nuevo conectando este repositorio

**Recomendación:** Usa la Opción A para mantener el historial y configuración.

