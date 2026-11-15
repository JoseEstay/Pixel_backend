import * as z from 'zod'

const passwordSchema = z.string().refine(
  (password) => Buffer.byteLength(password, 'utf-8') <= 72,
  { message: 'La contraseña no supera los 72 bytes' }
)

const emailSchema = z.string().trim().min(1, { message: 'El correo electrónico es obligatorio' }).email().max(100).lowercase()

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(10, { message: 'La contraseña debe tener al menos 10 caracteres' }),
  fullName: z.string().trim().min(5, { message: 'Nombre es requerido' }).max(50),
  role: z.enum(['customer', 'admin']).optional().default('customer')
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(10, { message: 'La contraseña debe tener al menos 10 caracteres' })
})

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }).max(50).optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.min(10, { message: 'La nueva contraseña debe tener al menos 10 caracteres' }).optional()
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  return true
}, {
  message: 'Debes ingresar tu contraseña actual para establecer una nueva contraseña',
  path: ['currentPassword']
}).refine((data) => {
  return data.fullName !== undefined || data.newPassword !== undefined
}, {
  message: 'Debes proporcionar al menos un campo para actualizar (fullName o newPassword)'
})

const validateLogin = (input) => {
  return loginSchema.safeParse(input)
}

const validateRegister = (input) => {
  return registerSchema.safeParse(input)
}

export const validateUpdateProfile = (input) => {
  return updateProfileSchema.safeParse(input)
}

export { validateLogin, validateRegister }
