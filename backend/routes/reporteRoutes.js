const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const verificarToken = require('../middleware/authMiddleware');

// Ruta para crear reporte: PROTEGIDA con el middleware
// Ahora la petición primero pasa por verificarToken, y si todo está bien, va a crearReporte
router.post('/', verificarToken, reporteController.crearReporte);

// Ruta para ver todos los reportes: GET http://localhos:5000/api/reportes
router.get('/', reporteController.obtenerTodosLosReportes);

module.exports = router;