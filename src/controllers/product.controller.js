import validateProduct, { validateProductPatch } from '../schemas/product.schema.js'
import { ProductModel } from '../models/product.model.js'

export class productController {
  static async create (req, res) {
    const result = validateProduct(req.body)

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues })
    }

    try {
      const newProduct = await ProductModel.create({ input: result.data })
      return res.status(201).json(newProduct)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  // GET ALL
  static async getAll (req, res) {
    try {
      const products = await ProductModel.getAll()
      return res.status(200).json(products)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  // GET BY ID
  static async getById (req, res) {
    const { id } = req.params
    try {
      const product = await ProductModel.getById(id)
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' })
      }
      return res.status(200).json(product)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  // DELETE
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
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  // UPDATE
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
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  // PATCH: actualizar solo los campos enviados
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
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }
}
