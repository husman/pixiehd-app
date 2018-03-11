import { POST_CHAT_MESSAGE } from '../actions/actionTypes';

export default function chat(state = {}, action) {
	switch (action.type) {
		case POST_CHAT_MESSAGE:
			return {
				...state,
				messages: [
					...(state.messages || []),
					action.message,
				],
			};
		default:
			return state;
	}
}
