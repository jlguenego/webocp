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

		this.rm = function(path) {
			ocp.client.command({
				action: 'rm',
				path: '/shared_storage' + path
			}, this.endpoint);
		};

		this.mv = function(old_path, new_path) {
			ocp.client.command({
				action: 'mv',
				old_path: '/shared_storage' + old_path,
				new_path: '/shared_storage' + new_path
			}, this.endpoint);
		};

		this.upload_file = function(path, file, after_success_func, on_progress_func) {
			var formData = new FormData();
			formData.append('input_name', 'file');
			formData.append('path', '/shared_storage' + path);
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
							throw new OCPException('Server answered: ' + output.error);
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
	};
})(ocp);