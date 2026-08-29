import jwt from 'jsonwebtoken';

/**
 * Verify the JWT token from the Authorization header.
 * Attaches decoded user to `req.user`.
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;           // { id, role, email }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/** Restrict to Admin only */
export function isAdmin(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

/** Restrict to Admin or Manager */
export function isManager(req, res, next) {
  if (!['Admin', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Manager access required' });
  }
  next();
}
