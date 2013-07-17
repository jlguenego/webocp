function Tree (items) {
	this.items = this._buildTree;
}

function TreeItem(label, items) {
	this.label = label;
	this.items = items || null;
}

TreeItem.prototype.isExpandable = function() {
	return this.items != null;
}