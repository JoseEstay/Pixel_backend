import { dataBase } from '../config/db.js'

export class UserModel {
  static async createLocal ({ email, passwordHash, fullName = null, role = 'customer' }) {
    const result = await dataBase.query(
      `INSERT INTO users (email, password_hash, auth_provider, full_name, role)
       VALUES ($1, $2, 'local', $3, $4)
       RETURNING id, email, auth_provider, full_name, role`,
      [email, passwordHash, fullName, role]
    )

    return result.rows[0]
  }

  static async findLocalByEmail (email) {
    const result = await dataBase.query(
      `SELECT id, email, password_hash, full_name, role, auth_provider
       FROM users
       WHERE email = $1 AND auth_provider = 'local'`,
      [email]
    )

    return result.rows[0]
  }

  // Obtiene los datos públicos del perfil del usuario por su ID
  static async findById (id) {
    const result = await dataBase.query(
      `SELECT id, email, full_name, role, auth_provider, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    )

    return result.rows[0]
  }

  // Obtiene el usuario con el hash de contraseña (necesario para verificar antes de cambiar clave)
  static async findByIdWithPassword (id) {
    const result = await dataBase.query(
      `SELECT id, email, password_hash, full_name, role, auth_provider
       FROM users
       WHERE id = $1`,
      [id]
    )

    return result.rows[0]
  }

  // Actualiza el nombre completo o la contraseña del usuario
  static async updateProfile (id, { fullName, passwordHash }) {
    const query = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          password_hash = COALESCE($2, password_hash),
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, email, full_name, role, auth_provider, created_at, updated_at
    `
    const result = await dataBase.query(query, [fullName || null, passwordHash || null, id])
    return result.rows[0]
  }
}
