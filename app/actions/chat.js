import { POST_CHAT_MESSAGE } from './actionTypes';
import SocketClient from '../../lib/SocketClient';

export function sendChatMessage(message) {
	SocketClient.emit('chat:message', message);
	return postChatMessage(message)
}

export function postChatMessage(message) {
	return {
		type: POST_CHAT_MESSAGE,
		message,
	}
}
