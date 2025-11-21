require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { pool } = require('./config/database');

const app = express();

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

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

