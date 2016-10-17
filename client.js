
w = window;
d = document;
// $("#chatbox").hide();
$("#username").keypress(function(e) {
	e = e || event;
	if (e.keyCode === 13) {
		CHAT.login();
	}
});
$('#sendButton').click(function() {
	// console.log('#m click');
	CHAT.sendMsg();
});
$('#m').keypress(function(e) {
	e = e || event;
	if (e.keyCode === 13) {
		CHAT.sendMsg();
	}
});
$('#m').keydown(function() {
	CHAT.startTyping();
});
$('#m').keyup(function() {
	CHAT.stopTyping();
});
w.CHAT = {
	msgObj:d.getElementById("m"),
	screenheight:w.innerHeight ? w.innerHeight : dx.clientHeight,
	username:null,
	userid:null,
	socket:null,
	init:function(username) {
		console.log('init');
		this.userid = this.genUid();
		this.username = username;
		
		d.getElementById("showusername").innerHTML = this.username;
		this.scrollToBottom();
		// using a namespace here
		this.socket = io('/chat');

		this.socket.emit('login', {userid:this.userid, username:this.username});
		
		// 监听新用户登录
		this.socket.on('login', function(o){
			CHAT.updateSysMsg(o, 'login');	
		});
		
		// // 监听用户退出
		this.socket.on('logout', function(o){
			CHAT.updateSysMsg(o, 'logout');
		});

		this.socket.on('chat message', function(obj) {
			var isme = (obj.userid == CHAT.userid) ? true : false;
			// var contentDiv = '<div>'+obj.content+'</div>';
			// var usernameDiv = '<span>'+obj.username+'</span>';
			
			// var section = d.createElement('section');
			// if(isme){
			// 	section.className = 'user';
			// 	section.innerHTML = contentDiv + usernameDiv;
			// } else {
			// 	section.className = 'service';
			// 	section.innerHTML = usernameDiv + contentDiv;
			// }
			// CHAT.msgObj.appendChild(section);
			
			$('#messages').append($('<li>').text(obj.username + " said: " +obj.content));
			CHAT.scrollToBottom();	
		});
		this.socket.on('notification', function(msg) {
			$('#notification').text(msg);
		});
	}, 
	
	login:function() {
		
		var username = $("#username").val();
		console.log(username + 'login');
		if(username != ""){
			$("#username").val('');
			$("#loginbox").hide();
			$("#chatbox").show();
			this.init(username);
		}
		return false;
	},
	sendMsg:function() {
		var content = d.getElementById("m").value;
		if(content != ''){
			var obj = {
				userid: this.userid,
				username: this.username,
				content: content
			};
			this.socket.emit('chat message', obj);
			$('#messages').append($('<li>').text(obj.username + " said: " +obj.content));
			CHAT.scrollToBottom();	
			d.getElementById("m").value = '';
		}
		// console.log('sendMsg');
		return false;
	},
	scrollToBottom:function() {
		// w.scrollTo(0, this.msgObj.clientHeight);
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
	},
	logout:function() {
		//this.socket.disconnect();
		location.reload();
	},
	genUid:function() {
		return new Date().getTime()+""+Math.floor(Math.random()*899+100);
	},
	updateSysMsg:function(o, action){
		//当前在线用户列表
		var onlineUsers = o.onlineUsers;
		//当前在线人数
		var onlineCount = o.onlineCount;
		//新加入用户的信息
		var user = o.user;
			
		//更新在线人数
		var userhtml = '';
		var separator = '';
		for(key in onlineUsers) {
	        if(onlineUsers.hasOwnProperty(key)){
				userhtml += separator+onlineUsers[key];
				separator = '、';
			}
	    }
		d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;
		
		//添加系统消息
		var html = '';
		html += '<div class="msg-system">';
		html += user.username;
		html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
		html += '</div>';
		var section = d.createElement('section');
		section.className = 'system J-mjrlinkWrap J-cutMsg';
		section.innerHTML = html;
		this.msgObj.appendChild(section);	
		this.scrollToBottom();
	},
	startTyping:function() {
		this.socket.emit('typing', "startTyping");
		console.log("startTyping");
	},
	stopTyping:function() {
		this.socket.emit('typing', "stopTyping");
		console.log("stopTyping");
	},
}
