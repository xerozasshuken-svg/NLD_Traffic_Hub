const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const JWT_SECRET = process.env.JWT_SECRET;

// 1. FUNCIÓN DE REGISTRO (La que ya tenías)
const registrarUsuario = async (req, res) => {
  const { nombre, correo, password } = req.body;
  try {

    if (!password) {
      return res.status(400).json({ mensaje: 'La contraseña es requerida.' });
    }

    const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
    }
    const saltRounds = 10;
    const passwordEncriptada = await bcrypt.hash(String(password), saltRounds);

    const nuevoUsuario = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id, nombre, correo, fecha_creacion',
      [nombre, correo, passwordEncriptada]
    );
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al registrar el usuario');
  }
};

//Login usuarios
const loginUsuario = async (req, res) => {
  const { correo, password } = req.body;

  try {
    //Vlidar los campos
    if (!correo || !password) {
      return res.status(400).json({mensaje: 'El correo y la contraseña on requeridos'});
    }
    //Buscar al usuario por correo
    const resultado = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    
    if (resultado.rows.length === 0) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas (correo o contraseña incorrectos).' });
    }

    const usuario = resultado.rows[0];

    //Validar que el usuario tenga un hash de contraseña
    if (!usuario.password) {
      return res.status(500).json({ mensaje: 'Error interno: El usuario en la base de datos no tiene una contraseña registrada.' });
    }

    // Comparar la contraseña ingresada con el hash guardado en la BD
    const passwordCorrecta = await bcrypt.compare(String(password), String(usuario.password));
    
    if (!passwordCorrecta) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas (correo o contraseña incorrectos).' });
    }

    // C. Si todo es correcto, generar el Token JWT
    // Guardamos el ID del usuario dentro del token para saber quién es después
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre }, 
      JWT_SECRET, 
      { expiresIn: '2h' } // El token expira en 2 horas
    );

    // D. Responder al cliente enviando sus datos básicos y el TOKEN
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al iniciar sesión');
  }
};

// Exportamos ambas funciones
module.exports = {
  registrarUsuario,
  loginUsuario,
};