import validateCategory, { validateCategoryPatch } from '../schemas/category.schema.js'
import { CategoryModel } from '../models/category.model.js'

export class categoryController {
  static async create (req, res) {
    const result = validateCategory(req.body)

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues })
    }

    try {
      const newCategory = await CategoryModel.create({ input: result.data })
      return res.status(201).json(newCategory)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  // GET ALL
  static async getAll (_req, res) {
    try {
      const categories = await CategoryModel.getAll()
      return res.status(200).json(categories)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  // GET BY ID
  static async getById (req, res) {
    const { id } = req.params
    try {
      const category = await CategoryModel.getById(id)
      if (!category) {
        return res.status(404).json({ error: 'Categoria no encontrada' })
      }
      return res.status(200).json(category)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  // DELETE
  static async delete (req, res) {
    const { id } = req.params
    try {
      const category = await CategoryModel.getById(id)
      if (!category) {
        return res.status(404).json({ error: 'Categoria no encontrada' })
      }
      await CategoryModel.delete(id)
      return res.status(200).json({ message: 'Categoria eliminada correctamente' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  // UPDATE
  static async update (req, res) {
    const { id } = req.params
    const result = validateCategory(req.body)

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues })
    }

    try {
      const updatedCategory = await CategoryModel.update(id, { input: result.data })
      if (!updatedCategory) {
        return res.status(404).json({ error: 'Categoria no encontrada' })
      }
      return res.status(200).json(updatedCategory)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }

  static async patch (req, res) {
    const { id } = req.params
    const result = validateCategoryPatch(req.body)

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues })
    }

    try {
      const updatedCategory = await CategoryModel.updatePartial(id, { input: result.data })
      if (!updatedCategory) {
        return res.status(404).json({ error: 'Categoria no encontrada' })
      }
      return res.status(200).json(updatedCategory)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }
}
