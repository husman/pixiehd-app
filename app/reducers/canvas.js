import { ADD_PATH_TO_CANVAS } from '../actions/actionTypes';

export default function canvas(state = {}, action) {
	switch (action.type) {
		case ADD_PATH_TO_CANVAS:
			return {
				...state,
				path: action.path,
			};
		default:
			return state;
	}
}
