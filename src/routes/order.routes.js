import { Router } from 'express'
import { OrderController } from '../controllers/order.controller.js'
import { jwtValidation } from '../middlewares/jwtValidation.js'

const orderRouter = Router()

// Rutas protegidas que requieren autenticación del cliente
orderRouter.get('/my-orders', jwtValidation, OrderController.getMyOrders)
orderRouter.get('/:id', jwtValidation, OrderController.getOrderById)
orderRouter.patch('/:id/cancel', jwtValidation, OrderController.cancelOrder)

// Crear orden (si tiene token, jwtValidation añade req.user; si no, puede crearse con token o invitado)
orderRouter.post('/', jwtValidation, OrderController.createOrder)

export default orderRouter
