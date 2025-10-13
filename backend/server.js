const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

// Importar rutas
const proveedoresRoutes = require('./routes/proveedores');
const inventarioRoutes = require('./routes/inventario');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas API
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/inventario', inventarioRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Control de Inventario',
    version: '1.0.0',
    endpoints: {
      proveedores: '/api/proveedores',
      inventario: '/api/inventario',
      health: '/api/health'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Manejo de rutas no encontradas
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// 🚨 Manejo de rutas no encontradas (404) - CORREGIDO
// Se coloca al final, y SIN argumento de ruta.
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe` 
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}`);
  
  // Probar conexión a la base de datos
  await testConnection();
});

module.exports = app;



