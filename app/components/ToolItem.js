import React from 'react';

export default class ToolItem extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { disabled, src, onClick, active, className } = this.props;
		const props = {};

		if (!disabled && onClick) {
			props.onClick = onClick;
		}

		return (
			<div
				className={`tool-item ${active ? 'active' : ''} ${className ? className : ''} ${disabled ? 'disabled' : ''}`}
        {...props}
			>
				<img className='tool-item__image' src={src}/>
			</div>
		);
	}
}
