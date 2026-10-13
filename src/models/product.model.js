import { dataBase } from '../config/db.js'

export class ProductModel {
  static async create ({ input }) {
    const { name, description, price, stock, category_id, is_active = true, sku, condition, image_url } = input

    const result = await dataBase.query(
      'INSERT INTO products (name, description, price, stock, category_id, is_active, sku, condition, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, description, price, stock, category_id, is_active, sku, condition, image_url]
    )
    return result.rows[0]
  }

  static async getAll () {
    const result = await dataBase.query(`
      SELECT p.id, p.name, p.sku, p.price, p.stock, p.is_active, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.name ASC
    `)
    return result.rows
  }

  static async getById (id) {
    const result = await dataBase.query('SELECT * FROM products WHERE id = $1', [id])
    return result.rows[0]
  }

  static async delete (id) {
    const result = await dataBase.query('DELETE FROM products WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }

  static async update (id, { input }) {
    const { name, description, price, stock, category_id, is_active = true, sku, condition, image_url } = input
    const result = await dataBase.query(
      'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, is_active = $6, sku = $7, condition = $8, image_url = $9 WHERE id = $10 RETURNING *',
      [name, description, price, stock, category_id, is_active, sku, condition, image_url, id]
    )
    return result.rows[0]
  }

  static async updatePartial (id, { input }) {
    const columns = {
      name: 'name',
      description: 'description',
      price: 'price',
      stock: 'stock',
      category_id: 'category_id',
      is_active: 'is_active',
      sku: 'sku',
      condition: 'condition',
      image_url: 'image_url'
    }

    const fields = Object.keys(input)
    const setClause = fields
      .map((field, index) => `${columns[field]} = $${index + 1}`)
      .join(', ')
    const values = fields.map((field) => input[field])

    const result = await dataBase.query(
      `UPDATE products SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    )

    return result.rows[0]
  }
}
