var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var onlineUsers = {};
var onlineCount = 0;

app.use(express.static(__dirname+'/'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('login', function(obj){
		socket.userid = obj.userid;
		
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			onlineCount++;
		}
		
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		console.log(obj.username+' come in!');
	});

	socket.on('chat message', function(obj) {
		// io.emit('chat message', obj);
		socket.broadcast.emit('chat message', obj);
		console.log(obj.username+' said: '+obj.content);
	});
	socket.on('typing', function(str) {
		// io.emit('chat message', obj);
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
			
			delete onlineUsers[socket.userid];
			onlineCount--;
			
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			console.log(obj.username+'has left.');
		}
	});
});

http.listen(3000, function() {
	console.log('listening on *: 3000');
});