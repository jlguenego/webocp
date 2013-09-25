(function(ocp, undefined) {
	ocp.scenario.OCP1 = function() {

		this.register = function(args) {
			var name = args.name;
			var email = args.email;
			var password = args.password;

			var public_address = ocp.dht.get_address(email);
			var public_content = ocp.crypto.serialize({
				email: email,
				name: name
			});
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
				user_id: public_address
			};

			this.sync_connection_objects();
		};

		this.login = function(args) {
			try {
				var email = args.email;
				var password = args.password;

				var public_address = ocp.dht.get_address(email);
				var private_address = ocp.dht.get_address(email + password);
				ocp.session = {};

				var public_content = ocp.file.retrieve_sync(public_address);
				var content = ocp.file.retrieve_sync(private_address);
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
					user_id: public_address
				};
			} catch (e) {
				ocp.session = {};
			}
		};

		this.ls = function(path, on_success, on_error) {
			console.log('ls');
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
			console.log(result);
			on_success(result);
		};

		this.mkdir = function(path, name, on_success, on_error) {
			console.log('mkdir');
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
			dir[name] = {
				label: name,
				type: 'dir',
				size: 0,
				last_modified: 0,
				children: {}
			};
			this.sync_connection_objects();

			on_success();
		};

		this.sync_connection_objects = function() {
			console.log('ocp.session.ocp1.private.content=');
			console.log(ocp.session.ocp1.private.content);

			var private_content = this.crypt(
				ocp.session.ocp1.password, ocp.crypto.serialize(ocp.session.ocp1.private.content));
			ocp.file.send(ocp.session.ocp1.private.address, private_content);
			ocp.file.send(ocp.session.ocp1.public.address, ocp.session.ocp1.public.content);

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

		this.rm = function(path, on_success, on_error) {
			console.log('rm');
			console.log(ocp.session);
			if (path == '/') {
				return;
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
			delete dir[name];
			this.sync_connection_objects();

			on_success();
		};

		this.mv = function(old_path, new_path) {

		};

		this.upload_file = function(path, file, after_success_func, on_progress_func) {
			var formData = new FormData();
			formData.append('input_name', 'file');
			formData.append('path', '/' + ocp.session.user_id + path);
			formData.append('file[]', file);
			var result = null;
		    $.ajax({
		        url: this.endpoint + '?action=upload_file&file_size=' + file.size,  //server script to process data
		        type: 'POST',
		        data: formData,
		        async: true,
		        xhr: function() {  // custom xhr
		            var myXhr = $.ajaxSettings.xhr();
		            if(myXhr.upload){ // check if upload property exists
		                myXhr.upload.addEventListener('progress', function(e) {
		                	if (on_progress_func) {
			                	on_progress_func(e, file.name);
			                }
		                }, false); // for handling the progress of the upload
		            }
		            return myXhr;
		        },
		        beforeSend: function() {},
		        success: function(data) {
					try {
						var e = $.Event('progress');
						e.total = 1;
						e.loaded = 1;
						if (on_progress_func) {
							on_progress_func(e, file.name);
						}
						//console.log(data);
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
					if (after_success_func) {
						after_success_func();
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

		this.download_file = function(path) {
			window.location = this.endpoint + 'download.php?path=' + '/' + ocp.session.user_id + path;
		};
	};
})(ocp);