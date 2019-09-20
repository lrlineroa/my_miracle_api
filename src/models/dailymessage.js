var mongoose = require('mongoose');
var appConstans=require('../common/AppConstants')

var dailymessage={}
dailymessage[appConstans.database.dailymessage.DAILY_MESSAGE]={
    type:String,
    required:true,
}
var dailymessageSchema = new mongoose.Schema(
    dailymessage
,{timestamps:true})

module.exports = mongoose.model(appConstans.database.dailymessage.DAILY_MESSAGES, dailymessageSchema);