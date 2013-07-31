function ocp_build_grid_data_from_ls_enpoint(ls_data) {
	var result = [];
	for (var i = 0; i < ls_data.length; i++) {
		var row = {};
		row.filename = ls_data[i].label;
		row.size = 'N/A';
		row.last_modified = 'N/A';

		row.meta_data = {
			type: ls_data[i].type,
			mime_type: ls_data[i].mime_type
		};
		result.push(row);
	}
	return result;
}