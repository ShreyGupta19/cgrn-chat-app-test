var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');

var serverPort = process.env.YOUR_PORT || process.env.PORT || 1337;
var serverHost = process.env.YOUR_HOST || 'localhost';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});
app.post('/',function(req,res){
	console.log(req.body);
	res.send({redirect:'/'+req.body.group});
});
app.get('/alpha', function(req, res){
	console.log("hi");
	res.sendFile(path.join(__dirname, 'templates', 'alpha.html'));
});
app.get('/beta', function(req, res){
	res.sendFile(path.join(__dirname, 'templates', 'beta.html'));
});
app.get('/gamma', function(req, res){
	res.sendFile(path.join(__dirname, 'templates', 'gamma.html'));
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
	socket.on('groupConnect', function(group){
		var groupNsp = io.of('/' + group);
	});
	socket.on('message', function(data){
		console.log('data: ' + JSON.stringify(data));
		io.of("/"+data.nsp).emit('message', data.msg);
	});
});

http.listen(serverPort, serverHost, function(){
	console.log('listening on *:' + serverPort);
});