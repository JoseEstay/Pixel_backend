import { jest, describe, it, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '../src/app.js'
import { dataBase } from '../src/config/db.js'


beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/categories', () => {
  it('Should create a new category with status code 201', async () => {
    const newCategory = {
      name: 'Electronics',
      slug: 'electronics'
    }

    const mockCategory = {
      id: 1,
      name: 'Electronics',
      slug: 'electronics'
    }

    jest.spyOn(dataBase, 'query').mockResolvedValue({
      rows: [mockCategory]
    })

    const response = await request(app)
      .post('/api/categories')
      .send(newCategory)

       if (response.status !== 201) {
  console.log("Error devuelto por la API:", response.body);}

    expect(dataBase.query).toHaveBeenCalled()
    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockCategory)

   
  })
});

describe ('GETALL /api/categories',()=>{
  it('Should get all categories with status code 200',async () => {
    const mockCategories = [
      {
        id: 1,
        name: 'Electronics',
        slug: 'electronics'
      },
      {
        id: 2,
        name: 'Books',
        slug: 'books'
      }
    ]

    jest.spyOn(dataBase, 'query').mockResolvedValue({
      rows: mockCategories
    })

    const response = await request(app).get('/api/categories')

    expect(dataBase.query).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockCategories)
  })
});

describe('GETBYID /api/categories', () => {
  it('Should get by ID category with status code 200', async () => {
    const mockCategory = {
      id: 1,
      name: 'Electronics',
      slug: 'electronics'
    }

    jest.spyOn(dataBase, 'query').mockResolvedValue({
      rows: [mockCategory]
    })

    const response = await request(app).get('/api/categories/1')

    expect(dataBase.query).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockCategory)
  })
})

describe('DELETE /api/categories',()=>{
  it('Should delete a category with status code 200', async()=>{
    const mockCategory = {
      id: 1,
      name: 'Electronics',
      slug: 'electronics'
    }
    const expectedResponse = {
      ...mockCategory,
      message: 'Categoria eliminada correctamente'
    }

    jest.spyOn(dataBase, 'query').mockResolvedValue({
      rows: [mockCategory]
    })

    const response = await request(app).delete('/api/categories/1')

    expect(dataBase.query).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
  message: 'Categoria eliminada correctamente'
})
  })
})

describe('PUT /api/categories', () => {
  it('Should update a category with status code 200', async () => {
    const updateData = {
      name: 'Electronics Updated',
      slug: 'electronics-updated'
    }

    const mockCategory = {
      id: 1,
      name: 'Electronics Updated',
      slug: 'electronics-updated'
    }

    jest.spyOn(dataBase, 'query').mockResolvedValue({
      rows: [mockCategory]
    })

    const response = await request(app)
      .put('/api/categories/1')
      .send(updateData) // <---- ¡Importante enviar los datos!

    expect(dataBase.query).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockCategory)
  })
})

describe('PATCH /api/categories', () => {
  it('Should update partially a category with status code 200', async () => {
    const updateData = {
      name: 'Electronics Partial'
    }

    const mockCategory = {
      id: 1,
      name: 'Electronics Partial',
      slug: 'electronics'
    }

    jest.spyOn(dataBase, 'query').mockResolvedValue({
      rows: [mockCategory]
    })

    const response = await request(app)
      .patch('/api/categories/1') // <---- ¡Usar .patch() en lugar de .put()!
      .send(updateData) // <---- ¡Enviar los datos parciales!

    expect(dataBase.query).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockCategory)
  })
})