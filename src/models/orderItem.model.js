export class OrderItemModel {
  static async createManyWithClient (client, orderId, cartItems) {
    // Armamos una query dinámica para insertar varios productos de una vez
    const values = []
    const placeholders = []
    
    cartItems.forEach((item, index) => {
      const offset = index * 5
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`)
      values.push(orderId, item.product_id, item.name, item.sku, item.quantity)
      // Nota: Asumo que tienes unit_price en el insert, si no, ajusta la query.
    })

    const query = `
      INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price)
      VALUES ${placeholders.join(', ')}
    `
    // Necesitamos agregar el precio unitario a los values
    // (Ajuste rápido para que el query coincida con los valores)
    const finalValues = []
    cartItems.forEach((item) => {
        finalValues.push(orderId, item.product_id, item.name, item.sku, item.quantity, item.price)
    })
    
    // Query corregida con 6 columnas
    const finalPlaceholders = cartItems.map((_, i) => {
        const o = i * 6
        return `($${o+1}, $${o+2}, $${o+3}, $${o+4}, $${o+5}, $${o+6})`
    }).join(', ')

    const finalQuery = `
      INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price)
      VALUES ${finalPlaceholders}
    `

    await client.query(finalQuery, finalValues)
  }
}