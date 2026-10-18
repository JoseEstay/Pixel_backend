import { dataBase } from '../config/db.js'

export class UserModel {
  static async createLocal ({ email, passwordHash, fullName = null }) {
    const result = await dataBase.query(
      `INSERT INTO users (email, password_hash, auth_provider, full_name)
       VALUES ($1, $2, 'local', $3)
       RETURNING id, email, auth_provider, full_name`,
      [email, passwordHash, fullName]
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
}
