const pool = require('../db');
const { report } = require('../routes/authRoutes');

//  Crear un nuevo reporte vial
const crearReporte = async (req, res) => {
     // "usuario_id" viene desde el token gracias al middleware
    const usuario_id = req.usuario.id
    const {tipo, ubicacion, descripcion, imagen_url} = req.body;

    try{
        const nuevoReporte = await pool.query(
            'INSERT INTO reportes (usuario_id, tipo, ubicacion, descripcion, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [usuario_id, tipo, ubicacion, descripcion, imagen_url]
        );

        res.status(201).json({
            mensaje: 'Reporte vial creado con exito',
            reporte: nuevoReporte.rows[0]
        });
    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor al crear el reporte');
    }    
};

// Obtener todos los reportes (feed principal)

const obtenerTodosLosReportes = async (req, res) =>{

    try{
        const reportes = await pool.query(
            'SELECT r.*, u.nombre AS creador_por FROM reportes r INNER JOIN usuarios u ON r.usuario_id = u.id ORDER BY r.fecha DESC'
        );
        
        res.json(reportes.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor al obtener los reportes');
    }
};

module.exports = {
    crearReporte,
    obtenerTodosLosReportes
};