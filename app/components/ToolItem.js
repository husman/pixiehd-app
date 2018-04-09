import React from 'react';

export default class ToolItem extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { src, onClick, active, className } = this.props;
		return (
			<div
				className={`tool-item ${active ? 'active' : ''} ${className ? className : ''}`}
				onClick={onClick}
			>
				<img className='tool-item__image' src={src}/>
			</div>
		);
	}
}
