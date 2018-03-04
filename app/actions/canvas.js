import { ADD_PATH_TO_CANVAS } from './actionTypes';

export function addPathToCanvas(path) {
	return {
		type: ADD_PATH_TO_CANVAS,
		path,
	}
}
