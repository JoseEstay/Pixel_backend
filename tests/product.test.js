import { jest } from '@jest/globals'
import request from 'supertest'
import { app } from '../src/app.js'
import { ProductModel } from '../src/models/product.model.js'
import jwt from 'jsonwebtoken'

const adminId = '99999999-9999-9999-9999-999999999999'
const customerId = '11111111-1111-1111-1111-111111111111'

const adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET || 'test_secret')
const customerToken = jwt.sign({ id: customerId, role: 'customer' }, process.env.JWT_SECRET || 'test_secret')

describe('Product Endpoints (/api/products)', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/products (Público y con filtros)', () => {
    it('debe responder 200 y la lista de productos sin requerir autenticación', async () => {
      const mockProducts = [
        {
          id: 'prod-uuid-1',
          name: 'GameBoy Color',
          sku: 'GBC-001',
          price: 79990,
          currency: 'CLP',
          stock: 5,
          condition: 'usado',
          category_name: 'Consolas'
        }
      ]

      jest.spyOn(ProductModel, 'getAll').mockResolvedValue(mockProducts)

      const res = await request(app).get('/api/products')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockProducts)
      expect(ProductModel.getAll).toHaveBeenCalledWith({
        category_id: undefined,
        condition: undefined,
        search: undefined
      })
    })

    it('debe pasar los filtros de consulta (category_id, condition, search) al modelo', async () => {
      jest.spyOn(ProductModel, 'getAll').mockResolvedValue([])

      const res = await request(app)
        .get('/api/products?category_id=2&condition=nuevo&search=nintendo')

      expect(res.status).toBe(200)
      expect(ProductModel.getAll).toHaveBeenCalledWith({
        category_id: 2,
        condition: 'nuevo',
        search: 'nintendo'
      })
    })
  })

  describe('POST /api/products (Protección y campos ERD)', () => {
    const validProductInput = {
      name: 'Nintendo 64',
      description: 'Consola retro clásica',
      price: 120000,
      currency: 'CLP',
      stock: 3,
      category_id: 1,
      condition: 'usado',
      sku: 'N64-001'
    }

    it('debe rechazar con 401 si no hay token de autenticación', async () => {
      const res = await request(app)
        .post('/api/products')
        .send(validProductInput)

      expect(res.status).toBe(401)
    })

    it('debe rechazar con 403 si el usuario autenticado no es administrador', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', [`jwt=${customerToken}`])
        .send(validProductInput)

      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Acceso denegado. Se requieren permisos de administrador.')
    })

    it('debe crear el producto con 201 y guardar created_by_user_id si es admin', async () => {
      const createdProduct = {
        id: 'new-product-uuid',
        ...validProductInput,
        created_by_user_id: adminId
      }

      jest.spyOn(ProductModel, 'create').mockResolvedValue(createdProduct)

      const res = await request(app)
        .post('/api/products')
        .set('Cookie', [`jwt=${adminToken}`])
        .send(validProductInput)

      expect(res.status).toBe(201)
      expect(res.body).toEqual(createdProduct)
      expect(ProductModel.create).toHaveBeenCalledWith({
        input: expect.objectContaining({
          name: 'Nintendo 64',
          currency: 'CLP'
        }),
        createdByUserId: adminId
      })
    })
  })
})
