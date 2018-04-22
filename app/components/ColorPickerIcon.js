import React from 'react';
import BorderColor from 'material-ui/svg-icons/editor/border-color';

export default class ToolItem extends React.Component {
	render() {
		const { color, onClick } = this.props;
		return (
			<div
				className="tool-item"
				onClick={onClick}
				style={{
					paddingTop: '2px',
				}}
			>
				<BorderColor
					color={color}
					style={{
						width: '20px',
						height: '20px',
					}}
				/>
			</div>
		);
	}
}
