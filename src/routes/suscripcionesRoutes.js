const express = require('express');
const router = express.Router();
const SuscripcionesController = require('../controllers/suscripcionesController');

// Suscribirse al newsletter
router.post('/api/suscripciones', SuscripcionesController.suscribir);

// Desuscribirse
router.post('/api/suscripciones/desuscribir', SuscripcionesController.desuscribir);

// Obtener todas (admin)
router.get('/api/suscripciones', SuscripcionesController.obtenerTodas);

module.exports = router;


