import * as z from 'zod'

const passwordSchema = z.string().refine(
  (password) => Buffer.byteLength(password, 'utf-8') <= 72,
  { message: 'La contraseña no supera los 72 bytes' }
)

const emailSchema = z.string().trim().min(1, { message: 'El correo electrónico es obligatorio' }).email().max(100).lowercase()

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(10, { message: 'La contraseña debe tener al menos 10 caracteres' }),
  fullName: z.string().trim().min(5, { message: 'Nombre es requerido' }).max(50)
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(10, { message: 'La contraseña debe tener al menos 10 caracteres' })
})

const validateLogin = (input) => {
  return loginSchema.safeParse(input)
}

const validateRegister = (input) => {
  return registerSchema.safeParse(input)
}

export { validateLogin, validateRegister }
