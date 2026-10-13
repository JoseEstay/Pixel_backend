import 'dotenv/config' // Lee el archivo .env y carga las variables en process.env
import pg from 'pg'

const { Pool } = pg

// Creamos la conexión inyectando las variables de entorno[cite: 1]
export const dataBase = new Pool({
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME
})

// Pequeño test para confirmar que el backend "habla" con tu contenedor local
dataBase.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err)
  } else {
    console.log('✅ Conectado a PostgreSQL exitosamente')
  }
})
