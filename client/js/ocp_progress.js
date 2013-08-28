(function(ocp, undefined) {
	ocp.progress = function(progress_bar_func) {
		return {
			update: function(performed, total) {
				var percent = Math.floor((performed * 100) / total);
				progress_bar_func(percent);
			}
		};
	}
})(ocp)