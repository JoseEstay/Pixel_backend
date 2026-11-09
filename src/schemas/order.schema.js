import { z } from 'zod'

// 1. Esquema base para CREAR una orden
export const orderSchema = z.object({
  cart_id: z.string().uuid('ID de carrito inválido.'),
  shipping_recipient_name: z.string().min(3).max(255),
  shipping_phone: z.string().min(8).max(30),
  shipping_address_line1: z.string().min(5).max(255),
  shipping_address_line2: z.string().max(255).optional(),
  shipping_commune: z.string().min(2).max(100),
  shipping_city: z.string().min(2).max(100),
  shipping_region: z.string().min(2).max(100),
  shipping_postal_code: z.string().max(20).optional()
})

// 2. Esquema para ACTUALIZAR una orden (por ejemplo, desde el panel de Admin)
// Usamos .partial() para hacer todos los campos opcionales.
// Pero ojo: al Admin NO le vamos a pedir el cart_id para actualizar el tracking.
// Por eso, es mejor crear un esquema específico para el admin:

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  payment_status: z.enum(['pending', 'confirmed', 'rejected']).optional(),
  tracking_number: z.string().max(100).optional(),
  tracking_url: z.string().url('Debe ser una URL válida').optional(),
  shipping_carrier: z.string().max(50).optional(),
  cancellation_reason: z.string().optional()
})

// Funciones de validación
export function validateOrder (input) {
  return orderSchema.safeParse(input)
}

// Función para validaciones parciales genéricas (si la necesitas)
export function validatePartialOrder (input) {
  return orderSchema.partial().safeParse(input)
}

// Función específica para cuando el Admin actualiza el pedido
export function validateUpdateOrderStatus (input) {
  return updateOrderStatusSchema.safeParse(input)
}
