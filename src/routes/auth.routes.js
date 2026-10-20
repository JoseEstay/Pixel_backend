import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller.js'
import { jwtValidation } from '../middlewares/jwtValidation.js'

const authRouter = Router()

authRouter.post('/signup', AuthController.signup_post)
authRouter.post('/login', AuthController.login_post)
authRouter.post('/logout', AuthController.logout)
authRouter.get('/protected', jwtValidation, AuthController.protected)

export default authRouter
