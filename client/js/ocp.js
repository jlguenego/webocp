function OCP() {
	this.hash = function(content) {
	    var result = CryptoJS.SHA1(content);
	    return result.toString();
	};

	this.pcrypt = function(password, clear_msg) {
		var cipher = CryptoJS.AES.encrypt(clear_msg, password);
		var b64 = cipher.toString();
		var words = CryptoJS.enc.Base64.parse(b64);
		var latin1 = CryptoJS.enc.Latin1.stringify(words);
	    return latin1;
	};

	this.pdecrypt = function(password, crypted_msg) {
		var words = CryptoJS.enc.Latin1.parse(crypted_msg);
		var b64 = CryptoJS.enc.Base64.stringify(words);
		var d_words = CryptoJS.AES.decrypt(b64, password);
	    return d_words.toString();
	};

	this.crypt = function(secret_key, clear_msg) {
	    return clear_msg;
	};

	this.decrypt = function(secret_key, crypted_msg) {
	    return crypted_msg;
	};

	this.rsacrypt = function(key, clear_msg) {
	    return clear_msg;
	};

	this.rsadecrypt = function(key, crypted_msg) {
	    return crypted_msg;
	};

	this.serialize = function(obj) {
	    return $.param(obj);
	};
}

var ocp = new OCP();