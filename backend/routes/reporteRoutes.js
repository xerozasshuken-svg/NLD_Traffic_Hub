const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

//Middleware
const verificarToken = require('../middleware/authMiddleware');
const esAdminMiddleware = require('../middleware/esAdminMiddleware');

//Rustas publicas

// Ruta para ver todos los reportes
router.get('/', reporteController.obtenerTodosLosReportes);

//Ver un reporte especifico por su Id
router.get('/:id', reporteController.obtenerReportesPorId);

//Crear reporte (Requiere iiciar sesion)
router.post('/', verificarToken, reporteController.crearReporte);

//Rutas de admin

//Aprobar reporte
router.put('/:id/aprobar', [verificarToken, esAdminMiddleware], reporteController.aprobarReporte);

//Rechazar reporte
router.put('/:id/rechazar', [verificarToken, esAdminMiddleware], reporteController.rechazarReporte);

//Eliminar reporte
router.delete('/:id', [verificarToken, esAdminMiddleware], reporteController.eliminarReporte);

module.exports = router;