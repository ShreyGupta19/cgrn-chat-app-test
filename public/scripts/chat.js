$(document).ready(function(){
	var socketGlobal = io.connect(window.location.origin + "/");
	socketGlobal.emit('groupConnect', {"group":getGroup(),"user":getUserData()});
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
			var newChatMsgModule = $(document.createElement('li')).addClass("chat-message-module");
			var newChatMsgUserID = $(document.createElement('div')).html(data.user.name.first).addClass("chat-message-user-id").addClass("chat-message-user-id-" + data.user["_id"]);
			var newChatMsgContent = $(document.createElement('div')).html(data.msg).addClass("chat-message-content").addClass("chat-message-content-" + data.user["_id"]);
			console.log(data.user["_id"]);
			if (data.user["_id"] === "000000000000000000000001") {
				console.log("hi!");
				newChatMsgModule.append(newChatMsgContent).addClass("chat-message-module-admin").appendTo($(".chat-messages-bin"));
			}
			else if(data.user["_id"] !== getUserData()["_id"]){
				newChatMsgModule.append(newChatMsgUserID).append(newChatMsgContent).appendTo($(".chat-messages-bin"));
				newChatMsgUserID.addClass("chat-message-component-left");
				newChatMsgContent.addClass("chat-message-component-right");
			}
			else {
				newChatMsgModule.append(newChatMsgContent).append(newChatMsgUserID).addClass("my-chat-message-module").appendTo($(".chat-messages-bin"));
				newChatMsgContent.addClass("chat-message-component-left");
				newChatMsgUserID.addClass("chat-message-component-right");
			}
			if(usersInChat.indexOf(data.user["_id"])===-1){
				usersInChat.push(data.user["_id"]);
				var randCol = randomColor({"luminosity":"bright","format":"rgb"});
				var randColLight = randCol.replace(/\)/,",0.4)").replace(/rgb/,"rgba");
				$("<style> .chat-message-user-id-" + data.user["_id"] + "{background-color:" + randCol + ";} .chat-message-content-" + data.user["_id"] + "{background-color:" + randColLight + ";}</style>").appendTo("head");
			}
			$(window).scrollTop($(".chat-messages-bin").prop("scrollHeight"));
		});
	},1000);
});