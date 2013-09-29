var tree = null;
var grid = null;
var rename_dialog = null;
var remove_dialog = null;

(function(ocp, undefined) {
	ocp.file_manager = {};

	ocp.file_manager.refresh = function() {
		if (tree) {
			tree.ocp_tree('open_item', ocp.file_manager.get_current_path());
		}
	};

	// SELECT ALL
	ocp.file_manager.select_all = function() {
		if (grid) {
			grid.ocp_grid('row_select_all');
		}
	};
	// SELECT ALL END

	// DELETE ALL
	ocp.file_manager.delete = function() {
		try {
			var selected_rows = $('#ocp_fm_grid .ocp_gd_selected');
			if (selected_rows.length == 0) {
				throw new Error('Please select a file/folder.');
			}
			if (selected_rows.length == 1) {
				var rowid = selected_rows.attr('data-rowid');
				var row = grid.ocp_grid('option', 'data')[rowid];
				if (!row) {
					throw new Error('Please select a file/folder.');
				}
				$('#ocp_fm_remove_dialog span').html(row.meta_data.name);
			}
			if (selected_rows.length > 1) {
				$('#ocp_fm_remove_dialog span').html('these ' + selected_rows.length + ' elements');
			}
			remove_dialog.ocp_dialog('open');
		} catch (e) {
			ocp.error_manage(e);
		}
	};
	// DELETE ALL END

	ocp.file_manager.build_grid_data_from_ls_enpoint = function(ls_data, path) {
		var result = {};
		var rows = [];
		for (var i = 0; i < ls_data.length; i++) {
			var row = {};
			row.filename = ls_data[i].label;

			if (ls_data[i].type != 'dir') {
				row.size = ocp.utils.format_size(ls_data[i].size);
			} else {
				row.size = "&nbsp;";
			}

			if (ls_data[i].type != 'dir') {
				row.last_modified = ocp.utils.format_date(ls_data[i].last_modified, '%Y-%m-%d %H:%M');
			} else {
				row.last_modified = "&nbsp;";
			}

			row.meta_data = {
				type: ls_data[i].type,
				mime_type: ls_data[i].mime_type,
				name: ls_data[i].label,
				size: ls_data[i].size
			};
			rows.push(row);
		}
		result.rows = rows;
		result.state = { path: path };
		return result;
	};

	ocp.file_manager.filter_dir = function(array) {
		array = array.slice();
		for (var i = 0; i < array.length; i++) {
			if (array[i].type != 'dir')	{
				array.splice(i, 1);
				i--;
			}
		}
		return array;
	};

	ocp.file_manager.get_tree_source = function() { // Unused
		return tree.widget('options', 'source');
	};

	ocp.file_manager.reorder_grid_result = function reorder_grid_result(array) {
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
	};

	ocp.file_manager.get_current_path = function() {
		if (grid) {
			return grid.ocp_grid('option', 'state').path;
		}
		return null;
	}

	// DRAG AND DROP
	ocp.file_manager.dnd = {};

	ocp.file_manager.dnd.dragover = function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.originalEvent.dataTransfer.dropEffect = 'copy';
	}

	ocp.file_manager.dnd.drop = function(e) {
		e.stopPropagation();
		e.preventDefault();

		var items = e.originalEvent.dataTransfer.items;
		for (var i = 0; i < items.length; i++) {
			var item = items[i].webkitGetAsEntry();
			if (item) {
				ocp.file_manager.dnd.traverse_file_tree(item);
			}
		}
	}

	ocp.file_manager.dnd.traverse_file_tree = function(item, path) {
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
				var current_path = ocp.file_manager.get_current_path();
				ocp.client.upload_file(ocp.normalize_path(current_path + '/' + path), file, function() {
					ocp.file_manager.refresh();
				}, function(e, filename) {
					ocp.file_manager.upload_file_progress(e, ocp.normalize_path(path), filename);
				});
			}, ocp.file_manager.dnd.error);
		} else if (item.isDirectory) {
			var current_path = ocp.file_manager.get_current_path();
			ocp.client.mkdir(ocp.normalize_path(current_path + '/' + path), item.name, ocp.file_manager.refresh);
			// Get folder contents
			var dirReader = item.createReader();
			dirReader.readEntries(function(entries) {
				for (var i = 0; i < entries.length; i++) {
					ocp.file_manager.dnd.traverse_file_tree(entries[i], path + item.name + "/");
				}
			}, ocp.file_manager.dnd.error_from_readentries);
		}
	}

	ocp.file_manager.dnd.error = function(e) {
		console.log('ocp.file_manager.dnd.error');
		console.log(e);
	}

	ocp.file_manager.dnd.error_from_readentries = function(e) {
		console.log('ocp.file_manager.dnd.error_from_readentries');
		console.log(e);
	}
	// DRAG AND DROP END

	// PROGRESS BAR
	ocp.file_manager.upload_file_progress = function(e, path, name) {
		var id = ocp.crypto.hash(ocp.normalize_path(path + '/' + name));
		var total = e.total;
		var loaded = e.loaded;
		var percent = Math.round((loaded * 100) / total);
		var row = $('[data-rowid=' + id + ']');

		var timestamp = ocp_now();

		if (row.length == 0 && loaded < total) {
			var data = {
				"name": name,
				"size": ocp.utils.format_size(total),
				"transfer_type": 'Upload',
				"status": percent + '%',
				"speed": '0 KB/s',
				"elapsed_time": '0 s',
				"remaining_time": 'N/A',
				meta_data: {
					loaded: loaded,
					timestamp: timestamp,
					start_t: timestamp
				}
			};

			$('#ocp_fm_file_transfer').ocp_grid('add_row', data, id);
			row = $('[data-rowid=' + id + ']');
			row.find('.widget_grid_cell[data-colname=file_transfer_status]').ocp_progressbar();
		}
		var prev_loaded = row.attr('data-md-loaded');
		var prev_timestamp = row.attr('data-md-timestamp');
		var speed = (loaded - prev_loaded) / (timestamp - prev_timestamp);
		var start_t = row.attr('data-md-start_t');
		var elapsed_t = ((timestamp - start_t) / 1000).toFixed(0);
		var remaining_t = (((total - loaded) / speed) / 1000).toFixed(0);

		row.attr('data-md-loaded', loaded);
		row.attr('data-md-timestamp', timestamp);
		row.find('.widget_grid_cell[data-colname=file_transfer_elapsed_time]').html(elapsed_t + ' s');
		row.find('.widget_grid_cell[data-colname=file_transfer_remaining_time]').html(remaining_t + ' s');
		row.find('.widget_grid_cell[data-colname=file_transfer_speed]').html(ocp.utils.format_size(speed * 1000, 1) + '/s');
		row.find('.widget_grid_cell[data-colname=file_transfer_status]').ocp_progressbar('set_progress', percent);

		if (loaded >= total) {
			row.remove();
		}
	}


	ocp.file_manager.onprogress = function(e, args) {
		var id = ocp.crypto.hash(ocp.normalize_path(args.path + '/' + args.name));
		var total = e.total;
		var loaded = e.loaded;
		var percent = Math.round((loaded * 100) / total);
		var row = $('[data-rowid=' + id + ']');

		var timestamp = ocp_now();

		if (row.length == 0 && loaded < total) {
			var data = {
				"name": args.name,
				"size": ocp.utils.format_size(args.size),
				"transfer_type": args.transfer_type,
				"status": percent + '%',
				"speed": '0 KB/s',
				"elapsed_time": '0 s',
				"remaining_time": 'N/A',
				meta_data: {
					loaded: loaded,
					timestamp: timestamp,
					start_t: timestamp
				}
			};

			$('#ocp_fm_file_transfer').ocp_grid('add_row', data, id);
			row = $('[data-rowid=' + id + ']');
			row.find('.widget_grid_cell[data-colname=file_transfer_status]').ocp_progressbar();
		}
		var prev_loaded = row.attr('data-md-loaded');
		var prev_timestamp = row.attr('data-md-timestamp');
		var speed = (loaded - prev_loaded) / (timestamp - prev_timestamp);
		var start_t = row.attr('data-md-start_t');
		var elapsed_t = ((timestamp - start_t) / 1000).toFixed(0);
		var remaining_t = (((total - loaded) / speed) / 1000).toFixed(0);

		row.attr('data-md-loaded', loaded);
		row.attr('data-md-timestamp', timestamp);
		row.find('.widget_grid_cell[data-colname=file_transfer_elapsed_time]').html(elapsed_t + ' s');
		row.find('.widget_grid_cell[data-colname=file_transfer_remaining_time]').html(remaining_t + ' s');
		row.find('.widget_grid_cell[data-colname=file_transfer_speed]').html(ocp.utils.format_size(speed * 1000, 1) + '/s');
		row.find('.widget_grid_cell[data-colname=file_transfer_status]').ocp_progressbar('set_progress', percent);

		if (loaded >= total) {
			row.remove();
		}
	}
	// PROGRESS BAR END

	// RENAME
	ocp.file_manager.rename = function() {
		try {
			var selected_rows = $('#ocp_fm_grid .ocp_gd_selected');
			if (selected_rows.length != 1) {
				throw new Error('Please select only one file/folder.');
			}

			var rowid = $('#ocp_fm_grid .ocp_gd_selected').attr('data-rowid');
			var row = grid.ocp_grid('option', 'data')[rowid];

			$('#ocp_fm_rename_dialog #ocp_fm_new_name').val(row.meta_data.name);
			$('#ocp_fm_rename_dialog #ocp_fm_new_name').select();
			rename_dialog.ocp_dialog('open');
		} catch(e) {
			ocp.error_manage(e);
		}
	}
	// RENAME END

})(ocp);

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
	tree = $('#ocp_fm_tree').ocp_tree({
		source: src,
		ls: ocp.client.ls,
		open_item_error: function(path) {
			$('#ocp_misc_error_dialog').find('span').html('Cannot go to directory ' + path);
			$('#ocp_fm_breadcrumbs input').val(path);
			$('#ocp_misc_error_dialog').ocp_dialog('open');
		}
	});

	$('#ocp_fm_breadcrumbs').ocp_text_value();

	// Put a grid on right pane
	grid = $("#ocp_fm_grid").ocp_grid({
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
			var path = ocp.file_manager.get_current_path();
			var name = row.attr('data-md-name');
			var type = row.attr('data-md-type');
			var size = row.attr('data-md-size');


			if (type == 'dir') {
				tree.ocp_tree('open_item', ocp.normalize_path(path + '/' + name));
			} else {
				ocp.client.download_file(
					ocp.normalize_path(path + '/' + name),
					undefined,
					function (e) {
						var args = {
							name: name,
							path: path,
							size: size
						};
						ocp.file_manager.onprogress(e, args);
					},
					function(error_msg) {
						ocp.error_manage(new Error(error_msg));
					}
				);
			}
		}
	});

	$("#ocp_fm_file_transfer").ocp_grid({
		id: 'file_transfer',
		column: {
			name: {
				label: 'Name',
				width: 500
			},
			size: {
				label: 'Size',
				width: 70
			},
			transfer_type: {
				label: 'Transfer type',
				width: 120
			},
			status: {
				label: 'Status',
				width: 250
			},
			speed: {
				label: 'Speed',
				width: 80
			},
			elapsed_time: {
				label: 'Elapsed time',
				width: 90
			},
			remaining_time: {
				label: 'Remaining time',
				width: 90
			}
		},
		data: []
	});

	// Sync path
	$('#ocp_fm_breadcrumbs input').keypress(function(e) {
	    if(e.which == 13) {
	        var path = ocp.normalize_path($(this).val());
	        tree.ocp_tree('open_item', path);
	    }
	});

	$('#ocp_fm_parent').click(function() {
		var path = grid.ocp_grid('option', 'state').path;
		path = ocp.dirname(path);
		tree.ocp_tree('open_item', path);
	});

	// CREATE NEW FOLDER
	var new_folder_dialog = $('#ocp_fm_new_folder_dialog').ocp_dialog({
		buttons: {
			Create: function() {
				ocp.ui.cursor_wait_start();
				var path = grid.ocp_grid('option', 'state').path;
				var folder_name = $('#ocp_fm_new_folder_dialog #ocp_fm_new_folder_name').val();
				ocp.client.mkdir(path, folder_name, function() {
					ocp.ui.cursor_wait_end();
					tree.ocp_tree('open_item', path);
					new_folder_dialog.ocp_dialog('close');
				}, function() {
					ocp.ui.cursor_wait_end();
					new_folder_dialog.ocp_dialog('close');
				});
			},
			Cancel: function() {
				ocp.ui.cursor_wait_end();
				new_folder_dialog.ocp_dialog('close');
			}
		}
	});

	$('#ocp_fm_mkdir').click(function(e) {
		e.preventDefault();
		new_folder_dialog.ocp_dialog('open');
	});
	// CREATE NEW FOLDER END

	// RENAME
	rename_dialog = $('#ocp_fm_rename_dialog').ocp_dialog({
		buttons: {
			Rename: function() {
				var rowid = $('#ocp_fm_grid .ocp_gd_selected').attr('data-rowid');
				var row = grid.ocp_grid('option', 'data')[rowid];
				var meta_data = row.meta_data;

				var path = grid.ocp_grid('option', 'state').path;

				var old_name = meta_data.name;
				var new_name = $('#ocp_fm_rename_dialog #ocp_fm_new_name').val();

				try {
					ocp.client.mv(ocp.normalize_path(path + '/' + old_name), ocp.normalize_path(path + '/' + new_name));
				} catch (e) {
					ocp.error_manage(e);
					$('#ocp_fm_rename_dialog #ocp_fm_new_name').select();
					return;
				}

				tree.ocp_tree('open_item', path);

				rename_dialog.ocp_dialog('close');
			},
			Cancel: function() {
				rename_dialog.ocp_dialog('close');
			}
		}
	});

	$('#ocp_fm_rename').click(function(evt) {
		evt.preventDefault();
		ocp.file_manager.rename();
	});
	// RENAME END

	// REMOVE
	remove_dialog = $('#ocp_fm_remove_dialog').ocp_dialog({
		buttons: {
			'Delete permanantly': function() {
				ocp.ui.cursor_wait_start();
				var selected_rows = $('#ocp_fm_grid .ocp_gd_selected');
				var counter = 0;
				var total = selected_rows.length;
				function finalize() {
					counter++;
					ocp.file_manager.refresh();
					if (counter == total) {
						ocp.ui.cursor_wait_end();
						remove_dialog.ocp_dialog('close');
					}
				}
				selected_rows.each(function() {
					try {
						var name = $(this).attr('data-md-name');
						var path = ocp.file_manager.get_current_path();
						var p = ocp.normalize_path(path + '/' + name);
						console.log('rm ' + p);

						ocp.client.rm(p, finalize, finalize);
					} catch (e) {
						ocp.error_manage(e);
					}
				});
			},
			Cancel: function() {
				remove_dialog.ocp_dialog('close');
			}
		}
	});

	$('#ocp_fm_remove').click(function(evt) {
		evt.preventDefault();
		ocp.file_manager.delete();
	});
	// REMOVE END

	//DRAG AND DROP FILES
	$('#ocp_fm_grid').bind('dragover', ocp.file_manager.dnd.dragover);

	$('#ocp_fm_grid').bind('drop', ocp.file_manager.dnd.drop);
	//DRAG AND DROP FILES END

	// UPLOAD FILE
	$('#ocp_fm_file_button').click(function() {
		$('#ocp_fm_file').trigger('click', true);
	});

	$('#ocp_fm_file').change(function() {
		var path = grid.ocp_grid('option', 'state').path;
		var form = $('#ocp_fm_file_form')[0];

		var files = $('#ocp_fm_file').get(0).files;
		try {
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				ocp.client.upload_file(ocp.normalize_path(path), file, function() {
					tree.ocp_tree('open_item', path);
				}, function(e, filename) {
					ocp.file_manager.upload_file_progress(e, ocp.normalize_path(path), filename);
				});
			}
		} catch (e) {
			ocp.error_manage(e);
		} finally {
			$('#ocp_fm_file').val('');
			dir_list_a = [];
		}
	});
	// UPLOAD FILE END

	// UPLOAD FOLDER
	$('#ocp_fm_dir_button').click(function() {
		if (!window.webkitURL) {
			ocp.info('This action is only available on <a href="http://en.wikipedia.org/wiki/List_of_web_browsers#WebKit-based" target="_blank">Webkit browsers</a>. (Chrome, Safari, ...)');
			return;
		}
		$('#ocp_fm_dir').trigger('click');
	});

	$('#ocp_fm_dir').change(function() {
		var path = grid.ocp_grid('option', 'state').path;
		var form = $('#ocp_fm_dir_form')[0];

		var files = $('#ocp_fm_dir').get(0).files;

		try {
			ocp.client.upload_dir(ocp.normalize_path(path), files, function() {
				tree.ocp_tree('open_item', path);
			}, function(e, filename) {
				ocp.file_manager.upload_file_progress(e, ocp.normalize_path(path), filename);
			});
		} catch (e) {
			ocp.error_manage(e);
		} finally {
			$('#ocp_fm_dir').val('');
		}
	});
	// UPLOAD DIR END

	if (ocp.cfg.server_base_url && ocp.session && ocp.session.user_id) {
		tree.ocp_tree('open_item', '/');
	}

	$(window).keydown(function(e) {
		console.log(e);
		if ($(e.target).is('input') || ocp_dialog_is_open()) {
			console.log('Do nothing');
			return;
		}
		switch(e.which) {
			case 113: // F2
				console.log('F2');
				ocp.file_manager.rename();
				break;
			case 65: // A
				if (e.ctrlKey) {
					e.preventDefault();
					e.stopPropagation();
					ocp.file_manager.select_all();
				}
				break;
			case 46: // Del
				console.log('Del');
				ocp.file_manager.delete();
				break;
			default:
		}
	});
});