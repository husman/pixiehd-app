import React from 'react';
import { SketchField, Tools } from 'react-sketch';
import SocketClient from '../../lib/SocketClient';
import { connect } from 'react-redux';
import { addPathToCanvas } from '../actions/canvas';
import AssetStore from "../../lib/AssetStore";

class DrawArea extends React.Component {
	_canvas = null;

	onCanvasObjectCreated = ({ path, width, height, id }) => {
		const { width: activeWidth, height: activeHeight } = this._canvas;
		const xFactor = activeWidth / width;
		const yFactor = activeHeight / height;

		const p = fabric['Path'].fromObject(path);
		const scaleX = p.scaleX;
		const scaleY = p.scaleY;
		const left = p.left;
		const top = p.top;

		const tempScaleX = scaleX * xFactor;
		const tempScaleY = scaleY * yFactor;
		const tempLeft = left * xFactor;
		const tempTop = top * yFactor;

		p.id = id;
		p.scaleX = tempScaleX;
		p.scaleY = tempScaleY;
		p.left = tempLeft;
		p.top = tempTop;

		p.setCoords();

		this.props.onAddPathToCanvas(path);
		this._canvas.add(p);
		this._canvas.calcOffset();
		this._canvas.renderAll();
	};

	onCanvasImageCreated = ({ path, width, height, id }) => {
		const { width: activeWidth, height: activeHeight } = this._canvas;
		const xFactor = activeWidth / width;
		const yFactor = activeHeight / height;
		const left = path.left * xFactor;
		const top = path.top * yFactor;
		const imgWidth = path.width * xFactor;
		const imgHeight = path.height * yFactor;

		fabric.Image.fromURL(path.src, (element) => {
			const img = element.set({
				left,
				top,
				width: imgWidth,
				height: imgHeight,
			});

			img.id = id;

			this._canvas.add(img);
			this._canvas.calcOffset();
			this._canvas.renderAll();
		});
	};

	onCanvasNewText = ({ path, width, height, id }) => {
		const { width: activeWidth, height: activeHeight } = this._canvas;
		const xFactor = activeWidth / width;
		const yFactor = activeHeight / height;

		const p = fabric['Path'].fromObject(path);
		const originalLeft = p.left;
		const originalTop = p.top;

		const left = originalLeft * xFactor;
		const top = originalTop * yFactor;

		const text = new fabric.IText(path.text, {
			left,
			top,
			fill: path.fill,
		});
		text.id = id;

		this._canvas.add(text);
		this._canvas.renderAll();
	};

	initialize = (canvas) => {
		if (!canvas) {
			return;
		}

		this._canvas = canvas._fc;

		if (this.props.onInit) {
			this.props.onInit(this._canvas);
		}

		this._canvas.on('path:created', (e) => {
			e.path.id = new Date().getTime();

			const data = {
				path: e.path.toJSON(),
				width: this._canvas.width,
				height: this._canvas.height,
				id: e.path.id,
			};

			SocketClient.emit('canvas:path:created', data);
		});

		this._canvas.on('object:modified', (e) => {
			const data = {
				id: e.target.id,
				path: e.target.toJSON(),
				width: this._canvas.width,
				height: this._canvas.height,
			};

			SocketClient.emit('canvas:object:modified', data);
		});

		SocketClient.on('canvas:path:created', this.onCanvasObjectCreated);
		SocketClient.on('canvas:image:created', this.onCanvasImageCreated);

		SocketClient.on('canvas:object:modified', ({ path, width, height, id }) => {
			const element = this._canvas.getObjects().find(obj => obj.id === id);
			const isNewText = !element && path.type === 'i-text';
			const isTextEdit = element && element.text !== path.text;

			if (isNewText) {
				this.onCanvasNewText({ path, width, height, id });
				return;
			}

			if (isTextEdit) {
				element.text = path.text;
				this._canvas.renderAll();
				return;
			}

			if (!element) {
				return;
			}

			const { width: activeWidth, height: activeHeight } = this._canvas;
			const xFactor = activeWidth / width;
			const yFactor = activeHeight / height;

			const p = fabric['Path'].fromObject(path);
			const scaleX = p.scaleX;
			const scaleY = p.scaleY;
			const left = p.left;
			const top = p.top;

			const tempScaleX = scaleX * xFactor;
			const tempScaleY = scaleY * yFactor;
			const tempLeft = left * xFactor;
			const tempTop = top * yFactor;

			element.scaleX = tempScaleX;
			element.scaleY = tempScaleY;
			element.left = tempLeft;
			element.top = tempTop;
			element.angle = path.angle;

			element.setCoords();

			this._canvas.calcOffset();
			this._canvas.renderAll();
		});

		SocketClient.on('canvas:clear', () => {
			this._canvas.clear();
		});
	};

	onClearCanvas = () => {
		this._canvas.clear();
		SocketClient.emit('canvas:clear');
	};

	render() {
		const {
			color = 'black',
			tool,
		} = this.props;

		return (
			<div className="canvas-wrapper">
				<div className="canvas-action-buttons">
					<img
						src={AssetStore.get('assets/images/buttons/clear.jpg')}
						className="btn"
						onClick={this.onClearCanvas}
					/>
				</div>
				<SketchField
					tool={tool}
					lineColor={color}
					lineWidth={3}
					className="drawArea"
					ref={this.initialize}
				/>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		path: state.path,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAddPathToCanvas: (path) => dispatch(addPathToCanvas(path)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawArea)
