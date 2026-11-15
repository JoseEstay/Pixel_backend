import { dataBase } from '../config/db.js'

export class InventoryReservationModel {
  static async createManyWithClient (client, orderId, cartItems, expiresAt) {
    const finalValues = []
    cartItems.forEach((item) => {
      finalValues.push(orderId, item.product_id, item.quantity, expiresAt)
    })

    const placeholders = cartItems.map((_, i) => {
      const o = i * 4
      return `(gen_random_uuid(), $${o + 1}, $${o + 2}, $${o + 3}, $${o + 4})`
    }).join(', ')

    const query = `
      INSERT INTO inventory_reservations (id, order_id, product_id, quantity, expires_at)
      VALUES ${placeholders}
    `

    await client.query(query, finalValues)
  }

  // Libera las reservas expiradas (> 24 hrs sin pago) y cancela las órdenes asociadas
  static async releaseExpiredReservations () {
    const client = await dataBase.connect()
    try {
      await client.query('BEGIN')

      // 1. Obtener los IDs de las órdenes con reservas expiradas y pendientes
      const expiredQuery = `
        SELECT DISTINCT order_id 
        FROM inventory_reservations 
        WHERE status = 'pending' AND expires_at < NOW()
      `
      const { rows: expiredRows } = await client.query(expiredQuery)

      if (expiredRows.length === 0) {
        await client.query('COMMIT')
        return { releasedReservationsCount: 0, cancelledOrdersCount: 0 }
      }

      const orderIds = expiredRows.map(r => r.order_id)

      // 2. Marcar las reservas como liberadas
      const releaseReservationsQuery = `
        UPDATE inventory_reservations 
        SET status = 'released', 
            released_at = NOW(),
            updated_at = NOW()
        WHERE status = 'pending' AND expires_at < NOW()
        RETURNING id
      `
      const reservationsResult = await client.query(releaseReservationsQuery)

      // 3. Cancelar las órdenes pendientes asociadas
      const cancelOrdersQuery = `
        UPDATE orders 
        SET status = 'cancelled', 
            payment_status = 'cancelled', 
            cancelled_at = NOW(),
            cancellation_reason = 'Cancelado automáticamente: expiró el plazo de 24 horas para realizar la transferencia.',
            updated_at = NOW()
        WHERE id = ANY($1::uuid[]) AND status = 'pending'
        RETURNING id
      `
      const ordersResult = await client.query(cancelOrdersQuery, [orderIds])

      await client.query('COMMIT')

      return {
        releasedReservationsCount: reservationsResult.rowCount,
        cancelledOrdersCount: ordersResult.rowCount
      }
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error al liberar reservas expiradas:', error)
      throw error
    } finally {
      client.release()
    }
  }

  // Obtiene la cantidad de stock actualmente congelada en reservas pendientes no expiradas
  static async getReservedQuantityByProductId (productId) {
    const query = `
      SELECT COALESCE(SUM(quantity), 0)::integer as reserved_quantity
      FROM inventory_reservations
      WHERE product_id = $1 
        AND status = 'pending' 
        AND expires_at > NOW()
    `
    const result = await dataBase.query(query, [productId])
    return result.rows[0].reserved_quantity
  }
}
