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
	};

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
	};

	ocp.utils.ab2hex = function(buf) {
		var bufView = new Uint8Array(buf);
		var result = '';
		for (var i = 0; i < bufView.length; i++) {
			result += bufView[i].toString(16);
		}
		return result;
	};

	ocp.utils.hex2ab = function(hex) {
	    var buf = new ArrayBuffer(hex.length / 2);
	    var bufView = new Uint8Array(buf);

	    for (var i = 0; i < hex.length; i += 2) {
	        bufView[i >>> 1] = parseInt(hex.charAt(i) + hex.charAt(i + 1), 16);
	    }

	    return buf;
	};

	ocp.utils.str2ab = function(str) {
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
		return buf;
	};

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
	};

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
	};

	ocp.utils.ab2wa = function(ab) {
	    // Shortcut
	    var bufView = new Uint8Array(ab);

	    var words = [];
	    for (var i = 0; i < bufView.length; i++) {
	        words[i >>> 2] |= bufView[i] << (24 - (i % 4) * 8);
	    }
	    return CryptoJS.lib.WordArray.create(words, bufView.length);
	};

	ocp.utils.wa2ab = function(wa) {
	    // Shortcut
	    var buf = new ArrayBuffer(wa.sigBytes);
		var bufView = new Uint8Array(buf);

	    for (var i = 0; i < wa.sigBytes; i++) {
			bufView[i] = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	    }

	    return buf;
	};

	ocp.utils.hex2wa = function(hexStr) {
	    // Shortcut
	    var hexStrLength = hexStr.length;

	    // Convert
	    var words = [];
	    for (var i = 0; i < hexStrLength; i += 2) {
	        words[i >>> 3] |= parseInt(hexStr.charAt(i) + hexStr.charAt(i + 1), 16) << (24 - (i % 8) * 4);
	    }

	    return CryptoJS.lib.WordArray.create(words, hexStrLength / 2);
	};

	ocp.utils.b642ab = function(b64) {
		var wa = CryptoJS.enc.Base64.parse(b64);
		return ocp.utils.wa2ab(wa);
	};

	ocp.utils.ab2b64 = function(ab) {
		var wa = ocp.utils.ab2wa(ab);
		return CryptoJS.enc.Base64.stringify(wa);
	};

	ocp.utils.curr = function(amount) {
		return amount.toFixed(2);
	};

	var btc_rate = 0;
	var btc_rate_last_call = new Date().getTime();
	ocp.utils.eur2btc = function(amount) {
		var now_t = new Date().getTime();
		if (btc_rate == 0 || now_t - btc_rate_last_call > 3600 * 1000) {
			btc_rate = ocp.filesystem.command({}, ocp.dht.get_endpoint_url(null, 'get_current_btc_rate'));
			btc_rate_last_call = now_t;
		}
		return amount / btc_rate;
	}

	ocp.utils.format_nbr = function(nbr, precision) {
		var pow = Math.pow(10, precision);
		nbr = Math.round(nbr * pow) / pow;
		return nbr.toFixed(precision);
	};

	ocp.utils.format_size = function(bytes, options) {
		options = options || {};
		options.precision = options.precision || 2;
		options.output_format = options.output_format || 'string';
		var units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

	    bytes = Math.max(bytes, 0);
	    var pow = 0;
	    if (bytes > 0) {
	    	pow = Math.floor(Math.log(bytes) / Math.log(1000));
	    }

	    pow = Math.min(pow, units.length - 1);
	    bytes /= Math.pow(1000, pow);
		bytes = Math.round(bytes * Math.pow(10, options.precision)) / Math.pow(10, options.precision);
		if (options.output_format != 'string') {
			return { amount: bytes, unit: units[pow] };
		}
	    return bytes + ' ' + units[pow];
	};

	ocp.utils.getMethods = function(obj) {
		var func = [];
		for (var prop in obj) {
			if (typeof obj[prop] == 'function') {
				func.push(prop);
			}
		}
		return func.sort();
	};

	ocp.utils.toBinString = function(n) {
		var result = '';
		for (var i = 0; i < 32; i++) {
			var x = (n & (1 << i)) >>> i;
			result = x + result;
		}
		return result;
	};

	ocp.utils.format_date = function(timestamp, format) {
		console.log('timestamp=' + timestamp);

		format = format || '%Y-%m-%d %H:%M:%S';
		var date = new Date(timestamp * 1000);

		var month = date.getMonth() + 1;
		if (month < 10) {
			month = '0' + month;
		}
		var day = date.getDate();
		if (day < 10) {
			day = '0' + day;
		}
		var hour = date.getHours();
		if (hour < 10) {
			hour = '0' + hour;
		}
		var minute = date.getMinutes();
		if (minute < 10) {
			minute = '0' + minute;
		}
		var second = date.getSeconds();
		if (second < 10) {
			second = '0' + second;
		}

		var result = format.replace('%Y', date.getFullYear());
		result = result.replace('%m', month);
		result = result.replace('%d', day);
		result = result.replace('%H', hour);
		result = result.replace('%M', minute);
		result = result.replace('%S', second);
		return result;
	};

	ocp.utils.ab_concat = function() {
		var size = 0;
		for (var i = 0; i < arguments.length; i++) {
			console.log(arguments[i]);
			console.log(arguments[i].byteLength);
			size += arguments[i].byteLength;
		}
		var result = new ArrayBuffer(size);
		var dv = new Uint8Array(result);
		var offset = 0;
		for (var i = 0; i < arguments.length; i++) {
			dv.set(new Uint8Array(arguments[i]), offset);
			offset += arguments[i].byteLength;
		}
		return result;
	};
})(ocp);