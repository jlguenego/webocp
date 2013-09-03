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
			localStorage.setItem('ocp_client', JSON.stringify(g_ocp_client));
		}
	}

	this.restoreLocal = function() {
		if (localStorage) {
			var obj = localStorage.getItem('ocp_client');
			if (obj) {
				g_ocp_client = JSON.parse(obj);
				if (g_ocp_client.session) {
					g_session = g_ocp_client.session;
				}
			} else {
				g_ocp_client = {
					server_base_url: 'http://www.ocpforum.org',
					session: null
				};
			}
		}
	}
}

var ocp = new OCP();

ocp.cfg = {};