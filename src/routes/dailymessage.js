var express = require('express');
var router = express.Router();
var DailyMessage = require('../models/dailymessage')
var appConstants = require('../common/AppConstants')
var User = require('../models/user')
var axios = require('axios')
/* GET home page. */
router.get('/', async function (req, res, next) {
  let dailymessage = await DailyMessage.find().sort({ 'createdAt': -1 });
  let message = dailymessage[0]
  let user = req.session ? req.session.user : null
  res.render('dailymessage/index', { title: 'My Miracle', query: req.query, message, user });
});
//get api
router.get('/api', async function (req, res, next) {
  let dailymessage = await DailyMessage.find().sort({ 'createdAt': -1 });
  let message = dailymessage[0]
  res.json(message);
});
router.post('/', async (req, res) => {
  let dailymessage = new DailyMessage(req.body);
  sendPushNotification(req.body);
  try {
    //descomentar esto
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
  const { id } = req.params
  await DailyMessage.remove({ _id: id });
  res.redirect('/dailymessage?operation=deleted&message=Mensaje diario eliminado satisfactoriamente');
});


//form to edit
router.get('/edit/:id', async (req, res) => {
  const { id } = req.params
  const message = await DailyMessage.findById(id);
  res.render('dailymessage/edit', { title: 'My Miracle', message })
});

//update
router.post('/edit/:id', async (req, res) => {
  const { id } = req.params
  await DailyMessage.updateOne({ _id: id }, req.body);
  res.redirect('/dailymessage?operation=updated&message=Mensaje diario actualizado satisfactoriamente')
});

async function sendPushNotification(params) {
  let message = params[appConstants.database.dailymessage.DAILY_MESSAGE];
  let users = await User.find();
  let pushTokens = []
  for (user of users) {
    if (user[appConstants.database.user.PUSH_TOKEN]) {
      pushTokens.push(user[appConstants.database.user.PUSH_TOKEN])
    }
  }
  console.log('pushTokens:')
  console.log(pushTokens.length)
  if (pushTokens.length > 0) {
    let notification = {
      subText: "My Miracle",
      title: "Hola tienes un",
      message: "Mensaje diario My Miracle",
      bigText: 'Mensaje diario: ' + message,
      color: "#3F81C5"
    }
    let body = {
      registration_ids: pushTokens,
      time_to_live: 86400,
      collapse_key: "test_type_b",
      delay_while_idle: false,

      notification: {},
      data: notification
    }
    let headers = {
      'Authorization': process.env.FCM_TOKEN || "token",
      'content-type': 'application/json',
    }
    let url = 'https://fcm.googleapis.com/fcm/send';
    axios(
      {
        url,
        method: 'post',
        headers,
        data: body
      }
    ).then(
      (data) => {
        console.log(data.data)
      }
    ).catch(error => {
      console.log(error.response.statusText)
    })

  }

}

module.exports = router;
