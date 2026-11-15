import { CartModel } from '../models/cart.model.js'
import { ProductModel } from '../models/product.model.js'
import { validateAddToCart, validateUpdateCartItem } from '../schemas/cart.schema.js'

export class CartController {
  // GET /api/cart - Obtiene el carrito del usuario autenticado
  static async getCart (req, res) {
    try {
      const userId = req.user.id
      const cart = await CartModel.getCartDetails(userId)
      return res.status(200).json(cart)
    } catch (error) {
      console.error('Error al obtener carrito:', error)
      return res.status(500).json({ error: error.message || 'Error al obtener carrito' })
    }
  }

  // POST /api/cart/items - Agrega un producto al carrito
  static async addItem (req, res) {
    const validation = validateAddToCart(req.body)
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues })
    }

    const { product_id, quantity } = validation.data
    const userId = req.user.id

    try {
      // 1. Validar que el producto exista y esté activo
      const product = await ProductModel.getById(product_id)
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' })
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          error: `Stock insuficiente. Stock disponible: ${product.stock}`
        })
      }

      // 2. Obtener o crear carrito del usuario
      const cart = await CartModel.getOrCreateCart(userId)

      // 3. Agregar o incrementar el ítem
      const item = await CartModel.addItem({
        cartId: cart.id,
        productId: product_id,
        quantity
      })

      return res.status(201).json({
        message: 'Producto agregado al carrito',
        item
      })
    } catch (error) {
      console.error('Error al agregar ítem al carrito:', error)
      return res.status(500).json({ error: error.message || 'Error al agregar producto' })
    }
  }

  // PATCH /api/cart/items/:id - Actualiza la cantidad de un ítem
  static async updateItem (req, res) {
    const { id } = req.params
    const validation = validateUpdateCartItem(req.body)
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues })
    }

    const { quantity } = validation.data
    const userId = req.user.id

    try {
      const cart = await CartModel.getOrCreateCart(userId)
      const updated = await CartModel.updateItemQuantity({
        cartId: cart.id,
        itemId: id,
        quantity
      })

      if (!updated) {
        return res.status(404).json({ error: 'Ítem no encontrado en el carrito' })
      }

      return res.status(200).json({
        message: 'Cantidad actualizada correctamente',
        item: updated
      })
    } catch (error) {
      console.error('Error al actualizar ítem:', error)
      return res.status(500).json({ error: error.message || 'Error al actualizar cantidad' })
    }
  }

  // DELETE /api/cart/items/:id - Elimina un ítem del carrito
  static async removeItem (req, res) {
    const { id } = req.params
    const userId = req.user.id

    try {
      const cart = await CartModel.getOrCreateCart(userId)
      const deleted = await CartModel.removeItem({
        cartId: cart.id,
        itemId: id
      })

      if (!deleted) {
        return res.status(404).json({ error: 'Ítem no encontrado en el carrito' })
      }

      return res.status(200).json({
        message: 'Producto eliminado del carrito'
      })
    } catch (error) {
      console.error('Error al eliminar ítem:', error)
      return res.status(500).json({ error: error.message || 'Error al eliminar producto' })
    }
  }

  // DELETE /api/cart - Vacía el carrito completo
  static async clear (req, res) {
    const userId = req.user.id

    try {
      const cart = await CartModel.getOrCreateCart(userId)
      await CartModel.clearCart(cart.id)

      return res.status(200).json({
        message: 'Carrito vaciado exitosamente'
      })
    } catch (error) {
      console.error('Error al vaciar carrito:', error)
      return res.status(500).json({ error: error.message || 'Error al vaciar carrito' })
    }
  }
}

