import { pool } from '../config/db.js'

export class CategoryModel {
  static async create ({ input }) {
    const { name, slug, description } = input

    // Inyectamos los valores de forma segura para evitar inyecciones SQL
    const result = await pool.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description]
    )
    return result.rows[0]
  }

  static async getAll () {
    const result = await pool.query('SELECT * FROM categories')
    return result.rows
  }

  static async getById (id) {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id])
    return result.rows[0]
  }

  static async update (id, { input }) {
    const { name, slug, description } = input
    const result = await pool.query(
      'UPDATE categories SET name = $1, slug = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, slug, description, id]
    )
    return result.rows[0]
  }
}
