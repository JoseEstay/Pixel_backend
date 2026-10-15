import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'

const authRouter = Router()

authRouter.get('/signup', authController.signup_get) // sign up page
authRouter.get('/login', authController.login_get) // login in page
authRouter.post('/signup', authController.signup_post) // create new user in db
authRouter.post('/login', authController.login_post) // authenticate a current user
authRouter.get('/logout', authController.logout) // log a user out

authRouter.post('/protected', jwtValidation, authController.protected)

/* authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/forgot-password', authController.forgotPassword); */

// authRouter.post('/refresh-token', authController.refreshToken);
export default authRouter
