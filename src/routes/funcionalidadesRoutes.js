const express = require('express');
const router = express.Router();
const FuncionalidadesController = require('../controllers/funcionalidadesController');

// Rutas públicas (vistas)
router.get('/catalogo', FuncionalidadesController.mostrarCatalogo);
router.get('/newsletter', FuncionalidadesController.mostrarNewsletter);
router.get('/proximamente', FuncionalidadesController.mostrarProximamente);
router.get('/detalle/:slug', FuncionalidadesController.mostrarDetalle);

// Rutas API (ABM)
router.post('/api/funcionalidades', FuncionalidadesController.crear);
router.put('/api/funcionalidades/:id', FuncionalidadesController.actualizar);
router.delete('/api/funcionalidades/:id', FuncionalidadesController.eliminar);

// Ruta para sugerencias de búsqueda
router.get('/api/sugerencias', FuncionalidadesController.obtenerSugerencias);

// Ruta para verificar admin
router.post('/api/admin/verificar', FuncionalidadesController.verificarAdmin);

module.exports = router;

