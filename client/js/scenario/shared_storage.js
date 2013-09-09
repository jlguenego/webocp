(function(ocp, undefined) {
	ocp.scenario.SharedStorage = function() {
		this.endpoint = ocp.cfg.server_base_url + '/webocp/server/shared_storage/endpoint/';

		this.register = function(args) {
			console.log('Shared Storage args: ');
			console.log(args);

			var my_args = {
				action: 'register',
				name: args.name,
				email: args.email,
				password: args.password
			};
			ocp.client.command(my_args, this.endpoint);

			ocp.session = {};
			ocp.session.user_id = args.email;
		};

		this.login= function(args) {
			var my_args = {
				action: 'login',
				email: args.email,
				password: args.password
			};
			ocp.client.command(my_args, this.endpoint);

			ocp.session = {};
			ocp.session.user_id = args.email;
		};

		this.ls = function(path) {
			var result = ocp.client.command({
				action: 'ls',
				path: '/shared_storage' + path
			}, this.endpoint);
			return result;
		};



		this.mkdir = function(path, name) {
			ocp.client.command({
				action: 'mkdir',
				path: '/shared_storage' + path,
				name: name
			}, this.endpoint);
		};
	};
})(ocp);