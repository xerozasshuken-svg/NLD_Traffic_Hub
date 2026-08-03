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

const obtenerReportesPorId = async (req, res) =>{
    const { id } = req.params;

    try {
        const resultado = await pool.query(
            `SELECT r.*,
                COALESCE(u.nombre, 'Ciudadano') AS creado_por,
                u.correo AS correo_usuario
            FROM reportes r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.id = $1`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({mensaje: 'Reporte o encontrado'});
        }

        res.json(resultado.rows[0]);
    }
    catch (err) {
        console.error("Error al obtener el reporte: ", err.message);
        res.status(500).send('Error en el servidor al obteer el reporte');
    }
};

//Cambiar el estado del reporte a aprobado
const aprobarReporte = async (req,res) =>{
    const { id } = req.params;
    try {
        const resultado = await pool.query(
            "UPDATE reportes SET estado = 'aprobado' WHERE id = $1 RETURNING *",
            [id]
        );
        if (resultado.rows.length === [0]) {
            return res.status(404).json({ mensaje: 'Reporte no encontrado'});
        }
        res.json({ mensaje: 'Rerpote aprobado con exito', reporte: resultado.rows[0] });
    }
    catch (err) {
        console.error("Error al aprobar reporte: ", err.message);
        res.status(500).send('Error en el servidor al aprobar reporte');
    }
};

//Cambiar el estado del reporte a rechazado
const rechazarReporte = async (req, res) =>{
    const{id} = req.Params;
    try {
        const resultado = await pool.query(
            "UPDATE reportes SET estado = 'rechazado' WHERE id = $1 RETURNING *",
            [id] 
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Reporte no encotnrado'});
        }
        res.json({ mensaje: 'Reporte rechazado con exito', reporte: resultado.rows[0] });
    } catch (err) {
        console.error("Error al rechazar reporte:", err.message);
        res.status(500).send('Error en el servidor al rechazar reporte');
    }
};

//Eliminar el reporte permanentemente
const eliminarReporte = async (req, res) =>{
    const { id } = req.params;
    try {
        const resultado = await pool.query("DELETE FROM reportes WHERE id = $1 RETURNING *", [id]);
        if(resultado.rows.length === 0){
            return res.status(404).json({mensaje: 'Reporte no encontrado'});
        }
        res.json({mensaje: 'Reporte eliminado con exito'});
    }
    catch (err) {
        console.error("Error al eliminar reporte:", err.message);
        res.status(500).send('Error en el servidor al eliminar reporte');
    }
};

module.exports = {
    crearReporte,
    obtenerTodosLosReportes,
    obtenerReportesPorId,
    aprobarReporte,
    rechazarReporte,
    eliminarReporte

};