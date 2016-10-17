var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chat = io.of('/chat'); // using a namespace here

var onlineUsers = {};
var socketOfUsername = {};
var onlineCount = 0;

app.use(express.static(__dirname+'/'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

chat.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('login', function(obj){
		socket.userid = obj.userid;
		
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			socketOfUsername[obj.username] = socket;
			onlineCount++;
		}
		
		chat.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		console.log(obj.username+' come in!');
	});

	socket.on('chat message', function(obj) {
		// chat.emit('chat message', obj);
		// if (obj) {}
		socket.broadcast.emit('chat message', obj);
		// private message, using:
		// socketOfUsername["chrome"].emit('chat message', obj);
		console.log(obj.username+' said: '+obj.content);
	});
	socket.on('typing', function(str) {
		// chat.emit('chat message', obj);
		if (str == "startTyping") {
			socket.broadcast.emit('notification', onlineUsers[socket.userid] + "is typing");
		}
		else {
			socket.broadcast.emit('notification', "");
		}

	});
	socket.on('disconnect', function() {
		if(onlineUsers.hasOwnProperty(socket.userid)) {
			var obj = {userid:socket.userid, username:onlineUsers[socket.userid]};
			
			delete socketOfUsername[onlineUsers[socket.userid]];
			delete onlineUsers[socket.userid];
			onlineCount--;
			
			chat.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			console.log(obj.username+'has left.');
		}
	});
});

http.listen(3000, function() {
	console.log('listening on *: 3000');
});