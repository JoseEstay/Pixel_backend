import { dataBase } from '../config/db.js'

export class CartModel {
  // Obtiene el carrito activo del usuario o crea uno nuevo si no existe
  static async getOrCreateCart (userId) {
    const existing = await dataBase.query(
      'SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = $1 LIMIT 1',
      [userId]
    )

    if (existing.rows.length > 0) {
      return existing.rows[0]
    }

    const created = await dataBase.query(
      'INSERT INTO carts (id, user_id) VALUES (gen_random_uuid(), $1) RETURNING *',
      [userId]
    )
    return created.rows[0]
  }

  // Obtiene los ítems del carrito con detalles de producto y cálculos
  static async getCartDetails (userId) {
    const cart = await this.getOrCreateCart(userId)

    const query = `
      SELECT 
        ci.id as item_id,
        ci.product_id,
        p.name,
        p.sku,
        p.price,
        p.image_url,
        p.stock,
        ci.quantity,
        (p.price * ci.quantity) as item_total
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.id ASC
    `
    const itemsResult = await dataBase.query(query, [cart.id])
    const items = itemsResult.rows

    const subtotal = items.reduce((acc, item) => acc + Number(item.item_total), 0)
    const totalItems = items.reduce((acc, item) => acc + Number(item.quantity), 0)

    return {
      cart_id: cart.id,
      user_id: cart.user_id,
      items,
      subtotal,
      total_items: totalItems
    }
  }

  // Agrega un ítem o incrementa cantidad si ya existe
  static async addItem ({ cartId, productId, quantity }) {
    const existingItem = await dataBase.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    )

    if (existingItem.rows.length > 0) {
      const newQuantity = existingItem.rows[0].quantity + quantity
      const updated = await dataBase.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
        [newQuantity, existingItem.rows[0].id]
      )
      return updated.rows[0]
    }

    const inserted = await dataBase.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [cartId, productId, quantity]
    )
    return inserted.rows[0]
  }

  // Actualiza la cantidad de un ítem existente
  static async updateItemQuantity ({ cartId, itemId, quantity }) {
    const updated = await dataBase.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3 RETURNING *',
      [quantity, itemId, cartId]
    )
    return updated.rows[0]
  }

  // Elimina un ítem específico del carrito
  static async removeItem ({ cartId, itemId }) {
    const deleted = await dataBase.query(
      'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING *',
      [itemId, cartId]
    )
    return deleted.rows[0]
  }

  // Vacía el carrito
  static async clearCart (cartId) {
    await dataBase.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId])
  }

  // Métodos de soporte para el proceso de órdenes (mantienen compatibilidad)
  static async getItemsWithProducts (cartId) {
    const query = `
      SELECT 
        ci.product_id, 
        p.name, 
        p.sku, 
        p.price, 
        p.stock, 
        ci.quantity
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `
    const result = await dataBase.query(query, [cartId])
    return result.rows
  }

  static async clearWithClient (client, cartId) {
    const query = 'DELETE FROM cart_items WHERE cart_id = $1'
    await client.query(query, [cartId])
  }
}
