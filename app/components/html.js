import React from 'react';

function renderState(context) {
	return {
		__html: `window.__react_context__ = "${encodeURIComponent(JSON.stringify(context))}";`,
	};
}

export default class HTML extends React.Component {
	render() {
		const { state, assetBasePath } = this.props;
		const context = {
			state,
			assetBasePath,
		};

		return (
			<html lang="en">
			<head>
				<title>CFA - Live Classroom</title>
				<link rel="stylesheet" type="text/css" href={`${assetBasePath}/dist/styles.css`}/>
			</head>
			<body>
			<div id="app">
			</div>
			<script type="text/javascript" dangerouslySetInnerHTML={renderState(context)}></script>
			<script type="text/javascript" src={`${assetBasePath}/dist/app.js`}></script>
			</body>
			</html>
		);
	}
}