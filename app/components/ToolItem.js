import React from 'react';

export default class ToolItem extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { src, onClick, active } = this.props;
		return (
			<div
				className={`tool-item ${active ? 'active' : ''}`}
				onClick={onClick}
			>
				<img className='tool-item__image' src={src}/>
			</div>
		);
	}
}
