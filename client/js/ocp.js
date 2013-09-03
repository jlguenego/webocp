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

	this.saveLocal = function() {
		if (localStorage) {
			localStorage.setItem('ocp_client', JSON.stringify(ocp.cfg));
		}
	}

	this.restoreLocal = function() {
		if (localStorage) {
			var obj = localStorage.getItem('ocp_client');
			if (obj) {
				ocp.cfg = JSON.parse(obj);
				if (ocp.cfg.session) {
					g_session = ocp.cfg.session;
				}
			} else {
				ocp.cfg = {
					server_base_url: 'http://www.ocpforum.org',
					session: null
				};
			}
		}
	}
}

var ocp = new OCP();

ocp.cfg = {};