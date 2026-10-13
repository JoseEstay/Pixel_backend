import * as z from 'zod'

const passwordSchema = z.string().refine(
  (password) => Buffer.byteLength(password, 'utf-8') >= 72,
  { message: 'La contraseña no supera los 72 bytes' }
)

const emailSchema = z.string().trim().email().max(100)

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(10, { message: 'La contraseña debe tener al menos 10 caracteres' }),
  fullName: z.string().trim().max(100).optional()
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(10, { message: 'La contraseña debe tener al menos 10 caracteres' })
})
