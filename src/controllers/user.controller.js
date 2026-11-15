import { UserModel } from '../models/user.model.js'
import { validateUpdateProfile } from '../schemas/user.schema.js'
import { hashPassword, verifyPassword } from '../auth/password.js'

export class UserController {
  // GET /api/users/profile - Obtiene los datos del usuario conectado
  static async getProfile (req, res) {
    try {
      const userId = req.user.id
      const user = await UserModel.findById(userId)

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' })
      }

      return res.status(200).json({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        auth_provider: user.auth_provider,
        created_at: user.created_at,
        updated_at: user.updated_at
      })
    } catch (error) {
      console.error('Error al obtener perfil:', error)
      return res.status(500).json({ error: 'Error al obtener perfil de usuario' })
    }
  }

  // PUT /api/users/profile - Actualiza el nombre o cambia la contraseña
  static async updateProfile (req, res) {
    const userId = req.user.id

    const validation = validateUpdateProfile(req.body)
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues })
    }

    const { fullName, currentPassword, newPassword } = validation.data

    try {
      let newPasswordHash = null

      // Si el usuario quiere cambiar contraseña, verificar la contraseña actual
      if (newPassword) {
        const userWithPass = await UserModel.findByIdWithPassword(userId)
        if (!userWithPass || !userWithPass.password_hash) {
          return res.status(400).json({
            error: 'No es posible cambiar la contraseña para este proveedor de autenticación.'
          })
        }

        const isCurrentValid = await verifyPassword(currentPassword, userWithPass.password_hash)
        if (!isCurrentValid) {
          return res.status(400).json({ error: 'La contraseña actual ingresada es incorrecta.' })
        }

        newPasswordHash = await hashPassword(newPassword)
      }

      const updatedUser = await UserModel.updateProfile(userId, {
        fullName: fullName || null,
        passwordHash: newPasswordHash
      })

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' })
      }

      return res.status(200).json({
        message: 'Perfil actualizado exitosamente',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          role: updatedUser.role,
          auth_provider: updatedUser.auth_provider,
          updated_at: updatedUser.updated_at
        }
      })
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      return res.status(500).json({ error: 'Error interno al actualizar perfil' })
    }
  }
}

