import jwt from 'jsonwebtoken'

const getCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) return undefined

  const cookie = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))

  if (!cookie) return undefined

  const value = cookie.slice(name.length + 1)
  try {
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}

const jwtValidation = (req, res, next) => {
  const token = getCookieValue(req.headers.cookie, 'jwt')
  if (!token) {
    return res.status(401).json({ error: 'No has iniciado sesión' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('JWT_SECRET no está configurado')
    return res.status(500).json({ error: 'Error interno del servidor' })
  }

  try {
    req.user = jwt.verify(token, secret, { algorithms: ['HS256'] })
    return next()
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' })
  }
}

export { jwtValidation }
