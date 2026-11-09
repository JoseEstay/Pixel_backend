import { CartModel } from '../models/cart.model.js'
import { OrderModel } from '../models/order.model.js'
import { OrderItemModel } from '../models/orderItem.model.js'
import { InventoryReservationModel } from '../models/inventoryReservation.model.js'
import { dataBase } from '../config/db.js'

export class OrderService {
  
  // ==========================================
  // 1. GENERADOR DE NÚMERO DE ORDEN
  // ==========================================
  static generateOrderNumber () {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    // Genera un string aleatorio de 4 caracteres (ej: A1B2)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    return `OP-${year}${month}${day}-${random}`
  }

  // ==========================================
  // 2. CONSTRUCTOR DEL SNAPSHOT
  // ==========================================
  static buildSnapshot (cartItems, shippingData) {
    // Calculamos el subtotal real desde la base de datos
    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0)
    const total = subtotal + Number(shippingData.shipping_amount)

    return {
      items: cartItems.map(item => ({
        product_id: item.product_id,
        name: item.name,
        sku: item.sku,
        price: Number(item.price),
        quantity: item.quantity
      })),
      totals: {
        subtotal: subtotal,
        shipping: Number(shippingData.shipping_amount),
        discount: 0,
        total: total
      },
      shipping_address: {
        recipient_name: shippingData.shipping_recipient_name,
        phone: shippingData.shipping_phone,
        address_line1: shippingData.shipping_address_line1,
        address_line2: shippingData.shipping_address_line2 || null,
        commune: shippingData.shipping_commune,
        city: shippingData.shipping_city,
        region: shippingData.shipping_region,
        postal_code: shippingData.shipping_postal_code || null
      },
      created_at: new Date().toISOString()
    }
  }

  // ==========================================
  // 3. ORQUESTADOR PRINCIPAL (El flujo completo)
  // ==========================================
  static async processNewOrder ({ userId, data }) {
    // A. Buscar el carrito y sus productos
    const cartItems = await CartModel.getItemsWithProducts(data.cart_id)
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error('El carrito está vacío o no existe.')
    }

    // B. Verificar Stock (Regla de negocio)
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        throw new Error(`No hay suficiente stock para el producto: ${item.name}. Stock disponible: ${item.stock}`)
      }
    }

    // C. Calcular totales y armar snapshot
    // Nota: Asumimos que el cliente envía el shipping_amount o lo calculas con MultiCourier antes.
    const shippingAmount = 5000 // Aquí deberías llamar a tu API de MultiCourier
    const snapshot = this.buildSnapshot(cartItems, { ...data, shipping_amount: shippingAmount })
    const orderNumber = this.generateOrderNumber()
    
    const subtotal = snapshot.totals.subtotal
    const total = snapshot.totals.total

    // D. INICIAR TRANSACCIÓN SQL
    const client = await dataBase.connect()
    
    try {
      await client.query('BEGIN')

      // 1. Crear la Orden Principal
      const order = await OrderModel.createWithClient(client, {
        input: {
          user_id: userId,
          order_number: orderNumber,
          subtotal_amount: subtotal,
          shipping_amount: shippingAmount,
          discount_amount: 0,
          total_amount: total,
          snapshot: snapshot,
          ...data // Aquí entran los datos de envío (dirección, etc.)
        }
      })

      // 2. Crear los Order Items
      await OrderItemModel.createManyWithClient(client, order.id, cartItems)

      // 3. Crear las Reservas de Inventario (Congelar stock por 24 hrs)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // +24 horas

      await InventoryReservationModel.createManyWithClient(client, order.id, cartItems, expiresAt)

      // 4. Vaciar el carrito (Opcional: podrías dejarlo hasta que pague)
      await CartModel.clearWithClient(client, data.cart_id)

      // E. CONFIRMAR TRANSACCIÓN
      await client.query('COMMIT')
      
      return { order, snapshot }

    } catch (error) {
      // Si algo falla, deshacemos todos los cambios
      await client.query('ROLLBACK')
      throw error
    } finally {
      // Siempre liberar el cliente de la base de datos
      client.release()
    }
  }
}