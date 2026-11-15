import { Router } from 'express'
import { CartController } from '../controllers/cart.controller.js'
import { jwtValidation } from '../middlewares/jwtValidation.js'

const cartRouter = Router()

// Todas las operaciones del carrito requieren usuario autenticado
cartRouter.use(jwtValidation)

// 1. Obtener carrito del usuario
cartRouter.get('/', CartController.getCart)

// 2. Agregar producto al carrito
cartRouter.post('/items', CartController.addItem)

// 3. Modificar cantidad de un ítem
cartRouter.patch('/items/:id', CartController.updateItem)

// 4. Eliminar un ítem específico
cartRouter.delete('/items/:id', CartController.removeItem)

// 5. Vaciar carrito completo
cartRouter.delete('/', CartController.clear)

export default cartRouter

