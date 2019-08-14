var express = require('express');
var router = express.Router();
var User = require('../models/user')
var key=require('./key')
var jwt=require('jsonwebtoken')
var axios=require('axios')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
//register a user Create
router.post('/api', async (req, res) => {
  try {
    let user = new User(req.body)
    await user.save();
    let data2Login={
      email:user.email,
      password:req.body.password
    }
    let response=await axios.post(req.protocol+'://'+req.headers.host+'/users/api/auth/signin',data2Login)
    if(response.data.token){
      res.json({user,token:response.data.token})
    }else{
      res.json(user)
    }    
  } catch (error) {
    res.status(500).json({ error: 'Error al Registrarse', details:error})
  }
});
//login
router.post('/api/auth/signin',function(req,res){
  User.findOne({email:req.body.email}).then((user)=>{
          user.comparePassword(req.body.password,(err,isMatch)=>{
              if(isMatch){
                  var token=jwt.sign({userId:user.id},key.tokenKey);
                  res.status(200).json({
                      user,
                      token
                  })
              }
              else{
                  res.status(400).json({message:'Invalid Password/Username'});
              }
          })
  }).catch((err)=>{
      res.status(400).json({message:'Invalid Password/Username',details:err});
  })
})

module.exports = router;
