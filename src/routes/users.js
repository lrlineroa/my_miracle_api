var express = require('express');
var router = express.Router();
var User = require('../models/user')
var key = require('./key')
var jwt = require('jsonwebtoken')
var axios = require('axios')
var appConstats=require('../common/AppConstants')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
//register a user Create
router.post('/api', async (req, res) => {
  try {
    let user = new User(req.body)
    await user.save();
    let data2Login = {
      email: user.email,
      password: req.body.password
    }
    let response = await axios.post(req.protocol + '://' + req.headers.host + '/users/api/auth/signin', data2Login)
    if (response.data.token) {
      res.json({ user, token: response.data.token })
    } else {
      res.json(user)
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al Registrarse', details: error })
  }
});
//login //api
router.post('/api/auth/signin', function (req, res) {
  User.findOne({ email: req.body.email }).then((user) => {
    user.comparePassword(req.body.password, async (err, isMatch) => {
      if (isMatch) {
        user[appConstats.database.user.PUSH_TOKEN]=req.body[appConstats.database.user.PUSH_TOKEN]
        await user.save();
        var token = jwt.sign({ userId: user.id }, key.tokenKey);
        res.status(200).json({
          user,
          token
        })
      }
      else {
        res.status(400).json({ message: 'Invalid Password/Username' });
      }
    })
  }).catch((err) => {
    res.status(400).json({ message: 'Invalid Password/Username', details: err });
  })
})

//login //api
router.post('/web/auth/signin', function (req, res) {
  User.findOne({ email: req.body.email }).then((user) => {
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch) {
        if(user.admin){
          req.session.user = user
          res.redirect('/?operation=logged&message=Logueado satisfactoriamente');
        }else{
          res.redirect('/?operation=failed&message=No estás autorizado.');
        }
      }
      else {
        res.redirect('/?operation=failed&message=No Encontramos coincidencias');
      }
    })
  }).catch((err) => {
    res.redirect('/?operation=failed&message=No Encontramos coincidencias');
  })
})

// GET /logout
router.get('/web/auth/signout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
