import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'
import { jwtValidation } from '../middlewares/jwtValidation.js'

const userRouter = Router()

// Todas las rutas de perfil requieren usuario autenticado
userRouter.use(jwtValidation)

userRouter.get('/profile', UserController.getProfile)
userRouter.put('/profile', UserController.updateProfile)

export default userRouter

