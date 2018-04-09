class SocketClient {
	_socket = null;

	init(socket) {
		if (!socket) {
			return;
		}

		this._socket = socket;

		this._socket.on('connect', () => {
			console.log('connected to WS!');
		});

		this._socket.on('event', function (data) {
		});

		this._socket.on('disconnect', function () {
		});
	}

	on(event, handler) {
		if (!socket) {
			return;
		}

		console.log(`listening to event ${event}`);
		this._socket.on(event, handler);
	}

	emit(event, message) {
		if (!this._socket) {
			return;
		}

		console.log('emitting event', event, 'message', message);
		this._socket.emit(event, message);
	}
}

export default new SocketClient();
