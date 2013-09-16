(function(ocp, undefined) {
	ocp.test = {};

	ocp.test.sleep = function(time) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', ocp.cfg.server_base_url + '/webocp/server/test/endpoint/wait.php?time=' + time, false);
		xhr.send();
	};
})(ocp);