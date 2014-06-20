var express = require('express');
var router = express.Router();
var Film = require('../model/film').Film;

router.post('/data', function (req, res) {
    var start = parseInt(req.body.start);
    var length = parseInt(req.body.length);
    receiveData(start, length, req.body.order ,function(err, results){
        if(err) throw err;
        results['draw'] = req.body.draw;
        res.json(results);
    });
});

receiveData = function (start, length, order, callback) {
    var query = {};
    var mongoSort = [];
    if(order){
        for(var i = 0; i < order.length; i++){
            switch (order[i].column) {
                case '2': mongoSort.push(['year', order[i].dir == 'asc' ? 1 : -1], ['cinema_hd_date', order[i].dir == 'asc' ? 1 : -1]);
                    break;
                case '3': mongoSort.push(['rating', order[i].dir == 'asc' ? 1 : -1]);
                    break;
                case '4': mongoSort.push(['votes', order[i].dir == 'asc' ? 1 : -1]);
                    break;
                default :
                    break;

            }
        }
    }
    Film.count(query, function(err, count){
       if(err){
           callback(err);
       }else{
           Film.find(query)
               .skip(start)
               .limit(length)
               .sort(mongoSort)
               .exec(function (err, docs) {
                   if (err) {
                       callback(err);
                   } else {
                       callback(null, {
                           'recordsTotal': count,
                           'recordsFiltered': count,
                           'data': docs});
                   }
               });
       }
    });
}

module.exports = router;
