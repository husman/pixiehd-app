import React from 'react';
import { connect } from 'react-redux';
import { postChatMessage, sendChatMessage } from '../actions/chat';
import AssetStore from "../../lib/AssetStore";
import Avatar from 'material-ui/Avatar';
import SocketClient from '../../lib/SocketClient';
import AutoLinkText from 'react-autolink-text2';

class ChatBox extends React.Component {
	componentDidMount() {
		window.addEventListener("resize", this.resizeChatBox);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.resizeChatBox);
	}

	onKeyInputPress = (e) => {
		if (e.key === 'Enter') {
			this.onSend();
		}
	};

	onSend = () => {
		const text = this._input.value.trim();
		const {
			avatar,
			initials,
			onSendChatMessage,
			userId,
		} = this.props;

		if (text) {
			onSendChatMessage({
				avatar,
				initials,
				text,
				userId,
			});

			this.scrollChatMessagesToBottom()
		}

		this._input.value = '';
	};

	scrollChatMessagesToBottom = () => {
		setTimeout(() => this._chatMessages.scrollTop = this._chatMessages.scrollHeight, 0);
	};

	resizeChatBox = () => {
		this.setState({
			chatMessageMaxWidth: this._chatMessages.offsetWidth - 55,
			chatMessageMaxHeight: this._chatMessages.offsetHeight - 20,
		});
	};

	initChat = (element) => {
		this._chatMessages = element;
		this.resizeChatBox();

		SocketClient.on('chat:message', (message) => {
			this.props.onPostChatMessage(message);
			this.scrollChatMessagesToBottom();

			if (message.userId !== this.props.userId) {
				const audio = new Audio(AssetStore.get('assets/sounds/userIdle.mp3'));
				audio.play();
			}
		});
	};

	initChatBox = (element) => {
		this._chatbox = element;

		this.setState({
			chatBoxMaxHeight: this._chatbox.offsetHeight,
		});
	};

	render() {
		const {
			messages = [],
			userId,
		} = this.props;

		const {
			chatMessageMaxWidth,
			chatBoxMaxHeight,
		} = this.state || {};

		return (
			<div
				className="chat"
				ref={this.initChatBox}
				style={{
					height: chatBoxMaxHeight,
				}}
			>
				<div
					className="chat__messages"
					ref={this.initChat}
				>
					{messages.map((message, key) => {
						const externalClass = message.userId !== userId ? ' chat__message--external' : '';

						return (
							<div key={key} className={`chat__message${externalClass}`}>
								<div className="chat__message__avatar">
									{message.avatar ?
										<Avatar src={message.avatar} size={28}/>
										:
										<Avatar size={28}>{message.initials}</Avatar>
									}
								</div>
								<div
									className="chat__message__text"
									style={{
										width: chatMessageMaxWidth,
									}}
								>
									<AutoLinkText
										text={message.text}
										linkProps={{
											target: '_blank'
										}}
									/>
									{message.title ? <div>{message.title}</div> : null}
									{message.description ? <div>{message.description}</div> : null}
									{message.images && message.images.length ? <img src={message.images[0]}/> : null}
								</div>
							</div>
						);
					})}
				</div>
				<div className="chat__action">
					<div className="margin-left-xsmall margin-right-xsmall">
						<input
							type="text"
							placeholder="Enter your message.."
							className="chat__action__input"
							ref={element => this._input = element}
							onKeyPress={this.onKeyInputPress}
						/>
						<img
							src={AssetStore.get('assets/images/buttons/chat_send_btn.png')}
							className="btn chat__action__send"
							onClick={this.onSend}
						/>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	const {
		chat: {
			messages,
		},
		user: {
			avatar,
			initials,
			userId,
		},
	} = state;

	return {
		avatar,
		initials,
		messages,
		userId,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onSendChatMessage: (message) => dispatch(sendChatMessage(message)),
		onPostChatMessage: (message) => dispatch(postChatMessage(message)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBox)
