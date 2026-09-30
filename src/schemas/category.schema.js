import * as z from 'zod'

const categorySchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'El nombre es  obligatorio'
          : 'La categoria debe ser un contexto'
    })
    .trim()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre debe tener como máximo 100 caracteres' }),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    error:
      'Formato de slug invalido. Usa minusculas, números y guiones. Ejemplo: "mi-categoria"'
  }),
  description: z
    .string()
    .trim()
    .max(255, { message: 'La descripción debe tener como máximo 255 caracteres' })
    .optional()
})

const validateCategory = (input) => {
  return categorySchema.safeParse(input)
}

export default validateCategory
