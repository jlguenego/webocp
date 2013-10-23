(function(ocp, undefined) {
	//var console = {};
	//console.log = function() {};

	ocp.scenario.OCP1 = function() {
		this.register = function(args) {
			var name = args.name;
			var email = args.email;
			var password = args.password;

			var public_address = ocp.dht.get_address(email);
			var public_content = {
				email: email,
				name: name
			};
			var private_address = ocp.dht.get_address(ocp.crypto.combine(email, password));
			var private_content = {
				root_dir: {},
				email: email,
				name: name,
				secret_key: ocp.crypto.generate_secret_key()
			};

			ocp.session = {
				ocp1: {
					password: password,
					public: {
						address: public_address,
						content: public_content
					},
					private: {
						address: private_address,
						content: private_content
					}
				},
				user_id: public_address,
				rsa: {
					// TODO: Define key pair
					public_key: 'titi',
					private_key: 'toto'
				}
			};

			this.sync_connection_objects();
		};

		this.login = function(args) {
			try {
				var email = args.email;
				var password = args.password;
				console.log('email=' + email);
				console.log('password=' + password);

				var public_address = ocp.dht.get_address(email);
				var private_address = ocp.dht.get_address(ocp.crypto.combine(email, password));
				ocp.session = {};
				console.log('public_address=' + public_address);
				console.log('private_address=' + private_address);
				var public_content = JSON.parse(ocp.utils.ab2str(ocp.block.retrieve_sync(public_address)));
				var content = ocp.block.retrieve_sync(private_address);
				var private_content = JSON.parse(ocp.utils.ab2str(this.decrypt(password, content)));
				console.log('private_content=');
				console.log(private_content);

				ocp.session = {
					ocp1: {
						password: password,
						public: {
							address: public_address,
							content: public_content
						},
						private: {
							address: private_address,
							content: private_content
						}
					},
					user_id: public_address,
					rsa: {
						// TODO: Define key pair
						public_key: 'titi',
						private_key: 'toto'
					}
				};
			} catch (e) {
				console.log(e.stack);
				ocp.session = {};
			}
		};

		this.ls = function(path, onsucess, onerror) {
			try {
				console.log('ls with path=' + path);
				console.log(ocp.session);
				var path_a = [];
				if (path != '/') {
					path_a = path.split('/');
					path_a.shift();
				}

				var dir = ocp.session.ocp1.private.content.root_dir;
				console.log('path_a=');
				console.log(path_a);
				for (var i = 0; i < path_a.length; i++) {
					dir = dir[path_a[i]].children;
				}
				console.log(dir);
				var result = [];
				for (var name in dir) {
					var file = JSON.parse(JSON.stringify(dir[name]));
					file.name = name;
					result.push(file);
				}
				console.log('ocp1 ls result=');
				console.log(result);
				this.sync_connection_objects();
				onsucess(result);
			} catch (e) {
				console.log('error=');
				console.log(e.stack);
				onerror(e);
			}
		};

		this.mkdir = function(path, name, onsuccess, onerror) {
			onsuccess = onsuccess || function() {};
			onerror = onerror || function() {};
			console.log('mkdir');
			console.log('path=' + path);
			console.log('name=' + name);
			console.log(ocp.session);
			var path_a = [];
			if (path != '/') {
				path_a = path.split('/');
				path_a.shift();
			}

			var dir = ocp.session.ocp1.private.content.root_dir;
			console.log('path_a=');
			console.log(path_a);
			for (var i = 0; i < path_a.length; i++) {
				if (!dir[path_a[i]]) {
					dir[path_a[i]] = {
						label: path_a[i],
						type: 'dir',
						size: 0,
						last_modified: 0,
						children: {}
					};
				}
				dir = dir[path_a[i]].children;
			}
			console.log(dir);
			if (!dir[name]) {
				dir[name] = {
					label: name,
					type: 'dir',
					size: 0,
					last_modified: 0,
					children: {}
				};
				this.sync_connection_objects();
			}

			onsuccess();
		};

		this.mkfile = function(path, name, file_descr) {
			console.log('mkfile with path=' + path + ' and name=' + name);
			console.log(ocp.session);
			var path_a = [];
			if (path != '/') {
				path_a = path.split('/');
				path_a.shift();
			}

			var dir = ocp.session.ocp1.private.content.root_dir;
			console.log('path_a=');
			console.log(path_a);
			for (var i = 0; i < path_a.length; i++) {
				if (!dir[path_a[i]]) {
					console.log('creating subdir ' + path_a[i]);
					dir[path_a[i]] = {
						label: path_a[i],
						type: 'dir',
						size: 0,
						last_modified: 0,
						children: {}
					};
				}
				dir = dir[path_a[i]].children;
			}
			console.log(dir);
			console.log('creating file ' + name);
			dir[name] = file_descr;
			this.sync_connection_objects();
		};

		this.sync_connection_objects = function() {
			console.log('ocp.session.ocp1.private.content=');
			console.log(ocp.session.ocp1.private.content);

			var serialized_private_content = ocp.crypto.serialize(ocp.session.ocp1.private.content);
			console.log(serialized_private_content);
			console.log(serialized_private_content.byteLength);
			var private_content = this.crypt(
				ocp.session.ocp1.password, serialized_private_content);
			console.log(private_content);
			console.log(private_content.byteLength);
			var ab = new ArrayBuffer(0);
			console.log('private content');
			ocp.block.send(ocp.session.ocp1.private.address, private_content, ab);
			console.log('public content');
			console.log(ocp.session.ocp1.public.content);
			ocp.block.send(ocp.session.ocp1.public.address, ocp.crypto.serialize(ocp.session.ocp1.public.content), ab);
			console.log('public content done');
			if (ocp.session.remember_me) {
				ocp.cfg.session = ocp.session;
				ocp.storage.saveLocal();
			}
		};

		this.crypt = function(password, content) {
			return content;
			//return ocp.crypto.pcrypt(password, content);
		};

		this.decrypt = function(password, content) {
			return content;
			//return ocp.crypto.pdecrypt(password, content);
		};

		this.rm = function(path, onsucess, onerror) {
			var self = this;
			if (path == '/') {
				throw new Error('Cannot get address for path root');
			}

			var path_a = path.split('/');
			path_a.shift();
			var name = path_a.pop();

			var dir = ocp.session.ocp1.private.content.root_dir;
			console.log('path_a=');
			console.log(path_a);
			for (var i = 0; i < path_a.length; i++) {
				dir = dir[path_a[i]].children;
			}
			console.log(dir);
			var address = dir[name].address;
			var args = {
				filename: address,
				secret_key: ocp.session.ocp1.private.content.secret_key,
			};
			var remove_onsuccess = function() {
				delete dir[name];
				self.sync_connection_objects();
				onsucess();
			};

			ocp.transfer.remove(args, remove_onsuccess, function(error_msg) {
				console.log('warning: the file blocks was not removed successfully. Error: ' + error_msg);
				remove_onsuccess();
			});
		};

		this.mv = function(old_path, new_path) {
			console.log('mv');
			console.log(ocp.session);
			if (old_path == '/') {
				return;
			}
			if (new_path == '/') {
				return;
			}

			var path_a = old_path.split('/');
			path_a.shift();
			var name = path_a.pop();

			var dir = ocp.session.ocp1.private.content.root_dir;
			console.log('path_a=');
			console.log(path_a);
			for (var i = 0; i < path_a.length; i++) {
				dir = dir[path_a[i]].children;
			}
			console.log(dir);
			var old_file = JSON.parse(JSON.stringify(dir[name]));
			delete dir[name];

			// Going to replace the object

			path_a = new_path.split('/');
			path_a.shift();
			var name = path_a.pop();
			old_file.label = name;

			dir = ocp.session.ocp1.private.content.root_dir;
			console.log('path_a=');
			console.log(path_a);
			for (var i = 0; i < path_a.length; i++) {
				dir = dir[path_a[i]].children;
			}
			console.log(dir);
			dir[name] = old_file;

			this.sync_connection_objects();
		};

		this.upload_file = function(path, file, onsuccess, onprogress) {
			var args = {
				file: file,
				secret_key: ocp.session.ocp1.private.content.secret_key,
				onprogress: onprogress
			};
			console.log('args=');
			console.log(args);
			var self = this;
			ocp.transfer.upload(args, function(address) {
				self.mkfile(path, file.name, {
					label: file.name,
					type: 'file',
					size: file.size,
					last_modified: file.lastModifiedDate.getTime() / 1000,
					address: address
				});
				onsuccess();
			});
		};

		this.upload_dir = function(path, relative_path, form, after_success) {
			var formData = new FormData(form);
			formData.append('action', 'upload_dir');
			formData.append('relative_path', relative_path);

			var fieldname = $(form).find('input').attr('name');
			// Remove the ending []
			fieldname = fieldname.substr(0, fieldname.length - 2);
			formData.append('input_name', fieldname);
			formData.append('path', '/' + ocp.session.user_id + path);
			var result = null;
		    $.ajax({
		        url: this.endpoint,  //server script to process data
		        type: 'POST',
		        data: formData,
		        success: function(data) {
					try {
						console.log(data);
						var output = $.parseJSON(data);
						if (output.error) {
							throw new Error('Server answered: ' + output.error);
						}
						if (output.result) {
							result = output.result;
						}
					} catch (e) {
						ocp.error_manage(e);
						return;
					}
					if (after_success) {
						after_success();
					}
				},
		        error: function(jqXHR, textStatus, errorThrown) {
					console.log('ocp.client.ls error');
					console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
				},
		        //Options to tell JQuery not to process data or worry about content-type
		        cache: false,
		        contentType: false,
		        processData: false
		    });
			return result;
		};

		this.download_file = function(path, onsuccess, onprogress, onerror) {
			onsuccess = onsuccess || function() {};
			onprogress = onprogress || function() {};
			onerror = onerror || function() {};
			console.log('downloading file ' + path);
			var address = this.get_address_from_path(path);
			var args = {
				filename: address,
				secret_key: ocp.session.ocp1.private.content.secret_key,
				onprogress: onprogress,
				saveasname: ocp.basename(path)
			};

			ocp.transfer.download(args, onsuccess, onerror);
		};

		// private function
		this.get_address_from_path = function(path) {
			var self = this;
			if (path == '/') {
				throw new Error('Cannot get address for path root');
			}

			var path_a = path.split('/');
			path_a.shift();
			var name = path_a.pop();

			var dir = ocp.session.ocp1.private.content.root_dir;
			console.log('path_a=');
			console.log(path_a);
			for (var i = 0; i < path_a.length; i++) {
				dir = dir[path_a[i]].children;
			}
			console.log(dir);
			var address = dir[name].address;
			return address;
		}
	};
})(ocp);