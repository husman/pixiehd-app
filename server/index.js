import express, { Router } from 'express';
import { noCache } from 'helmet';
import OpenTok from 'opentok';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server'
import HTML from '../app/components/html';

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const router = Router();


app.use('/dist', express.static('./dist/app'));
app.use('/assets', express.static('./public/assets'));
app.use(noCache());
app.use(router);

const roomToSessionIdDictionary = {};

router.get('/', async (req, res) => {
	const apiKey = '46003032';
	const secret = '135571e6887919f56e5b7d48b0f6e8e9adc47da3';
	const opentok = new OpenTok(apiKey, secret);

	const roomName = req.query.r;
	let sessionId;
	let token;
	console.log('attempting to create a session associated with the room: ' + roomName);

	if (!roomToSessionIdDictionary[roomName]) {
		roomToSessionIdDictionary[roomName] = await new Promise((resolve, reject) => {
			opentok.createSession({ mediaMode: 'routed' }, function (err, session) {
				if (err) {
					console.log(err);

					return reject({
						error: 'createSession error:' + err,
					});
				}

				// now that the room name has a session associated wit it, store it in memory
				// IMPORTANT: Because this is stored in memory, restarting your server will reset these values
				// if you want to store a room-to-session association in your production application
				// you should use a more persistent storage for them
				return resolve(session.sessionId);
			});
		});
	}

	sessionId = roomToSessionIdDictionary[roomName];

	// generate token
	token = opentok.generateToken(sessionId);

	const data = {
		state: {
			roomName,
			credentials: {
				apiKey: apiKey,
				sessionId: sessionId,
				token: token,
			}
		},
		assetBasePath: process.env.ASSET_BASE_PATH || '',
	};

	const html = renderToStaticMarkup(
		<HTML {...data} />
	);

	res.send(`<!doctype html>\n${html}`);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

const wsClients = {};

io.on('connection', (socket) => {
	const { roomName } = socket.handshake.query;
	socket.roomName = roomName;

	if (!wsClients[roomName]) {
		wsClients[roomName] = [socket];
	} else {
		wsClients[roomName].push(socket);
	}

	socket.on('canvas:path:created', (data) => {
		const { roomName } = socket;

		wsClients[roomName].forEach(s => {
			if (s.id !== socket.id) {
				s.emit('canvas:path:created', data);
			}
		})
	});

	socket.on('canvas:object:modified', (data) => {
		const { roomName } = socket;

		wsClients[roomName].forEach(s => {
			if (s.id !== socket.id) {
				s.emit('canvas:object:modified', data);
			}
		})
	});

	socket.on('canvas:clear', () => {
		const { roomName } = socket;

		wsClients[roomName].forEach(s => {
			if (s.id !== socket.id) {
				s.emit('canvas:clear');
			}
		})
	});
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}!!`);
});
