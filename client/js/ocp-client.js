function OCP (type) {
}

OCP.prototype.hash = function(content) {
    return CryptoJS.SHA1(content);
};

function log(msg) {
	if (window.console) console.log(msg);
}