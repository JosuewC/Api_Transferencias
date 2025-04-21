const express = require('express');
const dotenv = require('dotenv');
dotenv.config();  // Cargar las variables de entorno desde .env

const app = express();
const conexionRoutes = require('./routes/conexion');  // Importar las rutas

// Middleware para analizar solicitudes con JSON
app.use(express.json());

// Usar las rutas importadas
app.use(conexionRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
