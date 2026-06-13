// server.js

// ===============================================
// server.js - Backend con Express + MySQL + bcryptjs
// ===============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

let pool;

// Configuración de conexión MySQL desde .env
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'bdhappysystem',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function initializeDatabase() {
  try {
    // Crear pool de conexiones
    pool = await mysql.createPool(DB_CONFIG);

    // Crear tabla usuarios si no existe
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL DEFAULT 'cliente',
        membresia VARCHAR(50) NOT NULL DEFAULT 'Inactiva',
        tiempo_restante INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar admin por defecto si no existe
    const adminPassword = bcrypt.hashSync('1234', 8);
    await connection.query(
      `INSERT IGNORE INTO usuarios (nombre, password, rol, membresia, tiempo_restante)
       VALUES (?, ?, ?, ?, ?)`,
      ['Happy System', adminPassword, 'admin', 'Activa', 0]
    );

    connection.release();
    console.log('✓ Base de datos inicializada correctamente');
  } catch (err) {
    console.error('Error inicializando BD:', err);
    throw err;
  }
}

async function runQuery(sql, params = []) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

async function runExecute(sql, params = []) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(sql, params);
    return { changes: result.affectedRows, lastID: result.insertId };
  } finally {
    connection.release();
  }
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/register', async (req, res) => {  console.log('REGISTER BODY:', req.body);  const { usuario, password, rol = 'cliente', tiempo_restante = 0 } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      ok: false,
      error: 'Status 400 Usuario y contrase�a obligatorios',
    });
  }

  const hash = bcrypt.hashSync(password, 8);
  const tiempoRestante = Number.isFinite(Number(tiempo_restante)) ? Number(tiempo_restante) : 0;
  const membresia = tiempoRestante > 0 ? 'Activa' : 'Inactiva';

  try {
    await runExecute(
      'INSERT INTO usuarios (nombre, password, rol, membresia, tiempo_restante) VALUES (?, ?, ?, ?, ?)',
      [usuario, hash, rol, membresia, tiempoRestante]
    );

    return res.status(201).json({
      ok: true,
      mensaje: 'Status 201 Usuario registrado correctamente',
    });
  } catch (err) {
    console.error('Error al registrar:', err, err.stack);
    const message = err.message && err.message.includes('UNIQUE')
      ? 'Status 409 Usuario ya existe'
      : 'Status 500 Error interno del servidor';
    return res.status(err.message && err.message.includes('UNIQUE') ? 409 : 500).json({
      ok: false,
      error: message,
    });
  }
});

app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      ok: false,
      error: 'Status 400 Usuario y contrase�a obligatorios',
    });
  }

  try {
    const rows = await runQuery('SELECT * FROM usuarios WHERE nombre = ?', [usuario]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Status 404 Usuario no encontrado',
      });
    }

    const user = rows[0];
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        ok: false,
        error: 'Status 401 Clave incorrecta',
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Status 200 Login exitoso',
      usuario: {
        nombre: user.nombre,
        rol: user.rol,
        membresia: user.membresia,
        tiempo_restante: user.tiempo_restante,
      },
    });
  } catch (err) {
    console.error('Error al consultar BD:', err);
    return res.status(500).json({
      ok: false,
      error: 'Status 500 interno del servidor',
    });
  }
});

app.get('/api/listaclientes', async (req, res) => {
  try {
    const results = await runQuery('SELECT * FROM usuarios');
    return res.status(200).json({
      ok: true,
      clientes: results,
    });
  } catch (err) {
    console.error('Error al consultar BD:', err);
    return res.status(500).json({
      ok: false,
      error: 'Status 500 interno del servidor',
    });
  }
});

app.delete('/api/borrarcliente/:usuario', async (req, res) => {
  const { usuario } = req.params;

  if (!usuario) {
    return res.status(400).json({
      ok: false,
      error: 'Status 400 Nombre de usuario obligatorio',
    });
  }

  try {
    const result = await runExecute('DELETE FROM usuarios WHERE nombre = ?', [usuario]);
    if (result.changes === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Status 404 Usuario no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: `Status 200 Usuario '${usuario}' eliminado exitosamente`,
    });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    return res.status(500).json({
      ok: false,
      error: 'Status 500 interno del servidor',
    });
  }
});

const handleActivarMembresia = async (req, res) => {
  const { usuario, tiempo_restante } = req.body;

  if (!usuario || typeof tiempo_restante === 'undefined') {
    return res.status(400).json({
      ok: false,
      error: 'Status 400 Usuario y tiempo_restante obligatorios',
    });
  }

  let dias = Number(tiempo_restante);
  if (!Number.isFinite(dias)) {
    return res.status(400).json({
      ok: false,
      error: 'Status 400 tiempo_restante debe ser un n�mero v�lido',
    });
  }

  if (dias < 0) {
    dias = 0;
  }

  const membresia = dias > 0 ? 'Activa' : 'Inactiva';

  try {
    const result = await runExecute(
      'UPDATE usuarios SET tiempo_restante = ?, membresia = ? WHERE nombre = ?',
      [dias, membresia, usuario]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Status 404 Usuario no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: `Status 200 Membres�a actualizada para ${usuario}`,
    });
  } catch (err) {
    console.error('Error al actualizar membres�a:', err);
    return res.status(500).json({
      ok: false,
      error: 'Status 500 interno del servidor',
    });
  }
};

app.put('/api/activarmembresia', handleActivarMembresia);
app.post('/api/activarmembresia', handleActivarMembresia);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend corriendo' });
});

async function startServer() {
  try {
    await initializeDatabase();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
    server.on('error', (error) => {
      console.error('Error en servidor:', error);
      process.exit(1);
    });
    return server;
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
