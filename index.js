var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/chatdbtest';

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({secret: '1234567890QWERTY', resave:false, saveUninitialized: false}));
app.use(express.static(__dirname + '/public'));

function isEmpty(obj) {
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	if (obj == null) return true;
	if (obj.length > 0) return false;
	if (obj.length === 0) return true;
	for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
	return true;
}

mongodb.connect(mongoURI,function(err,db){
	if(err) throw err;
	else console.log("Successfully connected to MongoDB.");
	var users = db.collection('userData');
	var rooms = db.collection('chatRoomData');

	app.get('/', function(req, res){
		if(!isEmpty(req.query)){
			if(req.query.type==="getGroupNames"){
				rooms.find({},{name:1,_id:0}).toArray(function(err,docs){
					if(err) throw err;
					else if(!docs.length){
						res.send({error:"No chat rooms found."});
					}
					else {
						var groupNames = [];
						docs.forEach(function(doc){
							groupNames.push(doc.name);
						});
						res.send({names:groupNames});
					}
				});
			}
		}
		else res.sendFile(path.join(__dirname, 'templates', 'index.html'));
	});
	app.post('/',function(req,res){
		if(req.body.type === "login"){
			users.find({email:req.body["login-email"],password:req.body["login-password"]}).toArray(function(err,docs){
				if(err) throw err;
				else if(!docs.length){
					res.send({error:"Incorrect email or password."});
				}
				else if(docs.length > 1){
					res.send({error:"Your password and email is the same as another members!"});
				}
				else {
					req.session.user = docs[0];
					users.update({email:docs[0].email}, {$push:{logins: {"room":req.body["login-group"],"time":new Date().toISOString()}}}, function(err, result){
						if(err) throw err;
						res.send({redirect:'/rooms/'+req.body["login-group"]});
					});
				}
			});
		}
		else if(req.body.type === "register"){
			var newUserDoc = {email:req.body["login-email"], password:req.body["login-password"], name:{first:req.body["login-name"].split(" ")[0], last:req.body["login-name"].split(" ")[1]}, logins:[{"room":req.body["login-group"],"time":new Date().toISOString()}]};
			users.find({email:req.body["login-email"]}).toArray(function(err,docs){
				if (err) throw err;
				else if (docs.length) res.send({error: "You already have an account!"});
				else {
					users.insert(newUserDoc,function(err,records){
						if(err) throw err;
						req.session.user = records[0];
						res.send({redirect:'/rooms/'+req.body["login-group"]});
					});
				}
			});
		}
	});
	var modifyChatFile = function(groupName,routeData){
		fs.readFile(path.join(__dirname, 'templates', 'chat.html'), {"encoding":'utf8'}, function(err, data){
			if(err) throw err;
			data = data.replace(/\"%%%USERDATA%%%\"/g, JSON.stringify(routeData.req.session.user));
			data = data.replace(/%%%GROUPNAME%%%/g,groupName);
			data = data.replace(/%%%GROUPNAME%%%/g,groupName);
			data = data.replace(/%%%GROUPNAME_UPPERCASE%%%/g,groupName.charAt(0).toUpperCase() + groupName.slice(1));
			routeData.res.send(data);
		});
	}
	app.get('/rooms/:groupName', function(req, res){
		if(req.session.user)
			modifyChatFile(req.params.groupName,{"req":req,"res":res});
		else {
			res.redirect('/');
		}
	});

	io.on('connection', function(socket){
		socket.on('groupConnect', function(data){
			var groupNsp = io.of('/' + data.group);
			var currentTime = new Date().toISOString();
			rooms.update({name:data.group}, {$push:{logins: {"user":data.user.email,"timeIn":currentTime}}}, function(err, result){
				if(err) throw err;
				console.log("hi");
				io.of("/"+data.group).emit('message', {"msg":data.user.name.first + " has joined the chat.", "user":{"name":{"first":"System","last":"Admin"},"_id":"000000000000000000000001"}, "time":currentTime});
			});
		});
		socket.on('message', function(data){
			console.log('data: ' + JSON.stringify(data));
			var currentTime = new Date().toISOString();
			rooms.update({name:data.nsp}, {$push:{messages: {"user":data.user.email,"time":currentTime,"content":/*data.msg*/""}}}, function(err, result){
				if(err) throw err;
				io.of("/"+data.nsp).emit('message', {"msg":data.msg, "user":data.user, "time":currentTime});
			});
		});
	});

});

http.listen(app.get('port'), function(){
	console.log('listening on:' + app.get('port'));
});