import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller.js'
import { jwtValidation } from '../middlewares/jwtValidation.js'

const AuthRouter = Router()

AuthRouter.get('/signup', AuthController.signup_get) // sign up page
AuthRouter.get('/login', AuthController.login_get) // login in page
AuthRouter.post('/signup', AuthController.signup_post) // create new user in db
AuthRouter.post('/login', AuthController.login_post) // authenticate a current user
AuthRouter.get('/logout', AuthController.logout) // log a user out

AuthRouter.post('/protected', jwtValidation, AuthController.protected)

/* AuthRouter.post('/reset-password', AuthController.resetPassword);
AuthRouter.post('/forgot-password', AuthController.forgotPassword); */

// AuthRouter.post('/refresh-token', AuthController.refreshToken);
export default AuthRouter
