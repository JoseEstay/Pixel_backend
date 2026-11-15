import { dataBase } from '../config/db.js'

export class ProductModel {
  static async create ({ input, createdByUserId = null }) {
    const {
      name,
      description,
      price,
      currency = 'CLP',
      stock,
      category_id,
      is_active = true,
      sku,
      condition,
      image_url
    } = input

    const query = `
      INSERT INTO products (
        name, 
        description, 
        price, 
        currency, 
        stock, 
        category_id, 
        is_active, 
        sku, 
        condition, 
        image_url, 
        created_by_user_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `

    const values = [
      name,
      description,
      price,
      currency,
      stock,
      category_id,
      is_active,
      sku,
      condition,
      image_url,
      createdByUserId
    ]

    const result = await dataBase.query(query, values)
    return result.rows[0]
  }

  // GET ALL con soporte de filtros: category_id, condition y búsqueda por name/sku
  static async getAll ({ category_id, condition, search } = {}) {
    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.sku, 
        p.price, 
        p.currency, 
        p.stock, 
        p.condition, 
        p.image_url, 
        p.is_active, 
        p.created_by_user_id, 
        c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1 = 1
    `
    const values = []
    let paramIndex = 1

    if (category_id) {
      query += ` AND p.category_id = $${paramIndex++}`
      values.push(category_id)
    }

    if (condition) {
      query += ` AND LOWER(p.condition) = LOWER($${paramIndex++})`
      values.push(condition)
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`
      values.push(`%${search}%`)
      paramIndex++
    }

    query += ' ORDER BY p.name ASC'

    const result = await dataBase.query(query, values)
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
    const {
      name,
      description,
      price,
      currency = 'CLP',
      stock,
      category_id,
      is_active = true,
      sku,
      condition,
      image_url
    } = input

    const query = `
      UPDATE products 
      SET name = $1, 
          description = $2, 
          price = $3, 
          currency = $4, 
          stock = $5, 
          category_id = $6, 
          is_active = $7, 
          sku = $8, 
          condition = $9, 
          image_url = $10,
          updated_at = NOW()
      WHERE id = $11 
      RETURNING *
    `

    const values = [
      name,
      description,
      price,
      currency,
      stock,
      category_id,
      is_active,
      sku,
      condition,
      image_url,
      id
    ]

    const result = await dataBase.query(query, values)
    return result.rows[0]
  }

  static async updatePartial (id, { input }) {
    const columns = {
      name: 'name',
      description: 'description',
      price: 'price',
      currency: 'currency',
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
      `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    )

    return result.rows[0]
  }
}
