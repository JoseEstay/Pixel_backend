import { OrderService } from '../services/order.service.js'
import { validateOrder } from '../schemas/order.schema.js'

export class OrderController {
  static async createOrder (req, res) {
    try {
      // 1. Validar entrada con Zod
      const validation = validateOrder(req.body)
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors })
      }

      // 2. Obtener user_id (si está logueado)
      const userId = req.user ? req.user.id : null

      // 3. Llamar al Service
      const { order, snapshot } = await OrderService.processNewOrder({
        userId,
        data: validation.data
      })

      // 4. Responder al cliente con los datos para la transferencia
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
      // Si el Service lanzó un error de negocio (ej: sin stock), lo devolvemos como 400
      return res.status(400).json({ error: error.message })
    }
  }
}