import { dataBase } from '../config/db.js'
import { OrderModel } from '../models/order.model.js'
import { InventoryReservationModel } from '../models/inventoryReservation.model.js'

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

  // 2. Confirmar Pago (Validar Transferencia) y Descontar Stock Formal
  static async confirmPayment (req, res) {
    const { id } = req.params
    const adminId = req.user.id // Viene del token JWT

    const client = await dataBase.connect()
    try {
      await client.query('BEGIN')

      // Actualizar orden a 'confirmed'
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

      // 1. Descuento efectivo del stock en la tabla products
      await client.query(`
        UPDATE products p
        SET stock = GREATEST(0, p.stock - ir.quantity),
            updated_at = NOW()
        FROM inventory_reservations ir
        WHERE ir.order_id = $1 
          AND ir.product_id = p.id 
          AND ir.status = 'pending'
      `, [id])

      // 2. Sellar reservas de stock a 'confirmed'
      await client.query(`
        UPDATE inventory_reservations 
        SET status = 'confirmed', 
            confirmed_at = NOW(), 
            updated_at = NOW()
        WHERE order_id = $1 AND status = 'pending'
      `, [id])

      await client.query('COMMIT')

      return res.json({
        message: 'Pago confirmado, stock descontado formalmente y reserva asegurada.',
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
    const { tracking_number, shipping_carrier, tracking_url } = req.body

    if (!tracking_number) {
      return res.status(400).json({ error: 'El número de tracking es obligatorio.' })
    }

    try {
      const result = await dataBase.query(`
        UPDATE orders 
        SET status = 'shipped', 
            tracking_number = $1, 
            shipping_carrier = $2,
            tracking_url = $3,
            shipped_at = NOW(),
            updated_at = NOW()
        WHERE id = $4 AND status = 'confirmed'
        RETURNING *
      `, [tracking_number, shipping_carrier, tracking_url || null, id])

      if (result.rowCount === 0) {
        return res.status(400).json({ error: 'La orden debe estar confirmada antes de enviarse.' })
      }

      return res.json({ message: 'Orden enviada con éxito.', order: result.rows[0] })
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar el envío.' })
    }
  }

  // 4. Marcar como Entregada
  static async markAsDelivered (req, res) {
    const { id } = req.params

    try {
      const updatedOrder = await OrderModel.markAsDelivered(id)

      if (!updatedOrder) {
        return res.status(400).json({
          error: 'La orden no existe o debe estar en estado enviado (shipped) para marcarse como entregada.'
        })
      }

      return res.status(200).json({
        message: 'Orden marcada como entregada exitosamente.',
        order: updatedOrder
      })
    } catch (error) {
      console.error('Error al marcar orden como entregada:', error)
      return res.status(500).json({ error: 'Error al actualizar estado de la orden' })
    }
  }

  // 5. Cancelar o rechazar orden y liberar reservas
  static async cancelOrder (req, res) {
    const { id } = req.params
    const adminId = req.user.id
    const { cancellation_reason } = req.body

    const client = await dataBase.connect()
    try {
      await client.query('BEGIN')

      const cancelledOrder = await OrderModel.adminCancelWithClient(client, {
        orderId: id,
        cancellationReason: cancellation_reason || 'Pago rechazado por el administrador',
        adminId
      })

      if (!cancelledOrder) {
        throw new Error('La orden no existe o ya no se puede cancelar.')
      }

      // Liberar reservas de inventario asociadas
      await client.query(`
        UPDATE inventory_reservations 
        SET status = 'released', 
            released_at = NOW(),
            updated_at = NOW()
        WHERE order_id = $1 AND status != 'released'
      `, [id])

      await client.query('COMMIT')

      return res.status(200).json({
        message: 'Orden cancelada y reservas de stock liberadas exitosamente.',
        order: cancelledOrder
      })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error al cancelar orden como admin:', error.message)
      return res.status(400).json({ error: error.message || 'Error al cancelar la orden' })
    } finally {
      client.release()
    }
  }

  // 6. Ejecutar manualmente la liberación de reservas expiradas (> 24 hrs)
  static async triggerCleanupExpired (req, res) {
    try {
      const result = await InventoryReservationModel.releaseExpiredReservations()
      return res.status(200).json({
        message: 'Limpieza de reservas expiradas ejecutada correctamente.',
        ...result
      })
    } catch (error) {
      console.error('Error en triggerCleanupExpired:', error)
      return res.status(500).json({ error: 'Error al ejecutar limpieza de reservas' })
    }
  }
}
