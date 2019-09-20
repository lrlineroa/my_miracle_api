var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/api', function(req, res, next) {
  res.json({operation:1})
});

module.exports = router;