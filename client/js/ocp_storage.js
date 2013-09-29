(function(ocp, undefined) {
	ocp.storage = {};

	ocp.storage.saveLocal = function() {
		console.log('save local');
		if (localStorage) {
			console.log(ocp.cfg);
			localStorage.setItem('ocp_client', JSON.stringify(ocp.cfg));
		}
	}

	ocp.storage.restoreLocal = function() {
		if (localStorage) {
			var obj = localStorage.getItem('ocp_client');
			if (obj) {
				ocp.cfg = JSON.parse(obj);
				if (ocp.cfg.session) {
					ocp.session = ocp.cfg.session;
				}
				return;
			}
		}
		ocp.cfg = {
			server_base_url: 'http://www.ocpforum.org',
			sponsor_name: 'node0',
			session: null,
			scenario: '0',
			pool: {
				thread_nbr: {
					upload_dir: 3,
					upload_file: 5,
					download_file: 6
				}
			},
			block_size: 1 << 19
		};
	}
})(ocp);

//localStorage.removeItem('ocp_client');
ocp.storage.restoreLocal();