var express = require('express');
var router = express.Router();
var nodeMailer = require('nodemailer')
var request=require('request')
/* GET home page. */
router.post('/mail/view', (req, res) => {
  res.render('mailers/consultation_mail', {
    data: req.body        
  })
});
router.post('/api', function (req, res, next) {
  var options = {
    uri: 'http://localhost:3000/contact/mail/view',
    method: 'POST',
    json: req.body // All the information that needs to be sent
  };
  request(options, function (error, response, body) {
    if (error) console.log(error)
    let transporter = nodeMailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_MAIL || 'cerezabusiness@gmail.com',
        pass: process.env.EMAIL_PASS || 'cerezabusin17250807',
      }
    });
    let mailOptions = {
      from: '"MyMiracle.eu" <info@gmail.com>', // sender address
      to: 'leonardoraulinero@gmail.com', // list of receivers
      subject: 'Tienes un Nuevo mensaje', // Subject line
      text: 'hola', // plain text body
      html: body // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.json({ operation: 0, message: 'There was an error rendering the email' });
        return
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
      res.json({ operation: 1 });
    });
  });

  });

module.exports = router;