import { validateLogin, validateRegister } from '../schemas/user.schema.js'
import { UserModel } from '../models/user.model.js'
import { hashPassword, verifyPassword } from '../auth/password.js'
import jwt from 'jsonwebtoken'

const TOKEN_TTL_SECONDS = 60 * 60
const AUTH_COOKIE = 'jwt'

const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: TOKEN_TTL_SECONDS * 1000,
  path: '/'
})

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no está configurado')

  return jwt.sign({ id: userId }, secret, {
    expiresIn: TOKEN_TTL_SECONDS,
    algorithm: 'HS256'
  })
}

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  role: user.role
})

export class AuthController {
  static async signup_post (req, res) {
    const result = validateRegister(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues })
    }

    const { email, password, fullName } = result.data

    try {
      const existingUser = await UserModel.findLocalByEmail(email)
      if (existingUser) {
        return res.status(409).json({ error: 'El correo electrónico ya está registrado' })
      }

      const passwordHash = await hashPassword(password)
      const newUser = await UserModel.createLocal({ email, passwordHash, fullName })
      const token = createToken(newUser.id)

      res.cookie(AUTH_COOKIE, token, authCookieOptions())
      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: publicUser(newUser)
      })
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'El correo electrónico ya está registrado' })
      }
      console.error(error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async login_post (req, res) {
    const result = validateLogin(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues })
    }

    const { email, password } = result.data

    try {
      const user = await UserModel.findLocalByEmail(email)
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      const isPasswordValid = await verifyPassword(password, user.password_hash)
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      const token = createToken(user.id)
      res.cookie(AUTH_COOKIE, token, authCookieOptions())

      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: publicUser(user)
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async logout (_req, res) {
    const { maxAge, ...clearOptions } = authCookieOptions()
    res.clearCookie(AUTH_COOKIE, clearOptions)
    return res.status(200).json({ message: 'Sesión cerrada' })
  }

  static async protected (req, res) {
    return res.status(200).json({
      message: 'Acceso permitido a la ruta protegida',
      user: { id: req.user.id }
    })
  }
}
