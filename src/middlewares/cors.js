import cors from 'cors'

const ACCEPTED_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:3000'
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => {
  return cors({
    origin: (origin, callback) => {
      if (!origin || acceptedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    }
  })
}
