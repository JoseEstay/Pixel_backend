import { userSchema } from '../schemas/user.schema.js'
import { UserModel } from '../models/user.model.js'

export class AuthController {
  async signup_get (req, res) {

  }

  async signup_post (req, res) {

  }

  async login_get (req, res) {

  }

  async login_post (req, res) {

  }

  async logout (req, res) {

  }

  async protected (req, res) {
    res.json({ message: 'Acceso permitido a la ruta protegida', user: req.user })
  }
}
