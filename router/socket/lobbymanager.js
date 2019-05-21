var GameLobby = require('./gamelobby');

function LobbyManager(socketio) {
	var self = this;

	self.gameLobbys = {};
	self.sockets = [];
	self.io = socketio;

}

// 로비 생성 함수
LobbyManager.prototype.makeLobby = function(socket, PW) {
	var self = this;

	console.log('make lobby!!' + PW );

	// gamelobby 객체 생성
	let gamelobby = new GameLobby({lobbyPW: PW, host: socket});

	socket.join(gamelobby.lobbyPW);
	//gamelobby.on('response', self.lobbyChatResponse.bind(self));

	self.gameLobbys[PW] = gamelobby;	


}


// 로비 채팅 응답 관리 함수
LobbyManager.prototype.lobbyChatResponse = function(message) {
	var self = this;
	if(message.broadcast) {
		self.io.in(message.lobbyID).emit(message);
	}
	else {
		self.io.to(message.lobbyID).emit(message);
	}


}
	


// 로비 참가 함수
LobbyManager.prototype.joinLobby = function(socket, PW) {
	var self = this;
	var targetLobby = self.gameLobbys[PW]

	if(!targetLobby) {
		console.log('lobby not find!!');
		return;
	}

	console.log('join lobby!! ' + PW);
	targetLobby.joinUser(socket, PW);

}


module.exports = LobbyManager;