const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

console.log("DEBUG CONNECTION PARAMS:");
console.log("User:", pool.options.user);
console.log("DB:", pool.options.database);
console.log("Pass is a string:", typeof pool.options.password === 'string'); // DEBE ser 'true'
console.log("Password value:", pool.options.password);


// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
  }
};

module.exports = { pool, testConnection };



