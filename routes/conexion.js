const express = require('express');
const router = express.Router();
const connection = require('../configdb'); // Conexión a la base de datos

// Ruta para realizar un pago con tarjeta
router.post('/pago', (req, res) => {
    const { numero_tarjeta, cvv, monto_a_pagar, nombre, identificacion, descripcion } = req.body;
    console.log("Datos recibidos: ", req.body); 

    // Verificar que se envían todos los datos necesarios
    if (!numero_tarjeta || !cvv || !monto_a_pagar || !nombre || !identificacion || !descripcion) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos, se requieren: numero_tarjeta, cvv, monto_a_pagar, nombre, identificacion, descripcion'
        });
    }

    // Buscar la tarjeta en la base de datos
    const query = 'SELECT nombre, monto FROM tarjetas WHERE numero_tarjeta = ? AND cvv = ?';
    connection.query(query, [numero_tarjeta, cvv], (err, results) => {
        if (err) {
            console.error('Error al buscar la tarjeta:', err);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }

        // Verificar si la tarjeta existe
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada o datos incorrectos'
            });
        }

        let saldo_actual = results[0].monto; // Obtener el saldo de la tarjeta

        // Verificar si hay suficiente saldo
        if (saldo_actual < monto_a_pagar) {
            return res.status(400).json({
                success: false,
                message: 'Saldo insuficiente'
            });
        }

        // Restar el monto de la tarjeta
        const nuevo_saldo = saldo_actual - monto_a_pagar;
        const updateQuery = 'UPDATE tarjetas SET monto = ? WHERE numero_tarjeta = ?';

        // Realizar la actualización del saldo
        connection.query(updateQuery, [nuevo_saldo, numero_tarjeta], (updateErr) => {
            if (updateErr) {
                console.error('Error al actualizar el saldo:', updateErr);
                return res.status(500).json({ success: false, message: 'Error al procesar el pago' });
            }

            // Insertar la transacción en la tabla Transferencias
            const insertQuery = `
                INSERT INTO transferencias (nombre, identificacion, numero_tarjeta, cvv, descripcion, monto_pagar)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            connection.query(insertQuery, [nombre, identificacion, numero_tarjeta, cvv, descripcion, monto_a_pagar], (insertErr) => {
                if (insertErr) {
                    console.error('Error al registrar la transferencia:', insertErr);
                    return res.status(500).json({ success: false, message: 'Error al registrar la transferencia' });
                }

                // Responder con éxito
                return res.status(200).json({
                    success: true,
                    message: 'Pago realizado exitosamente',
                    saldo_anterior: saldo_actual,
                    saldo_actual: nuevo_saldo
                });
            });
        });
    });
});

module.exports = router;
