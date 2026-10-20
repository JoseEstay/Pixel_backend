import { ACCEPTED_ORIGINS } from './cors.js'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// Las solicitudes de navegador que cambian estado deben venir del frontend permitido.
// Los clientes de API como Postman suelen no enviar Origin y pueden seguir probando la API.
const csrfOriginValidation = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next()

  const origin = req.get('origin')
  const fetchSite = req.get('sec-fetch-site')

  if (fetchSite === 'cross-site' || (origin && !ACCEPTED_ORIGINS.includes(origin))) {
    return res.status(403).json({ error: 'Origen no permitido para esta operación' })
  }

  return next()
}

export { csrfOriginValidation }
