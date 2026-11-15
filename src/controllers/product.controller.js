import validateProduct, { validateProductPatch } from '../schemas/product.schema.js'
import { ProductModel } from '../models/product.model.js'

export class productController {
  // POST /products (Protegido: solo Administrador)
  static async create (req, res) {
    const result = validateProduct(req.body)

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues })
    }

    try {
      // Capturamos el ID del administrador autenticado según el ERD (created_by_user_id)
      const createdByUserId = req.user ? req.user.id : null
      const newProduct = await ProductModel.create({
        input: result.data,
        createdByUserId
      })
      return res.status(201).json(newProduct)
    } catch (error) {
      console.error('Error al crear producto:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  // GET /products (Público, con soporte de filtros: category_id, condition, search)
  static async getAll (req, res) {
    try {
      const { category_id, condition, search } = req.query
      const products = await ProductModel.getAll({
        category_id: category_id ? Number(category_id) : undefined,
        condition,
        search
      })
      return res.status(200).json(products)
    } catch (error) {
      console.error('Error al obtener productos:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  // GET /products/:id (Público)
  static async getById (req, res) {
    const { id } = req.params
    try {
      const product = await ProductModel.getById(id)
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' })
      }
      return res.status(200).json(product)
    } catch (error) {
      console.error('Error al obtener producto por ID:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  // DELETE /products/:id (Protegido: solo Administrador)
  static async delete (req, res) {
    const { id } = req.params
    try {
      const product = await ProductModel.getById(id)
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' })
      }
      await ProductModel.delete(id)
      return res.status(200).json({ message: 'Producto eliminado correctamente' })
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  // PUT /products/:id (Protegido: solo Administrador)
  static async update (req, res) {
    const { id } = req.params
    const result = validateProduct(req.body)

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues })
    }

    try {
      const updateProduct = await ProductModel.update(id, { input: result.data })
      if (!updateProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' })
      }
      return res.status(200).json(updateProduct)
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  // PATCH /products/:id (Protegido: solo Administrador)
  static async patch (req, res) {
    const { id } = req.params
    const result = validateProductPatch(req.body)

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues })
    }

    try {
      const updatedProduct = await ProductModel.updatePartial(id, { input: result.data })
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' })
      }
      return res.status(200).json(updatedProduct)
    } catch (error) {
      console.error('Error al actualizar producto parcialmente:', error)
      return res.status(500).json({ error: error.message })
    }
  }
}
