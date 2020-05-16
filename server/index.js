import express, { Router } from 'express';
import bodyParser from 'body-parser';
import { noCache } from 'helmet';
import OpenTok from 'opentok';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server'
import HTML from '../app/components/html';
import AssetStore from "../lib/AssetStore";
import uuid from 'uuid';
import * as multer from 'multer'
import LinkPreview from 'react-native-link-preview';
import fs from 'fs';

let server;
const app = express();

if (process.env.NODE_ENV === 'production' && !process.env.HEROKU) {
  const sslBasePath = process.env.SSL_BASE_PATH || '/home/ubuntu/.ssh';
  const httpsOptions = {
    key: fs.readFileSync(`${sslBasePath}/pxieihd_neetos_com_com.key`),
    cert: fs.readFileSync(`${sslBasePath}/pixiehd_neetos_com.crt`),
    ca: fs.readFileSync(`${sslBasePath}/pixiehd_neetos_com.ca-bundle`),
  };
  server = require('https').createServer(httpsOptions, app);
} else {
  server = require('http').createServer(app);
}

const io = require('socket.io')(server);
const router = Router();


app.use(bodyParser.json());
app.use('/dist', express.static('./dist/app'));
app.use('/assets', express.static('./public/assets'));
app.use('/uploads', express.static('./uploads'));
app.use(noCache());
app.use(router);

const roomToSessionIdDictionary = {};

function makeInitials() {
  let text = '';
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < 2; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

router.get('/health', async (req, res) => {
  res.send('OK');
});

router.get('/login', async (req, res) => {
  res.json({
    id: 777,
    email: 'husman@neetos.com',
    firstName: 'Haleeq',
    lastName: 'Usman',
  });
});

router.get('/', async (req, res) => {
  const apiKey = '46003032';
  const secret = '135571e6887919f56e5b7d48b0f6e8e9adc47da3';
  const opentok = new OpenTok(apiKey, secret);

  const roomName = req.query.r;
  const fullName = req.query.name;
  const isObserver = req.query.o === '1';
  console.log('fullName', fullName);
  const userId = Number(req.query.uid) || uuid.v4();
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
      },
      chat: {},
      user: {
        userId,
        initials: fullName ? (fullName.match(/\b\w/g)).join('') : makeInitials(),
        fullName,
        isObserver,
        publishAudio: !isObserver,
      },
    },
    assetBasePath: process.env.ASSET_BASE_PATH || '',
  };

  const html = renderToStaticMarkup(
    <HTML {...data} />,
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
const wsClientsV2 = {};

io.on('connection', (socket) => {
  const {
    roomName,
    firstName,
    isMicEnabled,
  } = socket.handshake.query;
  socket.roomName = roomName;

  console.log('new client connected to session:', roomName, socket.id);

  if (!wsClients[roomName]) {
    wsClients[roomName] = [socket];
  } else {
    wsClients[roomName].push(socket);
  }

  if (!wsClientsV2[roomName]) {
    wsClientsV2[roomName] = [{
      socket,
      firstName,
      isMicEnabled: isMicEnabled === 'true',
    }];
  } else {
    wsClientsV2[roomName].push({
      socket,
      firstName,
      isMicEnabled: isMicEnabled === 'true',
    });
  }

  socket.on('disconnect', () => {
    console.log('user disconnected: ', socket.id);
    wsClients[roomName] = wsClients[roomName].filter((clientSocket) => {
      clientSocket.emit('user-leave', socket.id);
      return clientSocket !== socket;
    });

    wsClientsV2[roomName] = wsClientsV2[roomName].filter(({ socket: clientSocket }) => clientSocket !== socket);
    socket.broadcastToSession('user:left', socket.id);
  });

  socket.broadcastToPeers = (eventType, ...args) => {
    wsClients[roomName].forEach((clientSocket) => {
      // broadcast the event to all participates except the user who sent the event.
      if (clientSocket.id !== socket.id) {
        clientSocket.emit(eventType, socket.id, ...args);
      }
    });
  };

  socket.listenAndBroadcastToPeers = (eventType) => {
    socket.on(eventType, (...args) => socket.broadcastToPeers(eventType, ...args));
  };

  socket.broadcastToSession = (eventType, ...args) => {
    wsClients[roomName].forEach((clientSocket) => clientSocket.emit(eventType, ...args));
  };

  // broadcast the user's entrance to other peers
  const clientIds = wsClients[roomName].map((client) => client.id);
  wsClients[roomName].forEach((clientSocket) => {
    console.log('sending "user-joined" to user', clientSocket.id);
    clientSocket.emit('user-joined', socket.id, clientIds);
  });

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

  socket.on('canvas:image:created', (data) => {
    const { roomName } = socket;

    wsClients[roomName].forEach(s => {
      if (s.id !== socket.id) {
        s.emit('canvas:image:created', data);
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

  socket.on('canvas:object:delete', (data) => {
    const { roomName } = socket;

    wsClients[roomName].forEach(s => {
      if (s.id !== socket.id) {
        s.emit('canvas:object:delete', data);
      }
    })
  });

  socket.on('chat:message', async (message) => {
    const { roomName } = socket;

    let preview;
    try {
      preview = await LinkPreview.getPreview(message.text);
    } catch (e) {
      preview = {};
    }

    wsClients[roomName].forEach(s => {
      s.emit('chat:message', {
        ...preview,
        ...message,
      });
    })
  });

  socket.on('ice-offer', (clientId, offerSdp) => {
    io.to(clientId).emit('ice-offer', socket.id, offerSdp);
  });

  socket.on('ice-candidate', (candidate) => {
    wsClients[roomName].forEach((clientSocket) => {
      clientSocket.emit('ice-candidate', socket.id, candidate);
    });
  });

  const users = wsClientsV2[roomName].map(({
    socket: {
      id,
    },
    firstName,
    isMicEnabled,
  }) => ({
    id,
    firstName,
    isMicEnabled,
  }));

  socket.broadcastToSession('user:joined', socket.id, users);

  [
    'notebook:entry:add',
    'notebook:entry:change',
    'notebook:annotated',
    'chat:new:message',
  ].map(socket.listenAndBroadcastToPeers);
});

router.post('/connect', async (req, res) => {
  const apiKey = '46003032';
  const secret = '135571e6887919f56e5b7d48b0f6e8e9adc47da3';
  const opentok = new OpenTok(apiKey, secret);
  const { meetingId } = req;

  if (!roomToSessionIdDictionary[meetingId]) {
    roomToSessionIdDictionary[meetingId] = await new Promise((resolve, reject) => {
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

  const sessionId = roomToSessionIdDictionary[meetingId];

  // generate token
  const token = opentok.generateToken(sessionId);

  res.send({
    apiKey,
    sessionId,
    token,
  });
});

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), function (req, res) {
  if (req.file && req.file.originalname) {
    console.log(`Received file ${req.file.originalname}`);
  }

  res.send({ responseText: req.file.path }); // You can send any response to the user here
});

router.get('/google219a982336b29bda.html', function (req, res) {
  res.send('google-site-verification: google219a982336b29bda.html');
});

const PORT = process.env.PORT || 443;
server.listen(PORT, () => {
  AssetStore.init(process.env.ASSET_BASE_PATH || '');
  console.log(`Server is listening on port ${PORT}!!`);
});
