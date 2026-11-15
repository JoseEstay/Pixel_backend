import { Router } from 'express'
import { productController } from '../controllers/product.controller.js'
import { jwtValidation } from '../middlewares/jwtValidation.js'
import { isAdmin } from '../middlewares/isAdmin.js'

export const productRouter = Router()

// Rutas Públicas (Cualquier visitante o cliente puede consultar el catálogo)
productRouter.get('/', productController.getAll)
productRouter.get('/:id', productController.getById)

// Rutas Protegidas (Solo administradores autenticados)
productRouter.post('/', jwtValidation, isAdmin, productController.create)
productRouter.put('/:id', jwtValidation, isAdmin, productController.update)
productRouter.patch('/:id', jwtValidation, isAdmin, productController.patch)
productRouter.delete('/:id', jwtValidation, isAdmin, productController.delete)
