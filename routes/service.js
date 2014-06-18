var express = require('express');
var router = express.Router();
var Film = require('../model/film').Film;

router.post('/data', function (req, res) {
    var start = parseInt(req.body.start);
    var end = parseInt(req.body.length) + start;
    receiveData(start, end, function(err, results){
        if(err) throw err;
        results['draw'] = req.body.draw;
        res.json(results);
    });
});

receiveData = function(start, end, callback){
    Film.find({}, function(err, docs){
        if(err){
            callback(err);
        }else{
            callback(null, {
                'recordsTotal': docs.length,
                'recordsFiltered': docs.length,
                'data': docs});
        }
    });
}

module.exports = router;
