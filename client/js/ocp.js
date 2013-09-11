//é

function OCP() {
	var self = this;

	this.debug = false;

	this.basename = function(path) {
	    return path.replace(/\\/g,'/').replace( /.*\//, '' );
	};

	this.dirname = function(path) {
	    var result = path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
	    if (result == '') {
	    	result = '/';
	    }
	    return result;
	};
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