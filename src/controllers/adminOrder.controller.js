import { dataBase } from '../config/db.js'

export class AdminOrderController {
  // 1. Ver órdenes pendientes
  static async getPendingOrders (req, res) {
    try {
      const result = await dataBase.query(`
        SELECT id, order_number, total_amount, created_at, shipping_recipient_name, payment_status
        FROM orders 
        WHERE status = 'pending' 
        ORDER BY created_at ASC
      `)
      return res.json({ orders: result.rows })
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener órdenes' })
    }
  }

  // 2. Confirmar Pago (Validar Transferencia)
  static async confirmPayment (req, res) {
    const { id } = req.params
    const adminId = req.user.id // Viene del token JWT

    const client = await dataBase.connect()
    try {
      await client.query('BEGIN')

      // Actualizar orden
      const orderResult = await client.query(`
        UPDATE orders 
        SET status = 'confirmed', 
            payment_status = 'confirmed', 
            confirmed_by_admin_id = $1, 
            confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = $2 AND status = 'pending'
        RETURNING *
      `, [adminId, id])

      if (orderResult.rowCount === 0) {
        throw new Error('Orden no encontrada o ya fue procesada.')
      }

      // Sellar reservas de stock
      await client.query(`
        UPDATE inventory_reservations 
        SET status = 'confirmed', confirmed_at = NOW()
        WHERE order_id = $1
      `, [id])

      await client.query('COMMIT')

      return res.json({
        message: 'Pago confirmado y stock asegurado.',
        order: orderResult.rows[0]
      })
    } catch (error) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: error.message })
    } finally {
      client.release()
    }
  }

  // 3. Marcar como Enviado
  static async markAsShipped (req, res) {
    const { id } = req.params
    const { tracking_number, shipping_carrier } = req.body

    if (!tracking_number) {
      return res.status(400).json({ error: 'El número de tracking es obligatorio.' })
    }

    try {
      const result = await dataBase.query(`
        UPDATE orders 
        SET status = 'shipped', 
            tracking_number = $1, 
            shipping_carrier = $2,
            shipped_at = NOW(),
            updated_at = NOW()
        WHERE id = $3 AND status = 'confirmed'
        RETURNING *
      `, [tracking_number, shipping_carrier, id])

      if (result.rowCount === 0) {
        return res.status(400).json({ error: 'La orden debe estar confirmada antes de enviarse.' })
      }

      return res.json({ message: 'Orden enviada con éxito.', order: result.rows[0] })
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar el envío.' })
    }
  }
}
