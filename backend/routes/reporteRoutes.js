const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const verificarToken = require('../middleware/authMiddleware');


//Si publicar reporte require iniciar sesion si o si
router.post('/', verificarToken, reporteController.crearReporte);

// Ruta para ver todos los reportes: GET http://localhos:5000/api/reportes
router.get('/', reporteController.obtenerTodosLosReportes);

module.exports = router;