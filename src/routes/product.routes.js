import { Router } from 'express'
import { productController } from '../controllers/product.controller.js'

export const productRouter = Router()
productRouter.post('/', productController.create)

productRouter.get('/', productController.getAll)
productRouter.get('/:id', productController.getById)
productRouter.put('/:id', productController.update)
productRouter.patch('/:id', productController.patch)
productRouter.delete('/:id', productController.delete)
