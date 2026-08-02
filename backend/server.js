require('dotenv').config();
const express = require('express');
const path = require('path')
const cors = require('cors');
const pool = require('./db');
// Direcciones de controladores de rutas
const authRoutes = require('./routes/authRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');


const app = express();
const PORT = process.eventNames.PORT || 5000;

app.use(cors());
app.use(express.json({limit: '10mb'}));

app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Ruta de prueba de la base de datos
app.get('/api/prueba-bd', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ mensaje: "¡Conexión exitosa al Backend y a PostgreSQL!", horaServidor: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error conectando a la base de datos");
  }
});

// Enlazar las rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/comentarios',comentarioRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'panel_reportes.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});