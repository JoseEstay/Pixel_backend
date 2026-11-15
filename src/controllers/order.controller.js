import { OrderService } from '../services/order.service.js'
import { validateOrder, validateCancelOrder } from '../schemas/order.schema.js'
import { OrderModel } from '../models/order.model.js'
import { OrderItemModel } from '../models/orderItem.model.js'
import { dataBase } from '../config/db.js'

export class OrderController {
  // POST /api/orders - Crear nueva orden
  static async createOrder (req, res) {
    try {
      const validation = validateOrder(req.body)
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.issues || validation.error.errors })
      }

      const userId = req.user ? req.user.id : null

      const { order, snapshot } = await OrderService.processNewOrder({
        userId,
        data: validation.data
      })

      return res.status(201).json({
        message: 'Orden creada con éxito. Por favor realice la transferencia.',
        order_number: order.order_number,
        total_amount: order.total_amount,
        bank_details: {
          bank: 'Banco de Chile',
          account_type: 'Cuenta Corriente',
          account_number: '123456789',
          rut: '12.345.678-9',
          email: 'pagos@oldpixelstore.cl'
        }
      })
    } catch (error) {
      console.error('Error en createOrder:', error.message)
      return res.status(400).json({ error: error.message })
    }
  }

  // GET /api/orders/my-orders - Ver historial de pedidos del usuario autenticado
  static async getMyOrders (req, res) {
    try {
      const userId = req.user.id
      const orders = await OrderModel.findByUserId(userId)
      return res.status(200).json({ orders })
    } catch (error) {
      console.error('Error al obtener mis órdenes:', error)
      return res.status(500).json({ error: 'Error al obtener historial de órdenes' })
    }
  }

  // GET /api/orders/:id - Ver detalle de una orden
  static async getOrderById (req, res) {
    const { id } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    try {
      const order = await OrderModel.findById(id)
      if (!order) {
        return res.status(404).json({ error: 'Orden no encontrada' })
      }

      // Solo el dueño de la orden o un administrador pueden verla
      if (order.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para ver esta orden' })
      }

      const items = await OrderItemModel.getByOrderId(id)

      return res.status(200).json({
        order,
        items
      })
    } catch (error) {
      console.error('Error al obtener detalle de orden:', error)
      return res.status(500).json({ error: 'Error al obtener orden' })
    }
  }

  // PATCH /api/orders/:id/cancel - Cancelar orden por parte del cliente
  static async cancelOrder (req, res) {
    const { id } = req.params
    const userId = req.user.id

    const validation = validateCancelOrder(req.body)
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues })
    }

    const { cancellation_reason } = validation.data

    const client = await dataBase.connect()
    try {
      await client.query('BEGIN')

      // 1. Verificar existencia y estado de la orden
      const order = await OrderModel.findById(id)
      if (!order) {
        throw new Error('Orden no encontrada')
      }

      if (order.user_id !== userId) {
        return res.status(403).json({ error: 'No tienes permiso para cancelar esta orden' })
      }

      if (order.status !== 'pending') {
        return res.status(400).json({
          error: `Solo se pueden cancelar órdenes en estado pendiente. Estado actual: ${order.status}`
        })
      }

      // 2. Actualizar estado de la orden
      const updatedOrder = await OrderModel.cancelWithClient(client, {
        orderId: id,
        userId,
        cancellationReason: cancellation_reason
      })

      // 3. Liberar las reservas de inventario
      await client.query(`
        UPDATE inventory_reservations 
        SET status = 'released', 
            released_at = NOW(),
            updated_at = NOW()
        WHERE order_id = $1 AND status != 'released'
      `, [id])

      await client.query('COMMIT')

      return res.status(200).json({
        message: 'Orden cancelada exitosamente y reserva de inventario liberada.',
        order: updatedOrder
      })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error al cancelar orden:', error.message)
      return res.status(400).json({ error: error.message || 'Error al cancelar la orden' })
    } finally {
      client.release()
    }
  }
}
