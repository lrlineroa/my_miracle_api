var express = require('express');
var router = express.Router();
var DailyMessage = require('../models/dailymessage')
var appConstants = require('../common/AppConstants')
var User = require('../models/user')
var axios = require('axios')
const { Expo } = require('expo-server-sdk')
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
    //await dailymessage.save();
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
  if (pushTokens.length > 0) {
    //   let headers = {
    //     host: 'exp.host',
    //     accept: 'application/json',
    //     'accept-encoding': 'gzip, deflate',
    //     'content-type': 'application/json',
    //   }
    //   let url='https://exp.host/--/api/v2/push/send';
    //   let data={
    //     "to": pushTokens[0],
    //     "title":"Tienes un nuevo mensaje diario",
    //     "body": message,
    //   }
    //   axios.post(url,data,headers).then(
    //     (data)=>{
    //       console.log(data.data)
    //     }
    //   )
    let expo = new Expo();
    let messages = [];
    for (let pushToken of pushTokens) {
      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }
      messages.push({
        to: pushToken,
        sound: 'default',
        title: 'Mensaje diario',
        body: message,
      })
    }


    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
      // Send the chunks to the Expo push notification service. There are
      // different strategies you could use. A simple one is to send one chunk at a
      // time, which nicely spreads the load out over time:
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
          // NOTE: If a ticket contains an error code in ticket.details.error, you
          // must handle it appropriately. The error codes are listed in the Expo
          // documentation:
          // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
        } catch (error) {
          console.error(error);
        }
      }
    })();

  }

}

module.exports = router;
