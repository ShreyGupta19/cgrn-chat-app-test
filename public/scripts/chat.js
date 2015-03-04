$(document).ready(function(){
	var socketGlobal = io.connect(window.location.origin + "/");
	socketGlobal.emit('groupConnect', {"group":getGroup(),"user":getUserData().email});
	setTimeout(function(){
		var usersInChat = [];
		socket = io.connect(window.location.origin + "/" + getGroup());
		nsp = getGroup();
		$('form').submit(function(){
			socketGlobal.emit('message', {"msg":$('.message-input').val(),"nsp":nsp, "user":getUserData()});
			$('.message-input').val('');
			return false;
		});
		socket.on('message', function(data){
			if(usersInChat.indexOf(data.user["_id"])===-1){
				usersInChat.push(data.user["_id"]);
				var randCol = randomColor({"luminosity":"bright","format":"rgb"});
				var randColLight = randCol.replace(/\)/,",0.4)").replace(/rgb/,"rgba");
				$("<style> .chat-message-user-id-" + data.user["_id"] + "{background-color:" + randCol + ";} .chat-message-content-" + data.user["_id"] + "{background-color:" + randColLight + ";}</style>").appendTo("head");
			}
			var newChatMsg = $(document.createElement('li')).addClass("chat-message-module");
			console.log(usersInChat);
			console.log(data);
			newChatMsg.append($(document.createElement('div')).html(data.user.name.first).addClass("chat-message-user-id").addClass("chat-message-user-id-" + data.user["_id"])).append($(document.createElement('div')).html(data.msg).addClass("chat-message-content").addClass("chat-message-content-" + data.user["_id"])).appendTo($(".chat-messages-bin"));
			console.log(newChatMsg);
		});
	},1000);
});