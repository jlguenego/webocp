function OCP() {
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

