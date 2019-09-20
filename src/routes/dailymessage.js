var express = require('express');
var router = express.Router();
var DailyMessage = require('../models/dailymessage')
var appConstants = require('../common/AppConstants')
/* GET home page. */
router.get('/', async function (req, res, next) {
  let dailymessage = await DailyMessage.find().sort({'createdAt':-1});
  let message=dailymessage[0]
  let user=req.session ?req.session.user:null
  res.render('dailymessage/index', { title: 'My Miracle', query: req.query, message,user });
});
//get api
router.get('/api', async function (req, res, next) {
  let dailymessage = await DailyMessage.find().sort({'createdAt':-1});
  let message=dailymessage[0]
  res.json(message);
});
router.post('/', async (req, res) => {
  let dailymessage = new DailyMessage(req.body);
  try {
    await dailymessage.save();
    res.redirect('/dailymessage?operation=created&message=Mensaje diario creado satisfactoriamente');
  } catch (error) {
    console.log(error)
    let validationError = error.errors[appConstants.database.recomendation.RECOMENDATION]
    if (validationError) {
      res.redirect('/recomendations?operation=failed&message=' + validationError.message);
    }
  }

});

//delete
//delete
router.get('/delete/:id', async (req, res) => {
  const {id} =req.params
  await DailyMessage.remove({_id:id});
  res.redirect('/dailymessage?operation=deleted&message=Mensaje diario eliminado satisfactoriamente');
});


//form to edit
router.get('/edit/:id',async (req,res)=>{
  const {id} =req.params
  const message=await DailyMessage.findById(id);
  res.render('dailymessage/edit',{title: 'My Miracle', message})
});

//update
router.post('/edit/:id',async (req,res)=>{
  const {id} =req.params
  await DailyMessage.updateOne({_id:id},req.body);
  res.redirect('/dailymessage?operation=updated&message=Mensaje diario actualizado satisfactoriamente')
});


module.exports = router;
