(function(ocp, undefined) {
	ocp.profile = {
		start_t: 0,
		start: function() {
			this.start_t = new Date().getTime();
		},
		report: function() {
			var elapsed = new Date().getTime() - this.start_t;
			if (ocp.debug) {
				console.log('[PROFILE] ' + tag + ': ' + elapsed + 'ms');
			}
		}
	};
})(ocp);