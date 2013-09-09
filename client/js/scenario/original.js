(function(ocp, undefined) {
	ocp.scenario.Original = function() {
		this.endpoint = ocp.cfg.server_base_url + '/webocp/server/original/endpoint/';

		this.register = function(args) {
			var name = args.name;
			var email = args.email;
			var password = args.password;

			var public_address = ocp.crypto.hash(email);
			var public_content = {
				email: email,
				name: name
			};
			var private_address = ocp.crypto.hash(email + password);
			var obj = {
				root_dir: public_address,
			};
			var private_content = ocp.crypto.pcrypt(password, ocp.crypto.serialize(obj));

			console.log('url=' + this.endpoint);

			ocp.client.command({
				action: 'register',
				account: {
					public_object: {
						address: public_address,
						content: public_content
					},
					private_object: {
						address: private_address,
						content: ocp.utils.ab2str(private_content)
					}
				}
			}, this.endpoint);
			ocp.session = {};
			ocp.session.user_id = public_address;
		};

		this.login= function(args) {
			var public_address = ocp.crypto.hash(args.email);
			var public_content = {};
			var private_address = ocp.crypto.hash(args.email + args.password);
			var obj = {
				root_dir: public_address,
			};
			var private_content = ocp.crypto.pcrypt(args.password, ocp.crypto.serialize(obj));

			ocp.client.command({
				action: 'login',
				account: {
					public_object: {
						address: public_address,
						content: public_content
					},
					private_object: {
						address: private_address,
						content: ocp.utils.ab2str(private_content)
					}
				}
			}, this.endpoint);

			ocp.session = {};
			ocp.session.user_id = public_address;
		};

		this.ls = function(path) {
			var result = ocp.client.command({
				action: 'ls',
				path: '/' + ocp.session.user_id + path
			}, this.endpoint);
			return result;
		};

		this.mkdir = function(path, name) {
			ocp.client.command({
				action: 'mkdir',
				path: '/' + ocp.session.user_id + path,
				name: name
			}, this.endpoint);
		};

		this.rm = function(path) {
			ocp.client.command({
				action: 'rm',
				path: '/' + ocp.session.user_id + path
			}, this.endpoint);
		};
	};
})(ocp);