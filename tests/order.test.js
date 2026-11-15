import { jest } from '@jest/globals'
import request from 'supertest'
import { app } from '../src/app.js'
import { OrderModel } from '../src/models/order.model.js'
import { OrderItemModel } from '../src/models/orderItem.model.js'
import jwt from 'jsonwebtoken'

const mockUserId = '11111111-1111-1111-1111-111111111111'
const customerToken = jwt.sign({ id: mockUserId, role: 'customer' }, process.env.JWT_SECRET || 'test_secret')
const adminToken = jwt.sign({ id: '99999999-9999-9999-9999-999999999999', role: 'admin' }, process.env.JWT_SECRET || 'test_secret')

describe('Order Endpoints (/api/orders)', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/orders/my-orders', () => {
    it('debe responder 401 si no hay token', async () => {
      const res = await request(app).get('/api/orders/my-orders')
      expect(res.status).toBe(401)
    })

    it('debe responder 200 con el historial de pedidos del usuario', async () => {
      const mockOrders = [
        {
          id: 'order-uuid-1',
          order_number: 'OP-20261114-A1B2',
          total_amount: 55000,
          status: 'pending'
        }
      ]

      jest.spyOn(OrderModel, 'findByUserId').mockResolvedValue(mockOrders)

      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Cookie', [`jwt=${customerToken}`])

      expect(res.status).toBe(200)
      expect(res.body.orders).toEqual(mockOrders)
      expect(OrderModel.findByUserId).toHaveBeenCalledWith(mockUserId)
    })
  })

  describe('GET /api/orders/:id', () => {
    it('debe responder 404 si la orden no existe', async () => {
      jest.spyOn(OrderModel, 'findById').mockResolvedValue(null)

      const res = await request(app)
        .get('/api/orders/unknown-order')
        .set('Cookie', [`jwt=${customerToken}`])

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Orden no encontrada')
    })

    it('debe responder 200 con la orden y sus items si pertenece al usuario', async () => {
      const mockOrder = {
        id: 'order-uuid-1',
        user_id: mockUserId,
        order_number: 'OP-20261114-A1B2',
        status: 'pending'
      }

      const mockItems = [
        { id: 1, product_name: 'Teclado', quantity: 1, unit_price: 50000 }
      ]

      jest.spyOn(OrderModel, 'findById').mockResolvedValue(mockOrder)
      jest.spyOn(OrderItemModel, 'getByOrderId').mockResolvedValue(mockItems)

      const res = await request(app)
        .get('/api/orders/order-uuid-1')
        .set('Cookie', [`jwt=${customerToken}`])

      expect(res.status).toBe(200)
      expect(res.body.order).toEqual(mockOrder)
      expect(res.body.items).toEqual(mockItems)
    })
  })

  describe('Admin Endpoints (/api/admin/orders)', () => {
    it('debe responder 200 al marcar orden como entregada', async () => {
      const deliveredOrder = {
        id: 'order-uuid-1',
        status: 'delivered'
      }

      jest.spyOn(OrderModel, 'markAsDelivered').mockResolvedValue(deliveredOrder)

      const res = await request(app)
        .patch('/api/admin/orders/order-uuid-1/deliver')
        .set('Cookie', [`jwt=${adminToken}`])

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Orden marcada como entregada exitosamente.')
      expect(res.body.order).toEqual(deliveredOrder)
    })

    it('debe responder 200 al disparar manualmente la limpieza de reservas expiradas', async () => {
      const { InventoryReservationModel } = await import('../src/models/inventoryReservation.model.js')
      jest.spyOn(InventoryReservationModel, 'releaseExpiredReservations').mockResolvedValue({
        releasedReservationsCount: 3,
        cancelledOrdersCount: 2
      })

      const res = await request(app)
        .post('/api/admin/orders/cleanup-expired')
        .set('Cookie', [`jwt=${adminToken}`])

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Limpieza de reservas expiradas ejecutada correctamente.')
      expect(res.body.releasedReservationsCount).toBe(3)
      expect(res.body.cancelledOrdersCount).toBe(2)
    })
  })
})

