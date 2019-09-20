var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let user= req.session ? req.session.user :null
  res.render('index', { title: 'My Miracle', query:req.query, user });
});

module.exports = router;
