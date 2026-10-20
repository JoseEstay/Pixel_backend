import 'dotenv/config'
import express from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import { csrfOriginValidation } from './middlewares/csrfOriginValidation.js'
import { categoryRouter } from './routes/category.routes.js'
import { productRouter } from './routes/product.routes.js'
import authRouter from './routes/auth.routes.js'

const app = express()

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET debe estar configurado en el archivo .env')
}

app.disable('x-powered-by')
app.use(csrfOriginValidation)
app.use(corsMiddleware())
app.use(express.json())

app.use('/categories', categoryRouter)
app.use('/products', productRouter)
app.use('/auth', authRouter)

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
