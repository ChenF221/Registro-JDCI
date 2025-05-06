const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'registro_participantes.csv');

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'SERVICIO2')));


// Crear encabezado del archivo si no existe
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, "Nombre,Boleta,Tipo,BEIFI,Correo,Asistencia,TipoUsuario,HoraRegistro\n");
}

app.post('/agregar', (req, res) => {
    const { nombre, boleta, tipo, beifi, correo, asistencia, tipoUsuario } = req.body;

    if (!nombre || !tipoUsuario) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    const horaRegistro = new Date().toLocaleString('es-MX'); // Captura la fecha y hora local
    let linea = "";

    if (tipoUsuario === "Alumno") {
        if (!boleta || boleta.length !== 10 || isNaN(boleta)) {
            return res.status(400).json({ error: "Boleta inválida." });
        }

        linea = `${nombre},${boleta},${tipo || "N/A"},${beifi || "N/A"},N/A,${asistencia || "Si"},Alumno,${horaRegistro}\n`;
    } else if (tipoUsuario === "Profesor") {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!correo || !emailRegex.test(correo)) {
            return res.status(400).json({ error: "Correo inválido." });
        }

        linea = `${nombre},N/A,${tipo || "N/A"},N/A,${correo},${asistencia || "Si"},Profesor,${horaRegistro}\n`;
    } else {
        return res.status(400).json({ error: "Tipo de usuario no reconocido." });
    }

    fs.appendFile(FILE_PATH, linea, err => {
        if (err) {
            console.error("Error al escribir CSV:", err);
            return res.status(500).json({ error: "No se pudo guardar el registro." });
        }

        res.json({ message: "Registro guardado correctamente" });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'registro.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});
