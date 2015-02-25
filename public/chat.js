$(document).ready(function(){
	console.log(getGroup());
	var socketGlobal = io.connect('http://localhost:3000/');
	socketGlobal.emit('groupConnect', getGroup());
	setTimeout(function(){
		socket = io.connect('http://localhost:3000/' + getGroup());
		nsp = getGroup();
		$('form').submit(function(){
			socketGlobal.emit('message', {"msg":$('#m').val(),"nsp":nsp});
			$('#m').val('');
			return false;
		});
		socket.on('message', function(msg){
			console.log("hey");
			$('#messages').append($('<li>').text(msg));
		});
	},1000);
});