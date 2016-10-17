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
		socket.name = obj.userid;
		
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			onlineCount++;
		}
		
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		console.log(obj.username+' come in!');
	});

	socket.on('chat message', function(obj) {
		io.emit('chat message', obj);
		console.log(obj.username+' said: '+obj.content);
	});
	socket.on('disconnect', function() {
		if(onlineUsers.hasOwnProperty(socket.name)) {
			var obj = {userid:socket.name, username:onlineUsers[socket.name]};
			
			delete onlineUsers[socket.name];
			onlineCount--;
			
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			console.log(obj.username+'has quitted.');
		}
	});
});

http.listen(3000, function() {
	console.log('listening on *: 3000');
});