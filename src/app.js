import 'dotenv/config'
import express from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import { csrfOriginValidation } from './middlewares/csrfOriginValidation.js'
import { categoryRouter } from './routes/category.routes.js'
import { productRouter } from './routes/product.routes.js'
import orderRouter from './routes/order.routes.js'
import multicourier from './routes/multicourier.routes.js'
import authRouter from './routes/auth.routes.js'
import adminRouter from './routes/admin.routes.js'

export const app = express()

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET debe estar configurado en el archivo .env')
}

app.disable('x-powered-by')
app.use(csrfOriginValidation)
app.use(corsMiddleware())
app.use(express.json())
//app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use('/categories', categoryRouter)
app.use('/products', productRouter)
app.use('/auth', authRouter)
app.use('/', multicourier) // Ruta para obtener regiones desde MultiCourier
app.use('/api/orders', orderRouter)
app.use('api/admin', adminRouter)

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
