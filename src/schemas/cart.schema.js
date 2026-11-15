import { z } from 'zod'

export const addToCartSchema = z.object({
  product_id: z.string().uuid({ message: 'El product_id debe ser un UUID válido' }),
  quantity: z.number().int({ message: 'La cantidad debe ser un número entero' }).positive({ message: 'La cantidad debe ser mayor a 0' }).default(1)
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int({ message: 'La cantidad debe ser un número entero' }).positive({ message: 'La cantidad debe ser mayor a 0' })
})

export function validateAddToCart (input) {
  return addToCartSchema.safeParse(input)
}

export function validateUpdateCartItem (input) {
  return updateCartItemSchema.safeParse(input)
}

