import express from 'express'
import corsMiddleware from './src/middlewares/cors.js'
import { categoryRouter } from './src/routes/category.routes.js'
import { productRouter } from './src/routes/product.routes.js'

const app = express()

app.disable('x-powered-by')
app.use(corsMiddleware())
app.use(express.json())

app.use('/categories', categoryRouter)
app.use('/products', productRouter)

/* app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de categorías!')
}) */

const PORT = process.env.PORT || 1234

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
