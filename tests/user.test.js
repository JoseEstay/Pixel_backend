import { jest } from '@jest/globals'
import request from 'supertest'
import { app } from '../src/app.js'
import { UserModel } from '../src/models/user.model.js'
import jwt from 'jsonwebtoken'

const mockUserId = '11111111-1111-1111-1111-111111111111'
const token = jwt.sign({ id: mockUserId, role: 'customer' }, process.env.JWT_SECRET || 'test_secret')

describe('User Profile Endpoints (/api/users)', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/users/profile', () => {
    it('debe responder 401 si no hay token de autenticación', async () => {
      const res = await request(app).get('/api/users/profile')
      expect(res.status).toBe(401)
    })

    it('debe responder 200 con los datos del perfil del usuario autenticado', async () => {
      const mockProfile = {
        id: mockUserId,
        email: 'juan@example.com',
        full_name: 'Juan Pérez',
        role: 'customer',
        auth_provider: 'local',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z'
      }

      jest.spyOn(UserModel, 'findById').mockResolvedValue(mockProfile)

      const res = await request(app)
        .get('/api/users/profile')
        .set('Cookie', [`jwt=${token}`])

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockProfile)
      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId)
    })
  })

  describe('PUT /api/users/profile', () => {
    it('debe responder 200 al actualizar el nombre del usuario', async () => {
      const updatedUser = {
        id: mockUserId,
        email: 'juan@example.com',
        full_name: 'Juan Carlos Pérez',
        role: 'customer',
        auth_provider: 'local',
        updated_at: '2026-01-02T00:00:00Z'
      }

      jest.spyOn(UserModel, 'updateProfile').mockResolvedValue(updatedUser)

      const res = await request(app)
        .put('/api/users/profile')
        .set('Cookie', [`jwt=${token}`])
        .send({ fullName: 'Juan Carlos Pérez' })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Perfil actualizado exitosamente')
      expect(res.body.user.full_name).toBe('Juan Carlos Pérez')
    })
  })
})

