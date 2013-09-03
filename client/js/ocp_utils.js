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



	ocp.utils.ab2str = function(buf) {
		var a = [ 0x80, 0xe0, 0xf0, 0xf8, 0xfc, 0xfe ];
		var bufView = new Uint8Array(buf);
		var result = '';
		var i = 0;
		while (i < bufView.length) {
			var b1 = bufView[i];
			if (b1 < a[0]) {
				result += String.fromCharCode(b1);
				i++;
				continue;
			}
			for (var j = 1; j < a.length; j++) {
				if (b1 < a[j]) {
					var sa = bufView.subarray(i, i + j + 1);
					var code = ocp.utils.utf8b2unicode(sa);
					result += String.fromCharCode(code);
					i += j + 1;
					break;
				}
			}
		}
		return result;
	}

	ocp.utils.str2ab = function(str) {
		console.log('str2ab');
		var array = [];

		var length = 0;
		for (var i = 0; i < str.length; i++) {
			var code = str.charCodeAt(i);
			var a = ocp.utils.unicode2utf8b(code);
			array.push.apply(array, a); // append a into array
		}
		var buf = new ArrayBuffer(array.length);
		var bufView = new Uint8Array(buf);
		for (var i = 0; i < array.length; i++) {
			bufView[i] = array[i];
		}

		for (var i = 0; i < bufView.length; i++) {
			console.log('buf[' + i + ']=' + bufView[i].toString(16));
		}
		return buf;
	}

	ocp.utils.unicode2utf8b = function(code) {
		var a = [ 1 << 7, 1 << (6+5), 1 << (2*6 + 4), 1 << (3*6 + 3), 1 << (4*6 + 2), 1 << (5*6 + 1) ];
		if (code < a[0]) {
			return [ code ];
		}
		if (code < a[1]) {
			var b1 = (code >>> 6*1) + 0xc0;
			var b2 = (code & 0x3f) + 0x80;
			return [ b1, b2 ];
		}
		if (code < a[2]) {
			var b1 = (code >>> 6*2) + (1 << 7) + (1 << 6) + (1 << 5);
			var mask = ((1 << 6) - 1) << 6;
			var b2 = ((code & mask) >>> 6) + 0x80;
			var b3 = (code & 0x3f) + 0x80;
			return [ b1, b2, b3 ];
		}
	}

	ocp.utils.utf8b2unicode = function(array) {
		if (array.length == 1) {
			return array[0];
		}

		var unicode = 0;
		var j = 0;
		for (var i = array.length - 1; i >= 0; i--) {
			//console.log(array[i].toString(16));
			var code = 0;
			if (i > 0) {
				code = (array[i] & 0x3f) << (6 * j);
			} else {
				var significative_bit = 7 - array.length;
				code = array[0] & ((1 << significative_bit) - 1);
				code = code << (6 * j);
			}
			//console.log('code=' + code.toString(2));
			unicode = unicode + code;
			j++;
		}
		//console.log('unicode=' + unicode.toString(2));
		return unicode;
	}

	ocp.utils.ab2wa = function(ab) {
	    // Shortcut
	    var bufView = new Uint8Array(ab);

	    var words = [];
	    for (var i = 0; i < bufView.length; i++) {
	        words[i >>> 2] |= bufView[i] << (24 - (i % 4) * 8);
	    }

	    return CryptoJS.lib.WordArray.create(bufView, bufView.length);
	}
})(ocp);