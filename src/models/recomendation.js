var mongoose = require('mongoose');
var appConstans=require('../common/AppConstants')

var recomendation={}
recomendation[appConstans.database.recomendation.RECOMENDATION]={
    type:String,
    required:true,
}
var recomendationSchema = new mongoose.Schema(
    recomendation
,{timestamps:true})

module.exports = mongoose.model(appConstans.database.recomendation.RECOMENDATIONS, recomendationSchema);