(function(ocp, undefined) {
	ocp.scenario.SharedStorage = function() {
		this.endpoint = ocp.cfg.server_base_url + '/webocp/server/shared_storage/endpoint/';
		this.get_prefix_path = function() {
			return '/shared_storage';
		}

		this.register = function(args) {
			console.log('Shared Storage args: ');
			console.log(args);

			var my_args = {
				action: 'register',
				name: args.name,
				email: args.email,
				password: args.password
			};
			ocp.filesystem.command(my_args, this.endpoint);

			ocp.session = {};
			ocp.session.user_id = args.email;
		};

		this.login= function(args) {
			var my_args = {
				action: 'login',
				email: args.email,
				password: args.password
			};
			ocp.filesystem.command(my_args, this.endpoint);

			ocp.session = {};
			ocp.session.user_id = args.email;
		};

		this.ls = function(path, onsuccess, onerror) {
			ocp.filesystem.async_command({
				action: 'ls',
				path: this.get_prefix_path() + path
			}, this.endpoint, onsuccess, onerror);
		};

		this.mkdir = function(path, name, onsuccess, onerror) {
			ocp.filesystem.async_command({
				action: 'mkdir',
				path: this.get_prefix_path() + path,
				name: name
			}, this.endpoint, onsuccess, onerror);
		};

		this.rm = function(path, onsuccess, onerror) {
			ocp.filesystem.async_command({
				action: 'rm',
				path: this.get_prefix_path() + path
			}, this.endpoint, onsuccess, onerror);
		};

		this.mv = function(old_path, new_path) {
			ocp.filesystem.command({
				action: 'mv',
				old_path: this.get_prefix_path() + old_path,
				new_path: this.get_prefix_path() + new_path
			}, this.endpoint);
		};

		this.upload_file = function(path, file, onsuccess, onprogress) {
			var formData = new FormData();
			formData.append('input_name', 'file');
			formData.append('path', this.get_prefix_path() + path);
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
		                	if (onprogress) {
		                		var performed = e.loaded * 100 / e.total;
			                	onprogress(performed);
			                }
		                }, false); // for handling the progress of the upload
		            }
		            return myXhr;
		        },
		        beforeSend: function() {},
		        success: function(data) {
					try {
						if (onprogress) {
							onprogress(100);
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
					if (onsuccess) {
						onsuccess();
					}
				},
		        error: function(jqXHR, textStatus, errorThrown) {
					console.log('ocp.filesystem.ls error');
					console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
				},
		        //Options to tell JQuery not to process data or worry about content-type
		        cache: false,
		        contentType: false,
		        processData: false
		    });
		    return result;
		};

		this.upload_dir = function(path, relative_path, form, onsuccess, on_progress_func) {
			var formData = new FormData(form);
			console.log(form);
			formData.append('action', 'upload_dir');
			formData.append('relative_path', relative_path);

			var fieldname = $(form).find('input').attr('name');
			// Remove the ending []
			fieldname = fieldname.substr(0, fieldname.length - 2);
			formData.append('input_name', fieldname);
			formData.append('path', this.get_prefix_path() + path);
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
					if (onsuccess) {
						onsuccess();
					}
				},
		        error: function(jqXHR, textStatus, errorThrown) {
					console.log('ocp.filesystem.ls error');
					console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
				},
		        //Options to tell JQuery not to process data or worry about content-type
		        cache: false,
		        contentType: false,
		        processData: false
		    });
			return result;
		};

		this.use_direct_download = true;

		this.download_file = function(path) {
			window.location = this.endpoint + 'download.php?path=' + this.get_prefix_path() + path;
		};
	};
})(ocp);