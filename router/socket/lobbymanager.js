var GameLobby = require('./gamelobby');

function LobbyManager(socketio) {
	var self = this;

	self.gameLobbys = {};
	self.sockets = [];
	self.io = socketio;

}

// 로비 생성 함수
LobbyManager.prototype.makeLobby = function(socket, info) {
	var self = this;

	console.log('make lobby!! ' + info.PW );

	// gamelobby 객체 생성
	let gamelobby = new GameLobby({	lobbyPW: info.PW, 
									host: socket, 
									maxRound: info.maxRound, 
									maxTime: info.maxTime});

	// socket 룸 연결
	socket.join(gamelobby.lobbyPW);
	//gamelobby.on('response', self.lobbyChatResponse.bind(self));

	self.gameLobbys[info.PW] = gamelobby;	


}


// 로비 채팅 응답 관리 함수
LobbyManager.prototype.lobbyChatResponse = function(message) {
	var self = this;
	if(message.broadcast) {
		self.io.in(message.lobbyID).broadcast.emit(message);
	}
	else {
		self.io.to(message.lobbyID).emit(message);
	}


}
	


// 로비 참가 함수
LobbyManager.prototype.joinLobby = function(socket, PW) {
	var self = this;
	var targetLobby = self.gameLobbys[PW]

	// 로비가 존재하지 않음
	if(!targetLobby) {
		console.log('lobby not find!!');
		return -1;
	}

	/*
	// 로비 상태 검사
	if(targetLobby.state == State.STATES.PLAY){
		console.log('lobby aleady started!!');
		return -1;
	}*/

	console.log('join lobby!! ' + PW);

	// socket 룸 연결
	socket.join(targetLobby.lobbyPW);

	targetLobby.joinUser(socket, PW);

}


module.exports = LobbyManager;