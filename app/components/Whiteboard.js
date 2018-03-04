import React from 'react';
import { SketchField, Tools } from 'react-sketch';
import SocketClient from '../../lib/SocketClient';
import { connect } from 'react-redux';
import { addPathToCanvas } from '../actions/canvas';

class DrawArea extends React.Component {
	_canvas = null;

	initialize = (canvas) => {
		if (!canvas) {
			return;
		}

		this._canvas = canvas._fc;

		this._canvas.on('path:created', (e) => {
			const data = {
				path: e.path.toJSON(),
				width: this._canvas.width,
				height: this._canvas.height,
			};

			SocketClient.emit('canvas:path:created', data);
		});

		SocketClient.on('canvas:path:created', ({ path, width, height }) => {
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

			p.scaleX = tempScaleX;
			p.scaleY = tempScaleY;
			p.left = tempLeft;
			p.top = tempTop;

			p.setCoords();

			this.props.onAddPathToCanvas(path);
			this._canvas.add(p);
			this._canvas.calcOffset();
			this._canvas.renderAll();
		});
	};

	render() {
		const { tool } = this.props;

		return (
			<div className="canvas-wrapper">
				<SketchField
					tool={tool}
					lineColor='black'
					lineWidth={3}
					className="drawArea"
					ref={this.initialize}
				/>
			</div>
		);
	}
}

function mapStateToProps(state, nextState, c) {
	console.log('state', state);
	console.log('nextState', nextState);
	console.log('c', c);
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
