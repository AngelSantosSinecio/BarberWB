require('dotenv').config();

const pool = require('../config/database');

const testDbConnection = async () => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS databaseName');

    console.log('Conexion a MariaDB correcta');
    console.log(`Base de datos activa: ${rows[0].databaseName}`);
  } catch (error) {
    console.error('Error al conectar con MariaDB');
    console.error(error.message);
  } finally {
    await pool.end();
  }
};

testDbConnection();
