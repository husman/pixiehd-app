import { combineReducers } from 'redux'
import canvas from './canvas';
import credentials from './credentials';
import roomName from './roomName';
import chat from './chat';
import user from './user';

export default combineReducers({
	chat,
	canvas,
	credentials,
	roomName,
	user,
});
