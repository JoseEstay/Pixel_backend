import express from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import { categoryRouter } from './routes/category.routes.js'
import { productRouter } from './routes/product.routes.js'

const app = express()

app.disable('x-powered-by')
app.use(corsMiddleware())
app.use(express.json())

app.use('/categories', categoryRouter)
app.use('/products', productRouter)

/* app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de categorías!')
}) */

const PORT = process.env.PORT || 3002

/* if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
  })
}

export default app */

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
