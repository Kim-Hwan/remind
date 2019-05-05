function LobbyManager(socketio) {
	var self = this;

	self.gameLobbys = {};
	self.sockets = [];
	self.io = socketio;

}

LobbyManager.prototype.makeLobby = function(socket) {
	console.log('make lobby!!');
}

LobbyManager.prototype.joinLobby = function(socket, lobbyNum) {
	console.log('make lobby!! ' + lobbyNum);
}

module.exports = LobbyManager;