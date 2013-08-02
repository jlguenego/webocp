function ocp_build_grid_data_from_ls_enpoint(ls_data, path) {
	var result = {};
	var rows = [];
	for (var i = 0; i < ls_data.length; i++) {
		var row = {};
		row.filename = ls_data[i].label;
		row.size = 'N/A';
		row.last_modified = 'N/A';

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
			alert('Cannot go to directory ' + path);
			$('#ocp_fm_breadcrumbs input').val(path).select();
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
			console.log('our row_dblclick');
			var row = $(e.currentTarget);
			var rowid = row.attr('data-rowid');
			var meta_data = $("#ocp_fm_grid").ocp_grid('option', 'data')[rowid].meta_data;

			if (meta_data.type == 'dir') {
				var path = $("#ocp_fm_grid").ocp_grid('option', 'state').path;
				if (!path.endsWith('/')) {
					path += '/';
				}
				var name = meta_data.name;
				$('#ocp_fm_tree').ocp_tree('open_item', path + name);
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
	        console.log('path=' + path);
	        $('#ocp_fm_tree').ocp_tree('open_item', path);
	    }
	});

	$('#ocp_fm_parent').click(function() {
		var path = $("#ocp_fm_grid").ocp_grid('option', 'state').path;
		console.log('path=' + path);
		path = dirname(path);
		console.log('path=' + path);
		$('#ocp_fm_tree').ocp_tree('open_item', path);
	});

	$('#ocp_fm_tree').ocp_tree('open_item', '/');

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
				var path_tmp = path;
				if (path_tmp = '/') {
					path_tmp = '';
				}

				var old_name = meta_data.name;
				var new_name = $('#ocp_fm_rename_dialog #ocp_fm_new_name').val();

				if (!ajax_mv(path_tmp + '/' + old_name, path_tmp + '/' + new_name)) {
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
			alert('Please select a file.');
			return;
		}
		$('#ocp_fm_rename_dialog #ocp_fm_new_name').val(row.meta_data.name);
		$('#ocp_fm_rename_dialog #ocp_fm_new_name').select();
		rename_dialog.ocp_dialog('open');
	});
	// RENAME END
});