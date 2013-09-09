(function(ocp, undefined) {
	ocp.scenario.CryptBlob = function() {
		this.register = function(args) {
			console.log('Crypt Blob args: ');
			console.log(args);
		};

		this.login= function(args) {
			console.log('TODO: login');
		};
	};
})(ocp);