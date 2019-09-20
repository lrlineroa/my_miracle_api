var express = require('express');
var router = express.Router();
var Recomendation = require('../models/recomendation')
var appConstants = require('../common/AppConstants')
/* GET home page. */
router.get('/', async function (req, res, next) {
  let recomendations = await Recomendation.find().sort({ 'createdAt': -1 });
  let user = req.session ? req.session.user : null
  if(user){
    res.render('recomendations/index', { title: 'My Miracle', query: req.query, recomendations, user });
  }else{
     res.redirect('/');
  }
  
});
//get api
router.get('/api', async function (req, res, next) {
  let recomendations = await Recomendation.find().sort({ 'createdAt': -1 });
  let dailymessage = await DailyMessage.find().sort({'createdAt':-1});
  let message=dailymessage[0]
  res.json({recomendations,message});
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

//delete
//delete
router.get('/delete/:id', async (req, res) => {
  const {id} =req.params
  await Recomendation.remove({_id:id});
  res.redirect('/recomendations?operation=deleted&message=Recomendación eliminada satisfactoriamente');
});


//form to edit
router.get('/edit/:id',async (req,res)=>{
  const {id} =req.params
  const recomendation=await Recomendation.findById(id);
  res.render('recomendations/edit',{title: 'My Miracle', recomendation})
});

//update
router.post('/edit/:id',async (req,res)=>{
  const {id} =req.params
  await Recomendation.updateOne({_id:id},req.body);
  res.redirect('/recomendations?operation=updated&message=Recomendación actualizada satisfactoriamente')
});

module.exports = router;
