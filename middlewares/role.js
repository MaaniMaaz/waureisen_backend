/**
 * Middleware to allow only admin users.
 */
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access forbidden: Admins only.' });
  };
  
  /**
   * Middleware to allow only regular users.
   */
  exports.isUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
      return next();
    }
    return res.status(403).json({ message: 'Access forbidden: Users only.' });
  };
  
  /**
   * Middleware to allow only provider users.
   */
  exports.isProvider = (req, res, next) => {
    if (req.user && req.user.role === 'provider') {
      return next();
    }
    return res.status(403).json({ message: 'Access forbidden: Providers only.' });
  };
  
  /**
   * Generic middleware that checks if the user's role matches the required role.
   * @param {String} role - The required role (e.g., 'admin', 'user').
   */
  exports.requireRole = (role) => {
    return (req, res, next) => {
      if (req.user && req.user.role === role) {
        return next();
      }
      return res.status(403).json({ message: `Access forbidden: ${role} only.` });
    };
  };


  