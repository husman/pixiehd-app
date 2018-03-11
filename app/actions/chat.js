import { POST_CHAT_MESSAGE } from './actionTypes';

export function postChatMessage(message) {
	return {
		type: POST_CHAT_MESSAGE,
		message,
	}
}
