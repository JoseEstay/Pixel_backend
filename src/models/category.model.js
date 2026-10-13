import { dataBase } from '../config/db.js'

export class CategoryModel {
  static async create ({ input }) {
    const { name, slug, description } = input

    // Inyectar valores para evitar inyección de SQL
    const result = await dataBase.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description]
    )
    return result.rows[0]
  }

  static async getAll () {
    const result = await dataBase.query('SELECT * FROM categories')
    return result.rows
  }

  static async getById (id) {
    const result = await dataBase.query('SELECT * FROM categories WHERE id = $1', [id])
    return result.rows[0]
  }

  static async delete (id) {
    const result = await dataBase.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }

  static async updatePartial (id, { input }) {
    const columns = {
      name: 'name',
      slug: 'slug',
      description: 'description'
    }

    const fields = Object.keys(input)
    const setClause = fields
      .map((field, index) => `${columns[field]} = $${index + 1}`)
      .join(', ')
    const values = fields.map((field) => input[field])

    const result = await dataBase.query(
      `UPDATE categories SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    )

    return result.rows[0]
  }

  static async update (id, { input }) {
    const { name, slug, description } = input
    const result = await dataBase.query(
      'UPDATE categories SET name = $1, slug = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, slug, description, id]
    )
    return result.rows[0]
  }
}
