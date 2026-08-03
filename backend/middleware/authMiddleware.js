const jwt = require('jsonwebtoken'); // <-- Importamos JWT
const JWT_SECRET = process.env.JWT_SECRET;

const verificarToken = (req, res, next) =>{

    // Obtener el token del encabezado "Authorization"
    const authHeader = req.header('Authorization');

    //Verificar si existe y si iicia con "Bearer"
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({mensaje: 'Acceso denegado. No se proporciono un token valido.'});
    }

    // Extraer el string puro del token
    const token = authHeader.split(' ')[1];

    try{
        // Verificar y descifrar el token
        const cifrado = jwt.verify(token, JWT_SECRET);

        // Inyectar los datos del usuario dentro del objeto de la peticion (req)
        req.usuario = cifrado;
        next();
    }
    catch (err) {
        res.status(401).json({mensaje: 'Token no valido o expirado'});
    }
};

module.exports = verificarToken;