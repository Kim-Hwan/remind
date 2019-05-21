var State = require('./gamestates');

function GameLobby(info) {
	var self  = this;


	self.lobbyPW = info.lobbyPW;
	self.lobbyNum = 0;
	self.players = {};
	self.host = info.host;

	self.state = State.STATES.INIT;
	self.roundNum = 0;

	self.players[info.host] = info.host;

}


GameLobby.prototype.joinUser = function(socket, PW) {
	var self = this;

	socket.join(PW);
	self.players[socket] = socket;

}

GameLobby.prototype.leaveUser = function() {
	var self = this;
}


module.exports = GameLobby;