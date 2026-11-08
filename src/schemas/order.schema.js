import { z } from "zod";

export const orderSchema = z.object({
  shipping_recipient_name: z
    .string({
      required_error: "El nombre del destinatario es obligatorio.",
    })
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(255, "El nombre es demasiado largo."),

  shipping_phone: z
    .string({
      required_error: 'El teléfono de contacto es obligatorio.',
    })
    .min(8, "El número de teléfono debe tener al menos 8 dígitos.")
    .max(30, "El teléfono es demasiado largo."),

  shipping_address_line1: z
    .string({
      required_error: "La dirección (calle y número) es obligatoria.",
    })
    .min(5, "La dirección es demasiado corta.")
    .max(255, "La dirección es demasiado larga."),

  shipping_address_line2: z
    .string()
    .max(255, "El departamento/casa/oficina es demasiado largo.")
    .optional(),

  shipping_commune: z
    .string({
      required_error: 'La comuna es obligatoria.',
    })
    .min(2, 'Ingrese una comuna válida.')
    .max(100, 'El nombre de la comuna es demasiado largo.'),

  shipping_city: z
    .string({
      required_error: 'La ciudad es obligatoria.',
    })
    .min(2, 'Ingrese una ciudad válida.')
    .max(100, 'El nombre de la ciudad es demasiado largo.'),

  shipping_region: z
    .string({
      required_error: 'La región es obligatoria.',
    })
    .min(2, 'Ingrese una región válida.')
    .max(100, 'El nombre de la región es demasiado largo.'),

  shipping_postal_code: z
    .string()
    .max(20, 'El código postal es demasiado largo.')
    .optional()
})

export function validateOrder (input) {
  return orderSchema.safeParse(input)
}

export function validatePartialOrder(input) {
  return orderSchema.partial().safeParse(input)
}
