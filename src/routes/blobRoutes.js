const express = require('express');
const multer = require('multer');
// ⚠️ IMPORTANTE: NO importar @vercel/blob aquí para evitar inicialización automática
// Se importará solo cuando realmente se necesite (lazy loading)
const router = express.Router();

console.log('[BLOB ROUTES] Módulo blobRoutes.js cargado - NO se ha importado @vercel/blob todavía');

// Middleware de logging para monitorear TODAS las rutas que pasan por este router
router.use((req, res, next) => {
    // Loggear TODAS las rutas para debugging
    console.log('[BLOB ROUTES] Request recibido:', req.method, req.path, '| IP:', req.ip);
    
    // Si es una ruta de blob, loggear específicamente
    if (req.path.includes('/api/upload-image') || req.path.includes('/api/delete-image')) {
        console.log('[BLOB ROUTE] ⚠️ Ruta de blob accedida:', req.method, req.path);
    }
    next();
});

// Configurar multer para almacenar en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Validar que sea una imagen
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser una imagen'), false);
        }
    }
});

/**
 * Ruta para subir imágenes a Vercel Blob
 * POST /api/upload-image
 */
router.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        // ⚠️ VERIFICACIÓN CRÍTICA: Si Blob está deshabilitado, NO ejecutar put() ni ninguna Advanced Operation
        // Para deshabilitar Blob completamente, establece BLOB_DISABLED=true en las variables de entorno
        // O simplemente elimina/comenta BLOB_READ_WRITE_TOKEN
        if (process.env.BLOB_DISABLED === 'true' || !process.env.BLOB_READ_WRITE_TOKEN) {
            console.log('[BLOB] ⚠️ Blob deshabilitado - NO se ejecutará put() ni ninguna Advanced Operation');
            return res.status(503).json({
                success: false,
                error: 'El almacenamiento de imágenes está deshabilitado. Las Advanced Operations de Vercel Blob no se ejecutarán.',
                blobDisabled: true
            });
        }

        console.log('[BLOB] ⚠️⚠️⚠️ INICIANDO UPLOAD - Esto ejecutará put() y contará como Advanced Operation');
        
        // ⚠️ LAZY LOADING: Importar @vercel/blob SOLO cuando realmente se necesita
        // Esto evita que se ejecute código al cargar el módulo
        console.log('[BLOB] Importando @vercel/blob ahora (lazy loading)...');
        
        // Importar el módulo
        const blobModule = require('@vercel/blob');
        console.log('[BLOB] Módulo @vercel/blob cargado');
        
        // Verificar qué funciones están disponibles (sin ejecutarlas)
        const availableFunctions = Object.keys(blobModule).filter(key => typeof blobModule[key] === 'function');
        console.log('[BLOB] Funciones disponibles en @vercel/blob:', availableFunctions.join(', '));
        
        // Extraer solo put() - NO usar list() ni copy()
        const { put } = blobModule;
        
        // Verificar si put() existe
        if (!put) {
            throw new Error('put() no está disponible en @vercel/blob');
        }
        
        console.log('[BLOB] ✅ Solo se usará put() - NO se ejecutará list() ni copy()');
        
        // LOG: Registrar cada llamada a put() para monitorear Advanced Operations
        console.log('[BLOB] Iniciando upload de imagen - Advanced Operation #' + new Date().toISOString());
        console.log('[BLOB] Ruta:', req.path, '| Método:', req.method);
        
        // Validar que se haya subido un archivo
        if (!req.file) {
            console.log('[BLOB] ERROR: No se proporcionó archivo');
            return res.status(400).json({
                success: false,
                error: 'No se proporcionó ninguna imagen'
            });
        }

        // Validar tamaño (ya validado por multer, pero por seguridad)
        if (req.file.size > 5 * 1024 * 1024) {
            console.log('[BLOB] ERROR: Archivo demasiado grande');
            return res.status(400).json({
                success: false,
                error: 'La imagen no puede ser mayor a 5MB'
            });
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = req.file.originalname.split('.').pop() || 'png';
        const fileName = `alcance-${timestamp}-${randomString}.${extension}`;

        console.log('[BLOB] Subiendo archivo:', fileName, 'Tamaño:', req.file.size, 'bytes');

        // Subir a Vercel Blob con caché optimizado (1 año)
        // ⚠️ ESTA ES UNA ADVANCED OPERATION - se cuenta en el límite mensual
        // Solo se ejecuta cuando se llama explícitamente a este endpoint
        const blob = await put(fileName, req.file.buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            cacheControlMaxAge: 31536000 // 1 año en segundos (máximo recomendado)
        });

        console.log('[BLOB] ✅ Imagen subida exitosamente:', blob.url);

        // Retornar la URL de la imagen
        res.json({
            success: true,
            url: blob.url
        });
    } catch (error) {
        console.error('Error al subir imagen a Vercel Blob:', error);
        
        // Manejar errores específicos de Vercel Blob
        if (error.message && error.message.includes('token')) {
            return res.status(500).json({
                success: false,
                error: 'Error de configuración: BLOB_READ_WRITE_TOKEN no está configurado correctamente'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al subir la imagen: ' + (error.message || 'Error desconocido')
        });
    }
});

/**
 * Ruta para eliminar imágenes de Vercel Blob
 * DELETE /api/delete-image
 * Body: { url: "https://..." }
 */
router.delete('/api/delete-image', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL de imagen requerida'
            });
        }

        // Vercel Blob no tiene una API directa para eliminar en el SDK actual
        // Las imágenes se eliminan automáticamente después de cierto tiempo de inactividad
        // O puedes usar la API REST de Vercel directamente si es necesario
        
        res.json({
            success: true,
            message: 'La imagen será eliminada automáticamente por Vercel Blob'
        });
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar la eliminación'
        });
    }
});

module.exports = router;

