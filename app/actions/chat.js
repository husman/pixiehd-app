import { POST_CHAT_MESSAGE } from './actionTypes';
import SocketClient from '../../lib/SocketClient';
import uuid from 'uuid';

export function sendChatMessage(message) {
	message.id = uuid.v4();
	SocketClient.emit('chat:message', message);
	return postChatMessage(message)
}

export function postChatMessage(message) {
	return {
		type: POST_CHAT_MESSAGE,
		message,
	}
}
