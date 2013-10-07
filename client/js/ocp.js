//é

function OCP() {
	var self = this;

	this.debug = false;

	this.basename = function(path) {
		path = this.normalize_path(path);
		if (path == '/' || path == '') {
			return path;
		}
		var path_a = path.split('/');
		return path_a.pop();
	};

	this.dirname = function(path) {
		if (!path) {
			return '.';
		}
		path = this.normalize_path(path);
		if (path == '/') {
			return '/';
		}
		if (path == '') {
			return '.';
		}

		var b_absolute = false;
		var path_a = path.split('/');
		if (path_a[0] == '') {
			b_absolute = true;
			path_a.shift();
		}
		path_a.pop();
		if (path_a.length == 0) {
			if (b_absolute) {
				return '/';
			} else {
				return '.';
			}
		}
		var result = path_a.join('/');
		if (b_absolute) {
			result = '/' + result;
		}
		return result;
	};

	this.normalize_path = function(path) {
		if (!path) {
			throw new Error('normalize_path: path is not defined or null');
		}
		if (path == '') {
			throw new Error('normalize_path: path is empty');
		}
		path = path.replace(/\\/g,'/');
		var b_absolute = false;
		var path_a = path.split('/');
		if (path_a[0] == '') {
			b_absolute = true;
			path_a.shift();
		}
		var new_path = [];
		var j = 0;
		for (var i = 0; i < path_a.length; i++) {
			var node = path_a[i];
			switch (node) {
				case '':
					break;
				case '.':
					break;
				case '..':
					if (j == 0) {
						if (b_absolute == true) {
							throw new Error('normalize_path: path cannot start with /..');
						}
						new_path[j] = node;
						j++;
					} else {
						new_path.pop();
						j--;
					}
					break;
				default:
					new_path[j] = node;
					j++;
			}
		}


		var result = '';
		if (b_absolute) {
			result = '/';
		}
		result += new_path.join('/');
		return result;
	}

}

var ocp = new OCP();

ocp.cfg = {}; // object stored in localStorage
ocp.session = {}; // object for current session only (disappears on browser close)

Error = Error || function (msg) {
	this.stack = (function() {
		function st2(f) {
			if (!f) {
				return [];
			}
			var args = '';
			if (f.arguments) {
				var args_a = Array.prototype.slice.call(f.arguments);
				args = args_a.join(',');
			}
			var v = [f.toString().split('(')[0].substring(9) + '(' + args + ')'];
			return st2(f.caller).concat(v);
		}
		return st2(arguments.callee.caller);
	})();

	var str = msg;
	this.toString = function() {
		return 'Error: ' + str;
	};
};


String.prototype.padleft = function(length, character) {
	 return new Array(length - this.length + 1).join(character || '0') + this;
};

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};
