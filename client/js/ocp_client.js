(function(ocp, undefined) {
	ocp.client = {};

	ocp.client.command = function(data, url) {
		if (!url) {
			url = ocp.cfg.server_base_url + '/webocp/server/endpoint/';
		}
		$.ajaxSetup({
			cache: false,
			scriptCharset: "utf-8"
		});

		var result = null;
		console.log(data);
		console.log('url=' + url);
		$.ajax({
			type: "GET",
			url: url,
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
				console.log('ocp.client error');
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

	ocp.client.ls = function(path) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.ls(path);

		var grid_result = ocp.file_manager.build_grid_data_from_ls_enpoint(result, path);

		grid_result.rows = ocp.file_manager.reorder_grid_result(grid_result.rows);
		$("#ocp_fm_grid").ocp_grid('reload', grid_result);
		$('#ocp_fm_breadcrumbs input').val(path);
		return ocp.file_manager.filter_dir(result);
	}

	ocp.client.mkdir = function(path, name) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.mkdir(path, name);
	}

	ocp.client.mv = function(old_path, new_path) {
		ocp.client.command({
			action: 'mv',
			old_path: '/' + ocp.session.user_id + old_path,
			new_path: '/' + ocp.session.user_id + new_path
		});
	}

	ocp.client.rm = function(path) {
		ocp.client.command({
			action: 'rm',
			path: '/' + ocp.session.user_id + path
		});
	}

	ocp.client.upload_dir = function(path, relative_path, form, after_success) {
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
				console.log('ocp.client.ls error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
			},
	        //Options to tell JQuery not to process data or worry about content-type
	        cache: false,
	        contentType: false,
	        processData: false
	    });
		return result;
	}

	ocp.client.upload_file = function(path, file, after_success, on_progress) {
		var formData = new FormData();
		formData.append('input_name', 'file');
		formData.append('path', '/' + ocp.session.user_id + path);
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
				console.log('ocp.client.ls error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
			},
	        //Options to tell JQuery not to process data or worry about content-type
	        cache: false,
	        contentType: false,
	        processData: false
	    });
		return result;
	}

	ocp.client.download_file = function(path) {
		console.log('ocp.client.download_file, path=' + path);
		window.location = ocp.cfg.server_base_url + '/webocp/server/endpoint/download.php?path=' + '/' + ocp.session.user_id + path;
	}
})(ocp);