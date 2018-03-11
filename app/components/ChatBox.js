import React from 'react';
import { connect } from 'react-redux';
import { postChatMessage } from '../actions/chat';
import AssetStore from "../../lib/AssetStore";
import Avatar from 'material-ui/Avatar'
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class ChatBox extends React.Component {
	render() {
		return (
			<div className="chat">
				<div className="chat__messages">
					<div className="chat__message chat__message--external">
						<div className="chat__message__avatar">
							<Avatar
								src={AssetStore.get('assets/images/containers/derlin_chao_avatar.png')}
								size={28}
							/>
						</div>
						<div className="chat__message__text">
							这是一个美好的一天
						</div>
					</div>

					<div className="chat__message">
						<div className="chat__message__avatar">
							<Avatar
								src={AssetStore.get('assets/images/containers/bing_avatar.jpg')}
								size={28}
							/>
						</div>
						<div className="chat__message__text">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut felis eget lectus.
						</div>
					</div>

					<div className="chat__message chat__message--external">
						<div className="chat__message__avatar">
							<Avatar size={28}>
								HU
							</Avatar>
						</div>
						<div className="chat__message__text">
							你好
						</div>
					</div>

					<div className="chat__message">
						<div className="chat__message__avatar">
							<Avatar
								src={AssetStore.get('assets/images/containers/bing_avatar.jpg')}
								size={28}
							/>
						</div>
						<div className="chat__message__text">
							Pellentesque justo nulla.
						</div>
					</div>
				</div>
				<div className="chat__action">
					<div className="margin-left-xsmall margin-right-xsmall">
						<input
							type="text"
							placeholder="Enter your message..."
							className="chat__action__input"
						/>
						<img
							src={AssetStore.get('assets/images/buttons/chat_send_btn.png')}
							className="btn chat__action__send"
						/>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		message: state.message,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onPostChatMessage: (message) => dispatch(postChatMessage(message)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBox)
