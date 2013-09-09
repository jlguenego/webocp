(function(ocp, undefined) {
	ocp.scenario.UserStorage = function() {
		this.register = function(args) {
			console.log('User Storage args: ');
			console.log(args);
		};

		this.login= function(args) {
			console.log('TODO: login');
		};
	};
})(ocp);