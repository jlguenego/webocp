(function(ocp, undefined) {
	ocp.math = {};

	ocp.math.mean = function(array, data, weight) {
		data = data || function(d) { return d; };
		weight = weight || function() { return 1; };

		if (typeof data === 'string') {
			var my_data = data;
			data = function(d) { return d[my_data]; };
		}
		if (typeof weight === 'string') {
			var my_weight = weight;
			weight = function(d) { return d[my_weight]; };
		}

		var result = 0;
		var weight_sum = 0;
		for (var i = 0; i < array.length; i++) {
			var d = array[i];
			result += data(d) * weight(d);
			weight_sum += weight(d);
		}
		if (!weight_sum) {
			throw new Error('weight_sum should not be 0');
		}
		result /= weight_sum;
		return result;
	}
})(ocp);