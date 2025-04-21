const mysql = require('mysql2');
require('dotenv').config();  // Cargar las variables de entorno desde .env

const connection = mysql.createConnection({
    host: process.env.BDHOST,        // Tu host
    user: process.env.BDUSER,        // Tu usuario de base de datos
    password: process.env.BDPASS,    // Tu contraseña de base de datos
    database: process.env.BDNAME,    // Nombre de la base de datos
    port: process.env.BDPORT || 3306 // Puerto (si no lo defines, usa el 3306 por defecto)
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos exitosa');
});

module.exports = connection;
