import { combineReducers } from 'redux'
import canvas from './canvas';
import credentials from './credentials';
import roomName from './roomName';

export default combineReducers({
	canvas,
	credentials,
	roomName,
});
