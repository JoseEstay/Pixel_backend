import { Router } from 'express'
import { categoryController } from '../controllers/category.controller.js'

export const categoryRouter = Router()
categoryRouter.post('/', categoryController.create)

categoryRouter.get('/', categoryController.getAll)
categoryRouter.get('/:id', categoryController.getById)
categoryRouter.put('/:id', categoryController.update)
categoryRouter.delete('/:id', categoryController.delete)
categoryRouter.patch('/:id', categoryController.patch)
