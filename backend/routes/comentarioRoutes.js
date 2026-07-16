const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const verificacion = require('../middleware/authMiddleware');
const verificarToken = require('../middleware/authMiddleware');

//Ruta para comentar: PROTEGIDA (necesario estar logueado)
router.post('/',verificarToken, comentarioController.agregarComentario);

//Ruta para ver cometnarios de un reporte: Publico
//Ejemplo: GET http//localhost:5000/api/comentarios/1

router.get('/:reporteId', comentarioController.obtenerComentariosDeReporte);

module.exports = router;