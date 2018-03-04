import React from 'react';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';
import ToolItem from './ToolItem'
import Canvas from './Whiteboard';
import AssetStore from '../../lib/AssetStore';
import { Tools } from "react-sketch/lib/index";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Widget, addResponseMessage } from 'react-chat-widget';

export default class App extends React.Component {
	_session = null;

	constructor(...props) {
		super(...props);

		this.state = {
			error: null,
			connection: 'Connecting',
			publishVideo: true,
		};

		this.sessionEventHandlers = {
			sessionConnected: () => {
				console.log('this._session', this._session);
				this.setState({ connection: 'Connected' });
			},
			sessionDisconnected: () => {
				this.setState({ connection: 'Disconnected' });
			},
			sessionReconnected: () => {
				this.setState({ connection: 'Reconnected' });
			},
			sessionReconnecting: () => {
				this.setState({ connection: 'Reconnecting' });
			},
			signal: (event) => {
				if (this._session.connection.id !== event.from.id) {
					console.log("Signal sent from connection: " + event.from.id);
					console.log("Signal data: " + event.data);
				}
			},
		};

		this.publisherEventHandlers = {
			accessDenied: () => {
				console.log('User denied access to media source');
			},
			streamCreated: () => {
				console.log('Publisher stream created');
			},
			streamDestroyed: ({ reason }) => {
				console.log(`Publisher stream destroyed because: ${reason}`);
			},
		};

		this.subscriberEventHandlers = {
			videoEnabled: () => {
				console.log('Subscriber video enabled');
			},
			videoDisabled: () => {
				console.log('Subscriber video disabled');
			},
		};
	}

	onSessionError = error => {
		this.setState({ error });
	};

	onPublish = () => {
		console.log('Publish Success');
	};

	onPublishError = error => {
		this.setState({ error });
	};

	onSubscribe = () => {
		console.log('Subscribe Success');
	};

	onSubscribeError = error => {
		this.setState({ error });
	};

	toggleVideo = () => {
		this.setState({ publishVideo: !this.state.publishVideo });
	};

	onSessionReady = (ref) => {
		if (ref) {
			this._session = ref.sessionHelper.session;
		}
	};

	onChangeTool = function (tool) {
		console.log('changing the tool to', tool);
		this.setState({
			tool,
		})
	};

	handleNewUserMessage = (newMessage) => {
		console.log(`New message incomig! ${newMessage}`);
		// Now send the message throught the backend API
		addResponseMessage(response);
	};

	render() {
		const { apiKey, sessionId, token } = this.props.credentials;
		const { error, connection, publishVideo, tool = Tools.Pencil } = this.state || {};

		return (
			<MuiThemeProvider>
				<div className='body-container'>
					<div id="header">
						<header
							style={{
								backgroundImage: `url("${AssetStore.get('assets/images/backgrounds/bg_topPanel.jpg')}")`
							}}
						>
							<img src={AssetStore.get('assets/images/tools/cfa-logo-lc-alt.png')}/>
						</header>
					</div>
					<div className="columns">
						<div className="column is-narrow">
							<div className="tools-panel">
								<div className="margin-top-xsmall">
									<ToolItem
										src={AssetStore.get('assets/images/tools/pointer.png')}
										onClick={this.onChangeTool.bind(this, Tools.Select)}
										active={tool === Tools.Select}
									/>
								</div>
								<div className="margin-top-small">
									<ToolItem
										src={AssetStore.get('assets/images/tools/ellipse.png')}
										onClick={this.onChangeTool.bind(this, Tools.Circle)}
										active={tool === Tools.Circle}
									/>
								</div>
								<div className="margin-top-small">
									<ToolItem
										src={AssetStore.get('assets/images/tools/pencil.png')}
										onClick={this.onChangeTool.bind(this, Tools.Pencil)}
										active={tool === Tools.Pencil}
									/>
								</div>
								<div className="margin-top-small">
									<ToolItem
										src={AssetStore.get('assets/images/tools/grid-1.png')}
										onClick={this.onChangeTool.bind(this, Tools.Pan)}
										active={tool === Tools.Pan}
									/>
								</div>
								<div className="margin-top-small">
									<ToolItem src={AssetStore.get('assets/images/tools/text.png')}/>
								</div>
								<div className="margin-top-small margin-bottom-xsmall">
									<ToolItem src={AssetStore.get('assets/images/tools/quicktext.png')}/>
								</div>
							</div>
						</div>
						<div className="column is-9">
							<Canvas
								session={this._session}
								tool={tool}
							/>
						</div>
						<div className="column">
							<div className="right-panel">
								<OTSession
									apiKey={apiKey}
									sessionId={sessionId}
									token={token}
									onError={this.onSessionError}
									eventHandlers={this.sessionEventHandlers}
									ref={this.onSessionReady}
								>
									<OTPublisher
										properties={{
											publishVideo, style: {
												buttonDisplayMode: 'on',
											}
										}}
										onPublish={this.onPublish}
										onError={this.onPublishError}
										eventHandlers={this.publisherEventHandlers}
									/>
									<OTStreams>
										<OTSubscriber
											properties={{ width: 100, height: 100 }}
											onSubscribe={this.onSubscribe}
											onError={this.onSubscribeError}
											eventHandlers={this.subscriberEventHandlers}
										/>
									</OTStreams>
								</OTSession>
								<Widget
									handleNewUserMessage={this.handleNewUserMessage}
									title="My new awesome title"
									subtitle="test haleeq"
									profileAvatar={AssetStore.get('assets/icons/boy.svg')}
								/>
							</div>
						</div>
					</div>
				</div>
			</MuiThemeProvider>
		);
	}
}
