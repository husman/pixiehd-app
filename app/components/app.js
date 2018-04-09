import React from 'react';
import { OTSession, OTPublisher, OTStreams, OTSubscriber, createSession } from 'opentok-react/dist';
import ToolItem from './ToolItem'
import Canvas from './Whiteboard';
import AssetStore from '../../lib/AssetStore';
import { Tools } from "react-sketch/lib/index";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ChatBox from './ChatBox';
import { GridList } from 'material-ui/GridList';
import { connect } from "react-redux";


class App extends React.Component {
	_session = null;

	constructor(...props) {
		super(...props);

		this.state = {
			error: null,
			connection: 'Connecting',
			publishAudio: true,
			publishVideo: false,
			streams: [],
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
			videoEnabled: () => {
				console.log('Publisher video enabled');
			},
			videoDisabled: () => {
				console.log('Publisher video disabled');
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

	componentWillMount() {
		const { apiKey, sessionId, token } = this.props.credentials;

		this.sessionHelper = createSession({
			apiKey: apiKey,
			sessionId: sessionId,
			token: token,
			onStreamsUpdated: streams => {
				this.setState({ streams });
			}
		});
	}

	componentWillUnmount() {
		this.sessionHelper.disconnect();
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

	toggleMicrophone = () => {
		this.setState({ publishAudio: !this.state.publishAudio });
	};

	onSessionReady = (ref) => {
		if (ref) {
			this._session = ref.sessionHelper.session;
		}
	};

	onPanelTabClick = (e) => {
		this.setState({
			activePanel: e.target.id,
		});
	};

	onChangeTool = function (tool) {
		console.log('changing the tool to', tool);
		this.setState({
			tool,
		})
	};

	render() {
		const { apiKey, sessionId, token } = this.props.credentials;
		const {
			fullName
		} = this.props;
		const {
			error,
			connection,
			publishAudio,
			publishVideo,
			tool = Tools.Pencil,
			activePanel = 'tab-video'
		} = this.state || {};

		const styles = {
			root: {
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'space-around',
			},
			gridList: {
				height: '50%',
				overflowY: 'auto',
			},
		};

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
							<div className="tools-panel margin-bottom-small">
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
										src={AssetStore.get('assets/images/tools/text.png')}
										onClick={this.onChangeTool.bind(this, Tools.Text)}
										active={tool === Tools.Text}
									/>
								</div>
							</div>

							<div className="tools-panel">
								<div className="margin-top-xsmall">
									<ToolItem
										src={AssetStore.get(`assets/images/tools/mic-${publishAudio ? 'on' : 'off'}.png`)}
										onClick={this.toggleMicrophone}
									/>
								</div>
								<div className="margin-top-small">
									<ToolItem
										src={AssetStore.get(`assets/images/tools/video-${publishVideo ? 'on' : 'off'}.png`)}
										className="tool-item--video"
										onClick={this.toggleVideo}
									/>
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
							<GridList
								cols={1}
								style={styles.gridList}
							>
								<div className="right-panel">
									<input
										type="radio"
										id="tab-video"
										name="tabs"
										checked={activePanel === 'tab-video'}
										onChange={this.onPanelTabClick}
									/>
									<label htmlFor="tab-video">VIDEO</label>

									<input
										type="radio"
										id="tab-files"
										name="tabs"
										checked={activePanel === 'tab-files'}
										onChange={this.onPanelTabClick}
									/>
									<label htmlFor="tab-files">FILES</label>

									<section id="tab-video-content" className="tab-content">
										<OTPublisher
											properties={{
												publishAudio,
												publishVideo,
												style: {
													buttonDisplayMode: 'off',
												},
												name: fullName,
											}}
											session={this.sessionHelper.session}
											eventHandlers={this.publisherEventHandlers}
										/>

										{this.state.streams.map(stream => {
											return (
												<OTSubscriber
													key={stream.id}
													session={this.sessionHelper.session}
													stream={stream}
													properties={{
														style: {
															nameDisplayMode: 'on',
														},
													}}
												/>
											);
										})}
									</section>

									<section id="tab-files-content" className="tab-content">
										<div style={{ textAlign: 'center' }}>
											Coming Soon...
										</div>
									</section>
								</div>
							</GridList>
							<ChatBox/>
						</div>
					</div>
				</div>
			</MuiThemeProvider>
		);
	}
}

function mapStateToProps(state) {
	const {
		user: {
			fullName,
			initials,
		},
	} = state;

	return {
		fullName: fullName || initials,
	};
}

export default connect(mapStateToProps, null)(App)
