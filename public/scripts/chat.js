$(document).ready(function(){
	console.log(getGroup());
	console.log(getUserData());
	var socketGlobal = io.connect(window.location.origin + "/");
	socketGlobal.emit('groupConnect', {"group":getGroup(),"user":getUserData().email});
	setTimeout(function(){
		socket = io.connect(window.location.origin + "/" + getGroup());
		nsp = getGroup();
		$('form').submit(function(){
			socketGlobal.emit('message', {"msg":$('#m').val(),"nsp":nsp, "user":getUserData()});
			$('#m').val('');
			return false;
		});
		socket.on('message', function(data){
			$('#messages').append($('<li>').text(data.user.first + " said " + data.msg));
		});
	},1000);
});