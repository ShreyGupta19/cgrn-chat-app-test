$(document).ready(function(){
	console.log(getGroup());
	var socketGlobal = io.connect(window.location.origin + "/");
	socketGlobal.emit('groupConnect', getGroup());
	console.log(window.location);
	setTimeout(function(){
		socket = io.connect(window.location.origin + "/" + getGroup());
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