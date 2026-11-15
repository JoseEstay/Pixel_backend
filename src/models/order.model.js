import { dataBase } from '../config/db.js'

export class OrderModel {
  static async createWithClient (client, { input }) {
    const {
      user_id,
      order_number,
      subtotal_amount,
      shipping_amount = 0,
      discount_amount = 0,
      total_amount,
      currency = 'CLP',
      payment_method = 'transfer',
      status = 'pending',
      payment_status = 'pending',
      snapshot,
      shipping_recipient_name,
      shipping_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_commune,
      shipping_city,
      shipping_region,
      shipping_postal_code
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
        currency,
        status,
        payment_status,
        payment_method,
        snapshot,
        shipping_recipient_name, 
        shipping_phone, 
        shipping_address_line1, 
        shipping_address_line2, 
        shipping_commune, 
        shipping_city, 
        shipping_region, 
        shipping_postal_code
      ) 
      VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) 
      RETURNING *
    `

    const values = [
      user_id,
      order_number,
      subtotal_amount,
      shipping_amount,
      discount_amount,
      total_amount,
      currency,
      status,
      payment_status,
      payment_method,
      JSON.stringify(snapshot),
      shipping_recipient_name,
      shipping_phone,
      shipping_address_line1,
      shipping_address_line2 || null,
      shipping_commune,
      shipping_city,
      shipping_region,
      shipping_postal_code || null
    ]

    const result = await client.query(query, values)
    return result.rows[0]
  }

  static async create ({ input }) {
    return this.createWithClient(dataBase, { input })
  }

  // Obtiene el historial de órdenes de un usuario
  static async findByUserId (userId) {
    const query = `
      SELECT 
        id, 
        order_number, 
        subtotal_amount, 
        shipping_amount, 
        discount_amount, 
        total_amount, 
        currency, 
        status, 
        payment_status, 
        created_at,
        shipped_at,
        delivered_at,
        cancelled_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `
    const result = await dataBase.query(query, [userId])
    return result.rows
  }

  // Obtiene una orden por su ID
  static async findById (id) {
    const query = 'SELECT * FROM orders WHERE id = $1'
    const result = await dataBase.query(query, [id])
    return result.rows[0]
  }

  // Cancelar orden por parte del cliente (solo si está en 'pending')
  static async cancelWithClient (client, { orderId, userId, cancellationReason }) {
    const query = `
      UPDATE orders
      SET status = 'cancelled',
          payment_status = 'cancelled',
          cancelled_at = NOW(),
          cancellation_reason = $1,
          updated_at = NOW()
      WHERE id = $2 AND user_id = $3 AND status = 'pending'
      RETURNING *
    `
    const result = await client.query(query, [cancellationReason || 'Cancelado por el cliente', orderId, userId])
    return result.rows[0]
  }

  // Marcar orden como entregada (Admin)
  static async markAsDelivered (orderId) {
    const query = `
      UPDATE orders
      SET status = 'delivered',
          delivered_at = NOW(),
          updated_at = NOW()
      WHERE id = $1 AND status = 'shipped'
      RETURNING *
    `
    const result = await dataBase.query(query, [orderId])
    return result.rows[0]
  }

  // Cancelar orden por parte del Admin y rechazar pago
  static async adminCancelWithClient (client, { orderId, cancellationReason, adminId }) {
    const query = `
      UPDATE orders
      SET status = 'cancelled',
          payment_status = 'rejected',
          cancelled_at = NOW(),
          cancellation_reason = $1,
          confirmed_by_admin_id = $2,
          updated_at = NOW()
      WHERE id = $3 AND status IN ('pending', 'confirmed')
      RETURNING *
    `
    const result = await client.query(query, [
      cancellationReason || 'Cancelado por el administrador',
      adminId,
      orderId
    ])
    return result.rows[0]
  }
}
