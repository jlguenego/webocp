(function(ocp, undefined) {
	ocp.ajax = {};

	ocp.ajax.command = function(data) {
		$.ajaxSetup({
			cache: false,
			scriptCharset: "utf-8"
		});

		var result = null;
		console.log(data);
		$.ajax({
			type: "GET",
			url: ocp.cfg.server_base_url + '/webocp/server/endpoint/',
			async: false,
			data: data,
			success: function(data) {
				console.log(data);
				var output = $.parseJSON(data);
				if (output.error) {
					throw new OCPException('Server answered: ' + output.error);
				}
				if (output.result) {
					result = output.result;
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('ocp.ajax error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
			},
			statusCode: {
				404: function() {
					console.log("page not found");
				}
			}
		});

		return result;
	};

	ocp.ajax.ls = function(path) {
		var result = ocp.ajax.command({
			action: 'ls',
			path: '/' + g_session.public_address + path
		});

		var grid_result = ocp.file_manager.build_grid_data_from_ls_enpoint(result, path);

		grid_result.rows = ocp.file_manager.reorder_grid_result(grid_result.rows);
		$("#ocp_fm_grid").ocp_grid('reload', grid_result);
		$('#ocp_fm_breadcrumbs input').val(path);
		return ocp.file_manager.filter_dir(result);
	}

	ocp.ajax.mkdir = function(path, name) {
		ocp.ajax.command({
			action: 'mkdir',
			path: '/' + g_session.public_address + path,
			name: name
		});
	}

	ocp.ajax.mv = function(old_path, new_path) {
		ocp.ajax.command({
			action: 'mv',
			old_path: '/' + g_session.public_address + old_path,
			new_path: '/' + g_session.public_address + new_path
		});
	}

	ocp.ajax.rm = function(path) {
		ocp.ajax.command({
			action: 'rm',
			path: '/' + g_session.public_address + path
		});
	}

	ocp.ajax.upload_dir = function(path, relative_path, form, after_success) {
		var formData = new FormData(form);
		formData.append('action', 'upload_dir');
		formData.append('relative_path', relative_path);

		var fieldname = $(form).find('input').attr('name');
		// Remove the ending []
		fieldname = fieldname.substr(0, fieldname.length - 2);
		formData.append('input_name', fieldname);
		formData.append('path', '/' + g_session.public_address + path);
		var result = null;
	    $.ajax({
	        url: ocp.cfg.server_base_url + '/webocp/server/endpoint/',  //server script to process data
	        type: 'POST',
	        data: formData,
	        xhr: function() {  // custom xhr
	            var myXhr = $.ajaxSettings.xhr();
	            if(myXhr.upload){ // check if upload property exists
	                //myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // for handling the progress of the upload
	            }
	            return myXhr;
	        },
	        beforeSend: function() {},
	        success: function(data) {
				try {
					console.log(data);
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
				if (after_success) {
					after_success();
				}
			},
	        error: function(jqXHR, textStatus, errorThrown) {
				console.log('ocp.ajax.ls error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
			},
	        //Options to tell JQuery not to process data or worry about content-type
	        cache: false,
	        contentType: false,
	        processData: false
	    });
		return result;
	}

	ocp.ajax.upload_file = function(path, file, after_success, on_progress) {
		var formData = new FormData();
		formData.append('input_name', 'file');
		formData.append('path', '/' + g_session.public_address + path);
		formData.append('file[]', file);
		var result = null;
	    $.ajax({
	        url: ocp.cfg.server_base_url + '/webocp/server/endpoint/?action=upload_file&file_size=' + file.size,  //server script to process data
	        type: 'POST',
	        data: formData,
	        async: true,
	        xhr: function() {  // custom xhr
	            var myXhr = $.ajaxSettings.xhr();
	            if(myXhr.upload){ // check if upload property exists
	                myXhr.upload.addEventListener('progress', function(e) {
	                	on_progress(e, file.name);
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
					on_progress(e, file.name);
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
				if (after_success) {
					after_success();
				}
			},
	        error: function(jqXHR, textStatus, errorThrown) {
				console.log('ocp.ajax.ls error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
			},
	        //Options to tell JQuery not to process data or worry about content-type
	        cache: false,
	        contentType: false,
	        processData: false
	    });
		return result;
	}

	ocp.ajax.download_file = function(path) {
		console.log('ocp.ajax.download_file, path=' + path);
		window.location = ocp.cfg.server_base_url + '/webocp/server/endpoint/download.php?path=' + '/' + g_session.public_address + path;
	}

	ocp.ajax.register = function(account) {
		ocp.ajax.command({
			action: 'register',
			account: account
		});
	}

	ocp.ajax.login = function(account) {
		ocp.ajax.command({
			action: 'login',
			account: account
		});
	}
})(ocp);