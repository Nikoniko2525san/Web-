
module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    res.redirect('/login.html');
  },
  ensureAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.is_admin) {
      return next();
    }
    res.status(403).send('Forbidden');
  }
};
