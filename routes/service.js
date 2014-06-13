var express = require('express');
var router = express.Router();

router.post('/data', function (req, res) {
    var start = parseInt(req.body.start);
    var end = parseInt(req.body.length) + start;
    var result = receiveData(start, end);
    result['draw'] = req.body.draw;
    res.json(result);
});

var all_data = [];
for(var i = 0; i < 1000; i++){
    all_data.push([i + '_1', i + '_2'])
}

receiveData = function(start, end){
    var data = all_data.slice(start, end);
    return {
        'recordsTotal': all_data.length,
        'recordsFiltered': all_data.length,
        'data': data};
}

module.exports = router;
