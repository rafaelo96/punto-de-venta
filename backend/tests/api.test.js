import { jest } from '@jest/globals'

const mockQuery = jest.fn()
const mockPool = {
  query: mockQuery,
  connect: jest.fn(),
  end: jest.fn()
}

jest.unstable_mockModule('../src/db.js', () => ({
  pool: mockPool,
  query: mockQuery,
  initDB: jest.fn()
}))

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(() => 'mock_token'),
    verify: jest.fn(() => ({ id: 1, email: 'test@test.com', negocio_id: 1, rol: 'admin' }))
  }
}))

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn(() => 'hashed_password'),
    compare: jest.fn(() => true)
  }
}))

const { default: app } = await import('../src/index.js')
const request = await import('supertest')

describe('Health Check', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockQuery.mockResolvedValue({ rows: [{ '?column?': 1 }] })
  })

  test('GET /api should return API info', async () => {
    const res = await request.default(app).get('/api')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body).toHaveProperty('version')
    expect(res.body).toHaveProperty('status')
  })

  test('GET /api/health should return health status', async () => {
    const res = await request.default(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('status')
    expect(res.body).toHaveProperty('database')
  })
})

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('POST /api/auth/register should validate email', async () => {
    const res = await request.default(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Test User',
        email: 'invalid_email',
        password: 'password123',
        nombreNegocio: 'Test Business'
      })
    expect(res.status).toBe(400)
    expect(res.body.message).toContain('Email')
  })

  test('POST /api/auth/register should validate password length', async () => {
    const res = await request.default(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Test User',
        email: 'test@test.com',
        password: '123',
        nombreNegocio: 'Test Business'
      })
    expect(res.status).toBe(400)
    expect(res.body.message).toContain('Password')
  })

  test('POST /api/auth/login should validate email', async () => {
    const res = await request.default(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid',
        password: 'password'
      })
    expect(res.status).toBe(400)
    expect(res.body.message).toContain('Email')
  })

  test('POST /api/auth/login should require password', async () => {
    const res = await request.default(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com'
      })
    expect(res.status).toBe(400)
    expect(res.body.message).toContain('Password')
  })
})

describe('Input Validation', () => {
  test('should reject invalid producto data', async () => {
    const res = await request.default(app)
      .post('/api/productos')
      .set('Authorization', 'Bearer mock_token')
      .send({
        nombre: '',
        precio_compra: -10,
        precio_venta: -5
      })
    expect(res.status).toBe(400)
  })

  test('should reject invalid stock adjustment', async () => {
    const res = await request.default(app)
      .patch('/api/productos/1/stock')
      .set('Authorization', 'Bearer mock_token')
      .send({
        cantidad: -1,
        tipo: 'entrada'
      })
    expect(res.status).toBe(400)
  })

  test('should reject invalid stock type', async () => {
    const res = await request.default(app)
      .patch('/api/productos/1/stock')
      .set('Authorization', 'Bearer mock_token')
      .send({
        cantidad: 10,
        tipo: 'invalid'
      })
    expect(res.status).toBe(400)
  })
})