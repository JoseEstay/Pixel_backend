import { validateRegister } from '../schemas/user.schema.js'
import { UserModel } from '../models/user.model.js'
import { hashPassword } from '../auth/password.js'

export class AuthController {
  static async signup_get (req, res) {

  }

  static async signup_post (req, res) {
    const result = validateRegister(req.body)

    if (!result.success) {
      return res.status(409).json({ error: result.error.issues })
    }

    const { email, password, fullName } = result.data

    try {
      const existingUser = await UserModel.findLocalByEmail(email)
      if (existingUser) {
        return res.status(409).json({ error: 'El correo electrónico ya está registrado' })
      }

      const passwordHash = await hashPassword(password)
      const newUser = await UserModel.createLocal({ email, passwordHash, fullName })

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser
      })
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'El correo electrónico ya está registrado' })
      }
      console.error(error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async login_get (req, res) {

  }

  static async login_post (req, res) {
    const { loginSchema } = req.body
    if (!loginSchema) {
      return res.status(400).json({ error: 'Datos de inicio de sesión incompletos' })
    }
    try {
      const user = await UserModel.findByEmail(loginSchema.email)
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      const isPasswordValid = await UserModel.comparePassword(loginSchema.password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }
      // Aquí puedes generar un token JWT y enviarlo al cliente si lo deseas
      return res.status(200).json({ message: 'Inicio de sesión exitoso', user })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async logout (req, res) {

  }

  static async protected (req, res) {
    res.json({ message: 'Acceso permitido a la ruta protegida', user: req.user })
  }
}

// export const authController = new AuthController()
