(function(ocp, undefined) {
	ocp.crypto = {};

	ocp.crypto.hash = function(ab) {
		if (typeof ab === 'string') {
			ab = ocp.utils.str2ab(ab);
		}
		var wa = ocp.utils.ab2wa(ab);
	    var result = CryptoJS.SHA1(wa);
	    return result.toString();
	};

	ocp.crypto.pcrypt = function(password, clear_ab) {
		var wa = ocp.utils.ab2wa(clear_ab);
		var cipher = CryptoJS.AES.encrypt(wa, password);
		var b64 = cipher.toString();
		var wa2 = CryptoJS.enc.Base64.parse(b64);
		var result = ocp.utils.wa2ab(wa2);
		return result;
	};

	ocp.crypto.pdecrypt = function(password, crypted_ab) {
		var wa = ocp.utils.ab2wa(crypted_ab);
		var b64 = CryptoJS.enc.Base64.stringify(wa);
		var decrypted_wa = CryptoJS.AES.decrypt(b64, password);
	    return ocp.utils.wa2ab(decrypted_wa);
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
	    return ocp.utils.str2ab(JSON.stringify(obj, null, " "));
	};

	ocp.crypto.generate_secret_key = function() {
		return ocp.utils.str2ab('toto');
	};

	ocp.crypto.combine = function(email, password) {
		return email + password;
	};
})(ocp);