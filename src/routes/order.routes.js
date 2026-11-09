import { Router } from 'express'
import { OrderController } from '../controllers/order.controller.js'

const orderRouter = Router()

// Aquí podrías poner un middleware para validar si el usuario está logueado o es invitado
orderRouter.post('/', OrderController.createOrder)

export default orderRouter
