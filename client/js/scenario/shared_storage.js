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
			ocp.ajax.command(my_args, this.endpoint);

			ocp.session = {};
			ocp.session.user_id = args.email;
		};
	};
})(ocp);