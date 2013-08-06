function ocp_val_form_validation(form_name) {
	switch(form_name) {
		case 'register':
			ocp_val_check_empty($('#ocp_reg_name'));
			ocp_val_check_mail($('#ocp_reg_email'));
			ocp_val_check_empty($('#ocp_reg_password'));
			ocp_val_check_checked($('#register_checkbox'), 'You must agree with the OCP Terms of Service.');
			break;
		case 'login':
			ocp_val_check_mail($('#ocp_lg_email'));
			ocp_val_check_empty($('#ocp_lg_password'));
			break;
		default:
	}
}

function ocp_val_check_checked(obj, error_msg) {
	if (!obj.is(':checked')) {
		obj.focus();
		throw new OCPException(error_msg);
	}
}

function ocp_val_check_empty(obj) {
	if (obj.val() == 0) {
		obj.focus();
		throw new OCPException(obj.attr('name') + ' is empty.');
	}
}

function ocp_val_check_mail(obj) {
	if (!ocp_val_is_valid_mail(obj.val())) {
		obj.focus();
		throw new OCPException('Invalid email address.');
	}
}

function ocp_val_is_valid_mail(email) {
	// taken from: http://stackoverflow.com/questions/2855865/jquery-regex-validation-of-e-mail-address
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(email);
};