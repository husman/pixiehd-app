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
import FileUploader from './FileUploader';
import SocketClient from '../../lib/SocketClient';
import uuid from 'uuid';
import { SketchPicker } from 'react-color'
import ColorPickerIcon from './ColorPickerIcon';

class App extends React.Component {
	_session = null;
	_canvas = null;

	constructor(...props) {
		super(...props);

		this.state = {
			error: null,
			connection: 'Connecting',
			publishAudio: true,
			publishVideo: false,
			streams: [],
			isColorPickerVisible: false,
		};

		this.sessionEventHandlers = {
			sessionConnected: () => {
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

	// stateChanged(props, currentState, nextState) {
	// 	return props.some(prop => currentState[prop] !== nextState[prop]);
	// }

	// shouldComponentUpdate(nextProps, nextState) {
	// 	const stateProperties = [
	// 		'isColorPickerVisible',
	// 		'publishAudio',
	// 		'publishVideo',
	// 		'streams',
	// 		'tool',
	// 		'hexColor',
	// 		'activePanel',
	// 	];
	// 	return this.stateChanged(stateProperties, this.state, nextState);
	// }

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
		this.setState({
			tool,
		})
	};

	onCanvasInit = (canvas) => {
		this._canvas = canvas;
	};

	onAddToCanvas = (file) => {
		fabric.Image.fromURL(file.img, (element) => {
			const ratio = element.width / element.height;
			let width = this._canvas.width / 2;
			let height = this._canvas.height / 2;

			if (element.width > element.height) {
				height = width / ratio;
			} else {
				width = height * ratio;
			}

			const imgLeft = (this._canvas.width - width) / 2;
			const imgTop = (this._canvas.height - height) / 2;

			const img = element.set({
				left: imgLeft,
				top: imgTop,
				width,
				height,
			});

			img.id = uuid.v4();

			this._canvas.add(img);

			const data = {
				path: {
					left: imgLeft,
					top: imgTop,
					width,
					height,
					src: file.img,
				},
				width: this._canvas.width,
				height: this._canvas.height,
				id: img.id,
			};

			SocketClient.emit('canvas:image:created', data);
		});
	};

	toggleColorPicker = (e) => {
		e.stopPropagation();
		this.setState({
			isColorPickerVisible: !this.state.isColorPickerVisible,
		})
	};

	cleanUpUI = () => {
		this.setState({
			isColorPickerVisible: false,
		})
	};

	onColorPickerContainerClicked = (e) => {
		e.stopPropagation();
	};

	onColorPickerChanged = (color) => {
		this.setState({
			color,
			hexColor: color.hex,
		});
	};

	render() {
		const { apiKey, sessionId, token } = this.props.credentials;
		const {
			fullName
		} = this.props;
		const {
			publishAudio,
			publishVideo,
			tool = Tools.Pencil,
			activePanel = 'tab-video',
			isColorPickerVisible,
			color,
			hexColor,
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
				width: '95%',
				margin: '-2px auto',
			},
		};

		const videoSource = !publishVideo ? { videoSource: null } : {};

		return (
			<MuiThemeProvider>
				<div className='body-container' onClick={this.cleanUpUI}>
					<div id="header">
						<header
							style={{
								backgroundImage: `url("${AssetStore.get('assets/images/backgrounds/bg_topPanel.jpg')}")`
							}}
						>
							<img src={AssetStore.get('assets/images/tools/cfa-logo-lc-alt.png')}/>
						</header>
					</div>
					<div className="body-wrapper">
						<div className="tools-panel-wrapper">
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
								<div className="margin-top-small">
									<ColorPickerIcon
										color={hexColor}
										onClick={this.toggleColorPicker}
									/>
									{isColorPickerVisible ?
										<div className="color-picker" onClick={this.onColorPickerContainerClicked}>
											<SketchPicker
												disableAlpha
												color={color}
												onChangeComplete={this.onColorPickerChanged}
											/>
										</div>
										: null
									}
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
						<div className="canvas-wrap">
							<Canvas
								session={this._session}
								tool={tool}
								color={hexColor}
								onInit={this.onCanvasInit}
							/>
						</div>
						<div className="right-panel-wrapper">
							<GridList
								cols={1}
								style={styles.gridList}
								spacing={0}
								className="video-grid"
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
												...videoSource,
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
											<FileUploader
												onAddToCanvas={this.onAddToCanvas}
											/>
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
