function ocp_build_grid_data_from_ls_enpoint(ls_data, path) {
	var result = {};
	var rows = [];
	for (var i = 0; i < ls_data.length; i++) {
		var row = {};
		row.filename = ls_data[i].label;
		row.last_modified = 'N/A';

		if (ls_data[i].type != 'dir') {
			row.size = ls_data[i].size;
		} else {
			row.size = "&nbsp;";
		}

		row.meta_data = {
			type: ls_data[i].type,
			mime_type: ls_data[i].mime_type,
			name: ls_data[i].label
		};
		rows.push(row);
	}
	result.rows = rows;
	result.state = { path: path };
	return result;
}

function filter_dir(array) {
	array = array.slice();
	for (var i = 0; i < array.length; i++) {
		if (array[i].type != 'dir')	{
			array.splice(i, 1);
			i--;
		}
	}
	return array;
}

function get_tree_source() {
	return tree.widget('options', 'source');
}

function reorder_grid_result(array) {
	var result = [];

	for (var i = 0; i < array.length; i++) {
		if (array[i].meta_data.type == 'dir') {
			result.push(array[i]);
		}
	}
	for (var i = 0; i < array.length; i++) {
		if (array[i].meta_data.type != 'dir') {
			result.push(array[i]);
		}
	}
	return result;
}

function ocp_fm_get_current_path() {
	return $("#ocp_fm_grid").ocp_grid('option', 'state').path;
}

// DRAG AND DROP
function ocp_fm_dnd_dragover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.originalEvent.dataTransfer.dropEffect = 'copy';
}

function ocp_fm_dnd_drop(e) {
	e.stopPropagation();
	e.preventDefault();

	var items = e.originalEvent.dataTransfer.items;
	for (var i = 0; i < items.length; i++) {
		var item = items[i].webkitGetAsEntry();
		if (item) {
			ocp_dnd_traverse_file_tree(item);
		}
	}
}

function ocp_dnd_traverse_file_tree(item, path) {
	path = path || "";
	console.log("item.name=" + item.name);

	if (is_file_protocol()) {
		console.log('file protocol: dnd disabled');
		return;
	}

	if (item.isFile) {
		// Get file
		item.file(function(file) {
			console.log("File: " + path + file.name);
			var current_path = ocp_fm_get_current_path();
			ajax_upload_file(normalize_path(current_path + '/' + path), file, function() {
				$('#ocp_fm_tree').ocp_tree('open_item', current_path);
			});
		}, error);
	} else if (item.isDirectory) {
		var current_path = ocp_fm_get_current_path();
		ajax_mkdir(normalize_path(current_path + '/' + path), item.name);
		// Get folder contents
		var dirReader = item.createReader();
		dirReader.readEntries(function(entries) {
			for (var i = 0; i < entries.length; i++) {
				ocp_dnd_traverse_file_tree(entries[i], path + item.name + "/");
			}
		}, error_from_readentries);
	}
}

function error(e) {
	console.log('error');
	console.log(e);
}

function error_from_readentries(e) {
	console.log('error_from_readentries');
	console.log(e);
}
// DRAG AND DROP END

$(document).ready(function() {
	$('#file_manager').ocp_splitpane_v({
		overflow: 'hidden',
		size: { top: null, bottom: 150 },
		fixed: 'bottom'
	});

	var footer_restore_height = 150;
	$('#ocp_fm_toggle_footer').click(function() {
		var new_height = 0;
		if ($(this).hasClass('ocp_fm_footer_maximize')) { //Maximize
			new_height = footer_restore_height;
			$(this).removeClass('ocp_fm_footer_maximize');
		} else { // Minimize
			footer_restore_height = $('#ocp_fm_footer').outerHeight()
			new_height = $('#ocp_fm_footer_header').outerHeight();
			$(this).addClass('ocp_fm_footer_maximize');
		}
		var size = { bottom: new_height };
		$('#file_manager').ocp_splitpane_v('resize', size);
	});

	// Set splitpane to the middle row
	$("#ocp_fm_main").ocp_splitpane_h({
		source: [
			{ width: 400, }
		],
		overflow: 'hidden'
	});


	$('#ocp_fm_sidebar').ocp_header_content();
	$('#ocp_fm_content').ocp_header_content();
	$('#ocp_fm_footer').ocp_header_content();

	// Put a tree on the left pane
	var src = [
		{
			name: '',
			label: 'Root',
			image: 'image/clouddrive.png',
			type: 'dir',
			expanded: true,
			children: []
		}
	];
	var tree = $('#ocp_fm_tree').ocp_tree({
		source: src,
		ls: ajax_ls,
		open_item_error: function(path) {
			$('#ocp_misc_error_dialog').find('span').html('Cannot go to directory ' + path);
			$('#ocp_fm_breadcrumbs input').val(path);
			$('#ocp_misc_error_dialog').ocp_dialog('open');
		}
	});

	$('#ocp_fm_breadcrumbs').ocp_text_value();

	// Put a grid on right pane
	$("#ocp_fm_grid").ocp_grid({
		column: {
			filename: {
				label: 'File name',
				width: 200,
				use_thumbnail: true
			},
			size: {
				label: 'Size',
				width: 70
			},
			last_modified: {
				label: 'Last modified',
				width: 100
			}
		},
		data: [],
		prevent_dblclick: true,

		row_dblclick: function(e) {
			var row = $(e.currentTarget);
			var rowid = row.attr('data-rowid');
			var meta_data = $("#ocp_fm_grid").ocp_grid('option', 'data')[rowid].meta_data;
			var path = $("#ocp_fm_grid").ocp_grid('option', 'state').path;
			var name = meta_data.name;

			if (meta_data.type == 'dir') {
				$('#ocp_fm_tree').ocp_tree('open_item', normalize_path(path + '/' + name));
			} else {
				ajax_download_file(normalize_path(path + '/' + name));
			}
		}
	});

	$("#ocp_fm_file_transfer").ocp_grid({
		column: {
			filename: {
				label: 'File name',
				width: 200
			},
			size: {
				label: 'Size',
				width: 70
			},
			last_modified: {
				label: 'Last modified',
				width: 100
			}
		},
		data: []
	});

	// Sync path
	$('#ocp_fm_breadcrumbs input').keypress(function(e) {
	    if(e.which == 13) {
	        var path = normalize_path($(this).val());
	        $('#ocp_fm_tree').ocp_tree('open_item', path);
	    }
	});

	$('#ocp_fm_parent').click(function() {
		var path = $("#ocp_fm_grid").ocp_grid('option', 'state').path;
		path = dirname(path);
		$('#ocp_fm_tree').ocp_tree('open_item', path);
	});

	// CREATE NEW FOLDER
	var new_folder_dialog = $('#ocp_fm_new_folder_dialog').ocp_dialog({
		buttons: {
			Create: function() {
				var path = $("#ocp_fm_grid").ocp_grid('option', 'state').path;
				var folder_name = $('#ocp_fm_new_folder_dialog #ocp_fm_new_folder_name').val();
				ajax_mkdir(path, folder_name);
				tree.ocp_tree('open_item', path);

				new_folder_dialog.ocp_dialog('close');
				$('#ocp_fm_new_folder_dialog #ocp_fm_new_folder_name').val('');
			},
			Cancel: function() {
				new_folder_dialog.ocp_dialog('close');
				$('#ocp_fm_new_folder_dialog #ocp_fm_new_folder_name').val('');
			}
		}
	});

	$('#ocp_fm_mkdir').click(function(e) {
		e.preventDefault();
		new_folder_dialog.ocp_dialog('open');
	});
	// CREATE NEW FOLDER END

	// RENAME
	var rename_dialog = $('#ocp_fm_rename_dialog').ocp_dialog({
		buttons: {
			Rename: function() {
				var rowid = $('#ocp_fm_grid .ocp_gd_selected').attr('data-rowid');
				var row = $("#ocp_fm_grid").ocp_grid('option', 'data')[rowid];
				var meta_data = row.meta_data;

				var path = $("#ocp_fm_grid").ocp_grid('option', 'state').path;

				var old_name = meta_data.name;
				var new_name = $('#ocp_fm_rename_dialog #ocp_fm_new_name').val();

				try {
					ajax_mv(normalize_path(path + '/' + old_name), normalize_path(path + '/' + new_name));
				} catch (e) {
					ocp_error_manage(e);
					$('#ocp_fm_rename_dialog #ocp_fm_new_name').select();
					return;
				}

				tree.ocp_tree('open_item', path);

				rename_dialog.ocp_dialog('close');
				$('#ocp_fm_rename_dialog #ocp_fm_new_name').val('');
			},
			Cancel: function() {
				rename_dialog.ocp_dialog('close');
				$('#ocp_fm_new_folder_dialog #ocp_fm_new_folder_name').val('');
			}
		}
	});

	$('#ocp_fm_rename').click(function(e) {
		e.preventDefault();
		var rowid = $('#ocp_fm_grid .ocp_gd_selected').attr('data-rowid');
		var row = $("#ocp_fm_grid").ocp_grid('option', 'data')[rowid];
		if (!row) {
			ocp_error_manage('Please select a file/folder.');
			return;
		}
		$('#ocp_fm_rename_dialog #ocp_fm_new_name').val(row.meta_data.name);
		$('#ocp_fm_rename_dialog #ocp_fm_new_name').select();
		rename_dialog.ocp_dialog('open');
	});
	// RENAME END

	// REMOVE
	var remove_dialog = $('#ocp_fm_remove_dialog').ocp_dialog({
		buttons: {
			'Delete permanantly': function() {
				var rowid = $('#ocp_fm_grid .ocp_gd_selected').attr('data-rowid');
				var row = $("#ocp_fm_grid").ocp_grid('option', 'data')[rowid];
				var meta_data = row.meta_data;

				var path = $("#ocp_fm_grid").ocp_grid('option', 'state').path;
				var p = normalize_path(path + '/' + meta_data.name);
				console.log('rm ' + p);

				try {
					ajax_rm(p);
				} catch (e) {
					ocp_error_manage(e);
					return;
				}

				tree.ocp_tree('open_item', path);

				remove_dialog.ocp_dialog('close');
			},
			Cancel: function() {
				remove_dialog.ocp_dialog('close');
			}
		}
	});

	$('#ocp_fm_remove').click(function(e) {
		e.preventDefault();
		var rowid = $('#ocp_fm_grid .ocp_gd_selected').attr('data-rowid');
		var row = $("#ocp_fm_grid").ocp_grid('option', 'data')[rowid];
		if (!row) {
			ocp_error_manage('Please select a file/folder.');
			return;
		}
		$('#ocp_fm_remove_dialog span').html(row.meta_data.name);
		remove_dialog.ocp_dialog('open');
	});
	// REMOVE END

	//DRAG AND DROP FILES
	$('#ocp_fm_grid').bind('dragover', ocp_fm_dnd_dragover);

	$('#ocp_fm_grid').bind('drop', ocp_fm_dnd_drop);
	//DRAG AND DROP FILES END

	// UPLOAD FILE
	$('#ocp_fm_file_button').click(function() {
		$('#ocp_fm_file').trigger('click', true);
	});

	$('#ocp_fm_file').change(function() {
		var path = $("#ocp_fm_grid").ocp_grid('option', 'state').path;
		var form = $('#ocp_fm_file_form')[0];

		var files = $('#ocp_fm_file').get(0).files;
		try {
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				console.log(file);
				ajax_upload_file(normalize_path(path), file, function() {
					tree.ocp_tree('open_item', path);
				});
			}
		} catch (e) {
			ocp_error_manage(e);
		} finally {
			$('#ocp_fm_file').val('');
			dir_list_a = [];
		}
	});
	// UPLOAD FILE END

	// UPLOAD FOLDER
	$('#ocp_fm_dir_button').click(function() {
		if (!window.webkitURL) {
			ocp_info('This action is only available on <a href="http://en.wikipedia.org/wiki/List_of_web_browsers#WebKit-based" target="_blank">Webkit browsers</a>. (Chrome, Safari, ...)');
			return;
		}
		$('#ocp_fm_dir').trigger('click');
	});

	$('#ocp_fm_dir').change(function() {
		var path = $("#ocp_fm_grid").ocp_grid('option', 'state').path;
		var form = $('#ocp_fm_dir_form')[0];

		var files = $('#ocp_fm_dir').get(0).files;

		var relative_path_a = [];
		var i = 0
		while (files[i]) {
			relative_path_a.push(files[i].webkitRelativePath);
			i++;
		}

		try {
			ajax_upload_dir(normalize_path(path), relative_path_a, form, function() {
				tree.ocp_tree('open_item', path);
			});
		} catch (e) {
			ocp_error_manage(e);
		} finally {
			$('#ocp_fm_dir').val('');
		}
	});
	// UPLOAD DIR END


});