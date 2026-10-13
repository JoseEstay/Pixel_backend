import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

export const hashPassword = (password) => {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export const verifyPassword = (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash)
}
