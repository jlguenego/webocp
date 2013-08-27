function OCP(type) {
}

OCP.prototype.hash = function(content) {
    var result = CryptoJS.SHA1(content);
    return result.toString();
};

OCP.prototype.pcrypt = function(password, clear_msg) {
	var cipher = CryptoJS.AES.encrypt(clear_msg, password);
	var b64 = cipher.toString();
	var words = CryptoJS.enc.Base64.parse(b64);
	var latin1 = CryptoJS.enc.Latin1.stringify(words);
    return latin1;
};

OCP.prototype.pdecrypt = function(password, crypted_msg) {
	var words = CryptoJS.enc.Latin1.parse(crypted_msg);
	var b64 = CryptoJS.enc.Base64.stringify(words);
	var d_words = CryptoJS.AES.decrypt(b64, password);
    return d_words.toString();
};

OCP.prototype.crypt = function(secret_key, clear_msg) {
    return clear_msg;
};

OCP.prototype.decrypt = function(secret_key, crypted_msg) {
    return crypted_msg;
};

OCP.prototype.rsacrypt = function(key, clear_msg) {
    return clear_msg;
};

OCP.prototype.rsadecrypt = function(key, crypted_msg) {
    return crypted_msg;
};

OCP.prototype.serialize = function(obj) {
    return $.param(obj);
};

var ocp_client = new OCP();