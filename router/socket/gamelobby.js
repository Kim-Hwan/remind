var State = require('./gamestates');

function GameLobby(info) {
	var self  = this;

	//self.lobbyPW = info.lobbyPW;
	self.players = [null, null, null, null, null, null];
	self.host = info.host;

	self.maxRound = 0;
	self.maxTime = 0;

	self.state = State.STATES.INIT;
	self.roundNum = 0;

	self.players[0] = info.host;

}


GameLobby.prototype.joinUser = function(socket, PW) {
	var self = this;
	var i = 0;

	socket.join(PW);
	for(var i in self.players) {
		if(self.players[i] == socket.handshake.sessionID)
			return;
		if(!self.players[i]) {
			self.players[i] = socket.handshake.sessionID;
			console.log(self.players);
			return;
		}
	}

}

GameLobby.prototype.leaveUser = function(socket) {
	var self = this;

	//socket.leave();
	for(var i in self.players) {
		if(self.players[i] == socket.handshake.sessionID) {
			self.players[i] = null;
			return;
		}
	}
}


module.exports = GameLobby;