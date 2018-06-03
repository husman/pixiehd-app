import { POST_CHAT_MESSAGE } from '../actions/actionTypes';

export default function chat(state = {}, action) {
	let messages = state.messages || [];

	switch (action.type) {
		case POST_CHAT_MESSAGE:
			// if the message ID already exists, then update it
			if (messages.find(m => m.id === action.message.id)) {
				return {
					...state,
					messages: messages.map(m => m.id === action.message.id ? action.message : m),
				};
			}

			return {
				...state,
				messages: [
					...messages,
					action.message,
				],
			};
		default:
			return state;
	}
}
