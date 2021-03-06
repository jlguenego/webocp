﻿function save_as(content, filename) {
	var bb = new BlobBuilder();
	var buffer = hex2ab(content);

	bb.append(buffer);
	var blob = bb.getBlob("example/binary");
	saveAs(blob, filename);
}

function hex2ab(hex) {
    var ab = new ArrayBuffer(hex.length / 2);
    var data = new DataView(ab);
    for (var i = 0; i < ab.byteLength; i++) {
    	var n = parseInt(hex.substr(i*2, 2), 16);
        data.setUint8(i, n);
    }
    return ab;
}

function str2hex(str) {
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

function hex2wa(hexStr) {
    // Shortcut
    var hexStrLength = hexStr.length;

    // Convert
    var words = [];
    for (var i = 0; i < hexStrLength; i += 2) {
        words[i >>> 3] |= parseInt(hexStr.charAt(i) + hexStr.charAt(i + 1), 16) << (24 - (i % 8) * 4);
    }

    return CryptoJS.lib.WordArray.create(words, hexStrLength / 2);
}