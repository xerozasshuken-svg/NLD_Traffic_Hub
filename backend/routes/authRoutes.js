/*este archivo definirá la URL (endpoint) que el frontend llamará para registrarse.*/

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para el registro: POST http://localhost:5000/api/auth/registrar
router.post('/registrar', authController.registrarUsuario);

router.post('/login', authController.loginUsuario);
module.exports = router;