function OCP(type) {
}

OCP.prototype.hash = function(content) {
    var result = CryptoJS.SHA1(content);
    return result.toString();
};

OCP.prototype.pcrypt = function(password, clear_msg) {
    return clear_msg;
};

OCP.prototype.pdecrypt = function(password, crypted_msg) {
    return crypted_msg;
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