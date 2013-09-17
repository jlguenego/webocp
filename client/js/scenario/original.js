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

		this.ls = function(path, on_success, on_error) {
			ocp.client.async_command({
				action: 'ls',
				path: '/' + ocp.session.user_id + path
			}, this.endpoint, on_success, on_error);
		};

		this.mkdir = function(path, name, on_success, on_error) {
			ocp.client.async_command({
				action: 'mkdir',
				path: '/' + ocp.session.user_id + path,
				name: name
			}, this.endpoint, on_success, on_error);
		};

		this.rm = function(path) {
			ocp.client.command({
				action: 'rm',
				path: '/' + ocp.session.user_id + path
			}, this.endpoint);
		};

		this.mv = function(old_path, new_path) {
			ocp.client.command({
				action: 'mv',
				old_path: '/' + ocp.session.user_id + old_path,
				new_path: '/' + ocp.session.user_id + new_path
			}, this.endpoint);
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