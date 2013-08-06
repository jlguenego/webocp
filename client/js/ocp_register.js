$(document).ready(function() {
	$('input[type=password]').keyup(function() {
		var strength = ocp_val_eval_pwd_strength($(this).val());

		var strength_msg_a = ['', 'Weak', 'Fair', 'Strong', 'Exellent'];
		$('#register_pwstatus_text').html(strength_msg_a[strength]);
		var classname = 'good' + strength;
		console.log('strength=' + strength);
		$('#register_pwstatus').removeClass('good0 good1 good2 good3 good4').addClass(classname);
	});
});