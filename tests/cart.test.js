import { jest } from '@jest/globals'
import request from 'supertest'
import { app } from '../src/app.js'
import { CartModel } from '../src/models/cart.model.js'
import { ProductModel } from '../src/models/product.model.js'
import jwt from 'jsonwebtoken'

const mockUserId = '11111111-1111-1111-1111-111111111111'
const token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET || 'test_secret')

describe('Cart Endpoints (/api/cart)', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/cart', () => {
    it('debe responder 401 si no hay sesión iniciada', async () => {
      const res = await request(app).get('/api/cart')
      expect(res.status).toBe(401)
    })

    it('debe responder 200 y el detalle del carrito para un usuario autenticado', async () => {
      const mockCartDetails = {
        cart_id: 'cart-uuid-1',
        user_id: mockUserId,
        items: [
          {
            item_id: 1,
            product_id: 'prod-uuid-1',
            name: 'Teclado Gamer',
            sku: 'KB-001',
            price: 50000,
            quantity: 2,
            item_total: 100000
          }
        ],
        subtotal: 100000,
        total_items: 2
      }

      jest.spyOn(CartModel, 'getCartDetails').mockResolvedValue(mockCartDetails)

      const res = await request(app)
        .get('/api/cart')
        .set('Cookie', [`jwt=${token}`])

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockCartDetails)
      expect(CartModel.getCartDetails).toHaveBeenCalledWith(mockUserId)
    })
  })

  describe('POST /api/cart/items', () => {
    it('debe responder 201 al agregar un producto válido con stock', async () => {
      const validProductId = 'f6980579-72a9-4de8-b043-1ffb01639922'

      jest.spyOn(ProductModel, 'getById').mockResolvedValue({
        id: validProductId,
        name: 'Mouse Pro',
        stock: 10
      })

      jest.spyOn(CartModel, 'getOrCreateCart').mockResolvedValue({
        id: 'cart-uuid-1',
        user_id: mockUserId
      })

      jest.spyOn(CartModel, 'addItem').mockResolvedValue({
        id: 1,
        cart_id: 'cart-uuid-1',
        product_id: validProductId,
        quantity: 1
      })

      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', [`jwt=${token}`])
        .send({ product_id: validProductId, quantity: 1 })

      expect(res.status).toBe(201)
      expect(res.body.message).toBe('Producto agregado al carrito')
      expect(res.body.item.product_id).toBe(validProductId)
    })
  })
})
