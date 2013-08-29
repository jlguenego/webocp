(function(ocp, undefined) {
	ocp.crypto.hash = function(content) {
	    var result = CryptoJS.SHA1(content);
	    return result.toString();
	};

	ocp.crypto.pcrypt = function(password, clear_msg) {
		var cipher = CryptoJS.AES.encrypt(clear_msg, password);
		var b64 = cipher.toString();
		var words = CryptoJS.enc.Base64.parse(b64);
		var latin1 = CryptoJS.enc.Latin1.stringify(words);
	    return latin1;
	};

	ocp.crypto.pdecrypt = function(password, crypted_msg) {
		var words = CryptoJS.enc.Latin1.parse(crypted_msg);
		var b64 = CryptoJS.enc.Base64.stringify(words);
		var d_words = CryptoJS.AES.decrypt(b64, password);
	    return d_words.toString();
	};

	ocp.crypto.crypt = function(secret_key, clear_msg) {
	    return clear_msg;
	};

	ocp.crypto.decrypt = function(secret_key, crypted_msg) {
	    return crypted_msg;
	};

	ocp.crypto.rsacrypt = function(key, clear_msg) {
	    return clear_msg;
	};

	ocp.crypto.rsadecrypt = function(key, crypted_msg) {
	    return crypted_msg;
	};

	ocp.crypto.serialize = function(obj) {
	    return $.param(obj);
	};
})(ocp);