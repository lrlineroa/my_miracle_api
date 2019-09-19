var express = require('express');
var router = express.Router();
var Recomendation = require('../models/recomendation')
var appConstants = require('../common/AppConstants')
/* GET home page. */
router.get('/', async function (req, res, next) {
  let recomendations = await Recomendation.find().sort({'createdAt':-1});
  res.render('recomendations/index', { title: 'My Miracle', query: req.query, recomendations });
});
//get api
router.get('/api', async function (req, res, next) {
  let recomendations = await Recomendation.find().sort({'createdAt':-1});
  res.json(recomendations);
});
router.post('/', async (req, res) => {
  let recomendation = new Recomendation(req.body);
  try {
    await recomendation.save();
    res.redirect('/recomendations?operation=created&message=Recomendación creada satisfactoriamente');
  } catch (error) {
    console.log(error)
    let validationError = error.errors[appConstants.database.recomendation.RECOMENDATION]
    if (validationError) {
      res.redirect('/recomendations?operation=failed&message=' + validationError.message);
    }
  }

});

module.exports = router;
