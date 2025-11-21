require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { pool } = require('./config/database');

const app = express();

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos con caché optimizado
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 31536000000, // 1 año en milisegundos
    etag: true,
    lastModified: true
}));

// Middleware para parsear JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rutas
// Redirigir / a /newsletter
app.get('/', (req, res) => {
    res.redirect('/newsletter');
});

app.use('/', require('./routes/funcionalidadesRoutes'));
app.use('/', require('./routes/suscripcionesRoutes'));

// ⚠️ IMPORTANTE: blobRoutes solo se carga cuando se necesita, no hace nada al importarse
// Las Advanced Operations solo se ejecutan cuando se llama explícitamente a /api/upload-image
// Para deshabilitar completamente Blob y evitar Advanced Operations:
// 1. Establece BLOB_DISABLED=true en las variables de entorno, O
// 2. Elimina/comenta BLOB_READ_WRITE_TOKEN en las variables de entorno
console.log('[APP] Cargando blobRoutes...');
if (process.env.BLOB_DISABLED === 'true' || !process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('[APP] ⚠️ Blob deshabilitado - NO se cargarán rutas de Blob (evita Advanced Operations)');
} else {
    const blobRoutes = require('./routes/blobRoutes');
    console.log('[APP] blobRoutes cargado (sin ejecutar código de @vercel/blob)');
    app.use('/', blobRoutes);
}

// Ruta 404
app.use((req, res) => {
    res.status(404).render('pages/404');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).render('pages/error', {
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : null
    });
});

// Iniciar servidor solo si no estamos en Vercel
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;

