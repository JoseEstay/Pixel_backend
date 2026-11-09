export const isAdmin = (req, res, next) => {
  // req.user fue inyectado por tu middleware jwtValidation
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado. Falta el token.' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de administrador.'
    })
  }

  next() // Si es admin, lo deja pasar al controlador
}
