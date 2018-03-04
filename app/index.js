import React from 'react';
import ReactDOM from 'react-dom';
import '../public/sass/liveclassroom.scss';
import '@opentok/client';
import App from './components/app';
import AssetStore from '../lib/AssetStore';
import SocketClient from '../lib/SocketClient';
import { createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducers'


window.__react_context__ = JSON.parse(decodeURIComponent(window.__react_context__));

const {
	state: {
		roomName,
		credentials,
	},
	assetBasePath,
} = window.__react_context__;

const store = createStore(
	reducer,
	window.__react_context__.state,
	compose(
		window.devToolsExtension ? window.devToolsExtension() : f => f
	)
);

const socket = require('socket.io-client')('http://localhost:4000', { query: `roomName=${roomName}` });
SocketClient.init(socket);
window.socket = SocketClient;

AssetStore.init(assetBasePath);

ReactDOM.render(
	<Provider store={store}>
		<App credentials={credentials}/>
	</Provider>,
	document.getElementById('app')
);


// Are we in development mode?
if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept();
	}
}
