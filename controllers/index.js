const products = require('../models/products');
const Users = require('../models/users');

module.exports = {

  getRoot: (req, res) => {
    res.redirect('/sales');
  },

  serveLogin: (req, res) => {
    console.log("Serving log-in")
    res.render('root/login', { layout: "unsecured" })
  },

  serveRegister: (req, res) => {
    console.log("Serving sign-up")
    res.render('root/signup', { layout: "unsecured" })
  },

  authUser: (req, res) => {
    let u = req.body;

    if (u.username == 'admin' && u.password == 'qweqwe') {
      req.session.loggedIn = true;

      req.session.save(function (err) { //Forces session data to save
        if (err) return next(err)
        res.redirect('/sales')
      })
    } else {
      res.render('root/login', { message: "Invalid name / password" })
    }
  },

  registerUser: async (req, res) => {
    console.log(req.body);
    const bcrypt = require('bcrypt');

    let exist = await Users.findUserByUsername(req.body.username);
    if (exist) {
      res.status(400).json({ Success: false, Message: 'User already exist.' });
      return;
    }

    try {

      let hash = await bcrypt.hash(req.body.password, 8);
      let user = {
        username: req.body.username,
        email: req.body.email,
        password_hash: hash
      }
      console.log(user)
      await Users.create(user);
      res.status(200).json({ Success: true, Message: 'User created.' });
      // await mailer.sendEmail(req.body.email);
    } catch (err) {
      res.status(400).json({ Success: false, Message: err.message });
      return;
    }
  },

  logOut: (req, res) => {
    req.session.loggedIn = false;
    res.redirect('/login')
  },

  getSuppliers: async (req, res) => {
    try {
      let suppliers_list = await products.listSuppliers();
      res.render("inventory/suppliers", { supplier: suppliers_list, layout: "invLayout" });
    }
    catch (err) {
      console.log(err);
      res.render("error", { message: err.message });
    }
  },

  addSupplier: async (req, res) => {
    try {
      let _ = await products.addSupplier(req.body);
      if (_) {
        res.redirect("/suppliers")
      } else {
        res.render("error", { message: "Unknown error" })
      }
    }
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message });
    }

  },

  testPost: (req, res) => {
    console.log(req.body);
    res.send(req.body);
  },

  testConsole: (req, res) => {
    console.log(req.body);
    res.send({ msg: "ok" });
  }
}