function save_as(content, filename) {
	var bb = new BlobBuilder();
	var buffer = hex2ab(content);

	bb.append(buffer);
	console.log(bb);
	var blob = bb.getBlob("example/binary");
	saveAs(blob, filename);
}

function hex2ab(hex) {
    var ab = new ArrayBuffer(hex.length / 2);
    var data = new DataView(ab);
    for (var i = 0; i < ab.byteLength; i++) {
    	var n = parseInt(hex.substr(i*2, 2), 16);
        data.setUint8(i, n);
        console.log(n);
    }
    console.log(ab);
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
	}
	return hex;
}