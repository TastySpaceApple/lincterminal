var path = require('path');
var fs = require('fs');
var parser = require('./parser')
var express = require('express')
	, app = express();

app.use('/', express.static(path.join(__dirname, 'static')));

app.get('/get/screen/:screen', function(req, res){
//res.sendFile(path.join(__dirname, 'data', req.params.screen + '.txt'));
  fs.readFile(path.join(__dirname, 'data', req.params.screen + '.txt'), 'utf8', (err, data) =>{
    if(err) res.status(404).json({text: 'ERROR\n\n\n\n0 MAIN MENU', actions: {0: 'index'}})
    else res.send(parser.parse(data));
  })
})

app.listen(process.env.PORT || 3000);

module.exports = app;
