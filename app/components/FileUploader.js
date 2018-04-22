import React from 'react';
import DropzoneComponent from 'react-dropzone-component';
import LinearProgress from 'material-ui/LinearProgress';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import AddToCanvas from 'material-ui/svg-icons/image/add-to-photos';

const styles = {
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
	},
	gridList: {
		width: '100%',
		height: '100%',
		overflowY: 'auto',
		padding: '0',
	},
};

const componentConfig = {
	iconFiletypes: ['.jpg', '.png', '.gif'],
	showFiletypeIcon: true,
	postUrl: '/upload',
};

export default class FileUploader extends React.Component {
	constructor(...args) {
		super(...args);

		this.state = {
			files: [],
			totalProgress: 0,
		};
	}

	onSuccess = (file) => {
		const {
			name: title,
			xhr: {
				response,
			},
		} = file;

		const {
			responseText: img
		} = JSON.parse(response);
		this.setState({
			files: [
				...this.state.files,
				{
					title,
					img,
				},
			],
		});
	};

	onComplete = () => {
	};

	onQueueComplete = () => {
		this.setState({
			totalProgress: 0,
		});
	};

	onAccept = (file, done) => {
		done();
	};

	onAddedfile = (file) => {
	};

	onTotalUploadProgress = (totalProgress) => {
		this.setState({
			totalProgress,
		});
	};

	onAddToCanvas = (file) => {
		if (this.props.onAddToCanvas) {
			this.props.onAddToCanvas(file);
		}
	};

	render() {
		const {
			totalProgress,
			files,
		} = this.state;

		const eventHandlers = {
			complete: this.onComplete,
			queuecomplete: this.onQueueComplete,
			success: this.onSuccess,
			addedfile: this.onAddedfile,
			totaluploadprogress: this.onTotalUploadProgress,
		};
		const djsConfig = {
			acceptedFiles: 'image/jpeg,image/png,image/gif',
			previewsContainer: false,
			accept: this.onAccept,
			dictDefaultMessage: 'UPLOAD',
		};

		return (
			<div>
				<DropzoneComponent
					config={componentConfig}
					eventHandlers={eventHandlers}
					djsConfig={djsConfig}
				>
				</DropzoneComponent>
				{totalProgress > 0 ?
					<LinearProgress mode="determinate" value={totalProgress}/>
					: null
				}

				<div style={styles.root}>
					<GridList
						style={styles.gridList}
						cols={1}
					>
						{files.map(tile => (
							<GridTile
								key={tile.img}
								title={tile.title}
								actionIcon={
									<IconButton onClick={this.onAddToCanvas.bind(null, tile)}>
										<AddToCanvas color="white"/>
									</IconButton>
								}
							>
								<img src={tile.img}/>
							</GridTile>
						))}
					</GridList>
				</div>
			</div>
		);
	}
}
