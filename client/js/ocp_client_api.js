function ajax_command(data) {
	$.ajaxSetup({
		cache: false,
		scriptCharset: "utf-8"
	});

	var result = null;
	$.ajax({
		type: "GET",
		url: g_ocp_client.server_base_url + '/webocp/server/endpoint/',
		async: false,
		data: data,
		success: function(data) {
			console.log(data);
			var output = $.parseJSON(data);
			if (output.error) {
				throw new OCPException(output.error);
			}
			if (output.result) {
				result = output.result;
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('ajax_ls error');
			console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
		},
		statusCode: {
			404: function() {
				console.log("page not found");
			}
		}
	});

	return result;
}

function ajax_ls(path) {
	var result = ajax_command({
		action: 'ls',
		path: '/' + g_session.public_address + path
	});

	var grid_result = ocp_build_grid_data_from_ls_enpoint(result, path);

	grid_result.rows = reorder_grid_result(grid_result.rows);
	$("#ocp_fm_grid").ocp_grid('reload', grid_result);
	$('#ocp_fm_breadcrumbs input').val(path);
	return filter_dir(result);
}

function ajax_mkdir(path, name) {
	ajax_command({
		action: 'mkdir',
		path: '/' + g_session.public_address + path,
		name: name
	});
}

function ajax_mv(old_path, new_path) {
	ajax_command({
		action: 'mv',
		old_path: '/' + g_session.public_address + old_path,
		new_path: '/' + g_session.public_address + new_path
	});
}

function ajax_rm(path) {
	ajax_command({
		action: 'rm',
		path: '/' + g_session.public_address + path
	});
}

function ajax_upload_file(path, form, after_success) {
	console.log('path=' + path);
	console.log(form);

	var formData = new FormData(form);
	formData.append('action', 'upload_file');

	var fieldname = $(form).find('input').attr('name');
	fieldname = fieldname.substr(0, fieldname.length - 2);
	formData.append('input_name', fieldname);
	formData.append('path', '/' + g_session.public_address + path);
	var result = null;
    $.ajax({
        url: g_ocp_client.server_base_url + '/webocp/server/endpoint/',  //server script to process data
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
				var output = $.parseJSON(data);
				if (output.error) {
					throw new OCPException(output.error);
				}
				if (output.result) {
					result = output.result;
				}
			} catch (e) {
				ocp_error_manage(e);
				return;
			}
			if (after_success) {
				after_success();
			}
		},
        error: function(jqXHR, textStatus, errorThrown) {
			console.log('ajax_ls error');
			console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
		},
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
    });
	return result;
}

function ajax_download_file(path) {
	console.log('ajax_download_file, path=' + path);
	window.location = g_ocp_client.server_base_url + '/webocp/server/endpoint/download.php?path=' + '/' + g_session.public_address + path;
}

function ajax_register(account) {
	ajax_command({
		action: 'register',
		account: account
	});
}

function ajax_login(account) {
	ajax_command({
		action: 'login',
		account: account
	});
}