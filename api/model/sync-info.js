var mongoose = require('../../libs/mongoose');
var Schema = mongoose.Schema;

var syncInfo = new Schema({
    //дата последнего поста, который синхронизировался
    lastDate: String,
    //id последнего поста, который синхронизировался
    lastEntry: String
});

exports.SyncInfo = mongoose.model('syncInfo', syncInfo);