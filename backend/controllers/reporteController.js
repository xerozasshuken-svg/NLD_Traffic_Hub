const pool = require('../db');

//  Crear un nuevo reporte vial
const crearReporte = async (req, res) => {
     // "usuario_id" viene desde el token gracias al middleware
    const usuario_id = req.usuario.id ? req.usuario.id : null;

    const {categoria, ubicacion, descripcion, imagen_url, estado} = req.body;

    const estadoReporte = estado || 'aprobado';

    try{
        const nuevoReporte = await pool.query(
            `INSERT INTO reportes (usuario_id, categoria, ubicacion, descripcion, imagen_url, estado, fecha_creacion)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *`,
            [usuario_id, categoria, ubicacion, descripcion, imagen_url, estadoReporte]
        );

        res.status(201).json({
            mensaje: 'Reporte creado con exito',
            reporte: nuevoReporte.rows[0]
        });
    } 
    catch (err) {
        console.error("Error al insertar el reporte en PostgreSQL", err.message);
        res.status(500).send('Error en el servidor al crear el reporte');
    }    
};

// Obtener todos los reportes (feed principal)

const obtenerTodosLosReportes = async (req, res) =>{

    try{
        const reportes = await pool.query(
            `SELECT r.*,
                COALESCE(u.nombre, 'Ciudadano') AS creado_por
            FROM reportes r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.fecha_creacion DESC`
        );
        
        res.json(reportes.rows);
    }
    catch (err) {
        console.error("Error al obtener reportes:", err.message);
        res.status(500).send('Error en el servidor al obtener los reportes');
    }
};

module.exports = {
    crearReporte,
    obtenerTodosLosReportes
};