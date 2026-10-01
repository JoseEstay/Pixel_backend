import * as z from 'zod'

const productSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'El nombre es obligatorio'
          : 'El nombre debe ser un contexto'
    })
    .trim()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre debe tener como máximo 100 caracteres' }),
  description: z
    .string()
    .trim()
    .max(255, { message: 'La descripción debe tener como máximo 255 caracteres' })
    .optional(),
  price: z.number().positive({ message: 'El precio debe ser un número positivo' }),
  stock: z.number().int().nonnegative({ message: 'El stock debe ser un número entero no negativo' }),
  category_id: z.number().int().positive({ message: 'El ID de categoría debe ser un número entero positivo' }),
  is_active: z.boolean().optional(),
  sku: z.string().trim().max(50, { message: 'El SKU debe tener como máximo 50 caracteres' }).optional(),
  condition: z.string().trim().max(50, { message: 'La condición debe tener como máximo 50 caracteres' }),
  image_url: z.string().url({ message: 'La URL de la imagen debe ser válida' }).optional()
})

const validateProduct = (input) => {
  return productSchema.safeParse(input)
}

export const validateProductPatch = (input) => {
  return productSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar'
    })
    .safeParse(input)
}

export default validateProduct
