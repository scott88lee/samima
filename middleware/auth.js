module.exports = {
  verifySignIn : (req, res, next) => {  
    if (req.session.loggedIn === true) {
      return next();
    }
    else {
      res.redirect('/login');
    }
  }
}