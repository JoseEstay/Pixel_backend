import { Router } from 'express'
import { AdminOrderController } from '../controllers/adminOrder.controller.js'
import { jwtValidation } from '../middlewares/jwtValidation.js'
import { isAdmin } from '../middlewares/isAdmin.js'

const adminRouter = Router()

// Protegemos TODAS las rutas de este router con ambos middlewares
adminRouter.use(jwtValidation)
adminRouter.use(isAdmin)

adminRouter.get('/orders/pending', AdminOrderController.getPendingOrders)
adminRouter.patch('/orders/:id/confirm', AdminOrderController.confirmPayment)
adminRouter.patch('/orders/:id/ship', AdminOrderController.markAsShipped)

export default adminRouter
