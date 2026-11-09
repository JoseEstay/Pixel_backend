import { dataBase } from '../config/db.js'

export class CartModel {
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
    const query = `DELETE FROM cart_items WHERE cart_id = $1`
    await client.query(query, [cartId])
  }
}
