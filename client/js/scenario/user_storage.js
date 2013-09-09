(function(ocp, undefined) {
	ocp.scenario.UserStorage = function() {
		this.register = function(args) {
			console.log('User Storage args: ');
			console.log(args);
		};
	};
})(ocp);