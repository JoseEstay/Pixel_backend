import { dataBase } from '../config/db.js'

export class OrderModel {
  static async create ({ input }) {
    const {
      user_id, 
      order_number,
      subtotal_amount,
      shipping_amount = 0,
      discount_amount = 0,
      total_amount,
      shipping_recipient_name,
      shipping_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_commune,
      shipping_city,
      shipping_region,
      shipping_postal_code,
    } = input

    const query = `
            INSERT INTO orders (
                id, 
                user_id, 
                order_number, 
                subtotal_amount, 
                shipping_amount, 
                discount_amount, 
                total_amount, 
                shipping_recipient_name, 
                shipping_phone, 
                shipping_address_line1, 
                shipping_address_line2, 
                shipping_commune, 
                shipping_city, 
                shipping_region, 
                shipping_postal_code
            ) 
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
            RETURNING *
        `

    const values = [
      user_id,
      order_number,
      subtotal_amount,
      shipping_amount,
      discount_amount,
      total_amount,
      shipping_recipient_name,
      shipping_phone,
      shipping_address_line1,
      shipping_address_line2 || null,
      shipping_commune,
      shipping_city,
      shipping_region,
      shipping_postal_code || null,
    ]

    const result = await dataBase.query(query, values)
    return result.rows[0]
  }
}
