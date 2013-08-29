(function(ocp, undefined) {
	ocp.utils = {};

	ocp.utils.str2hex = function(str) {
		var hex = "";
		for (var i = 0; i < str.length; i++) {
			var n = str.charCodeAt(i);
			if (n < 16) {
				hex += "0";
			}
			hex += n.toString(16);
			//console.log('n=' + n);
			//console.log('hex_n=' + n.toString(16));
		}
		return hex;
	}
})(ocp);