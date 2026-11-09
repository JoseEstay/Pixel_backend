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
}
