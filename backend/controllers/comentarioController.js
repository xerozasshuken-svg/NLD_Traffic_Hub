const pool = require('../db');

// Publicar un comentario en un reporte
const agregarComentario = async (req, res) =>{
    const{ reporte_id, texto} = req.body;
    const usuario_id = req.usuario.id;

    try{
        const nuevoComentario = await pool.query(
            'INSERT INTO comentarios (reporte_id, usuario_id, texto) VALUES ($1, $2, $3) RETURNING *',
            [reporte_id, usuario_id, texto]
        );

        res.status(201).json({
            mensaje: 'Comentario publicado con exito',
            comentario: nuevoComentario.rows[0]
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor al publicar el comentario');
    }
};

// Obtener todos los comentarios de un reporte en especifico
const obtenerComentariosDeReporte = async (req, res) =>{
    const{ reporteId} =req.params; // Lo leeremos de la URL: /api/comentarios/3

    try{
        // Hacemos JOIN con usuarios para saber el nombre de quien comento
        const comentarios = await pool.query(
            'SELECT c.*, u.nombre AS autor FROM comentarios c INNER JOIN usuarios u ON c.usuario_id = u.id WHERE c.reporte_id = $1 ORDER BY c.fecha_creacion ASC',
            [reporteId]
        );

        res.json(comentarios.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor al obtener los comentarios');
    }
};

module.exports = {
    agregarComentario,
    obtenerComentariosDeReporte
};

