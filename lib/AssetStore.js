class AssetStore {
	_basePath = '';

	init(path) {
		this._basePath = path;
	}

	get(path) {
		return `${this._basePath}/${path}`;
	}
}

export default new AssetStore();
