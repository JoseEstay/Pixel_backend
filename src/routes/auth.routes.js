import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'

const authRouter = Router()

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)
authRouter.post('/logout', authController.logout)

authRouter.post('/protected', authController.protected)

/* authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/forgot-password', authController.forgotPassword); */

// authRouter.post('/refresh-token', authController.refreshToken);
export default authRouter
