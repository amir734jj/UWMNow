exports.sendEmail = function(smtpTransport, email, code, rootURL, callback) {
	var mail = {
		from: "UWMNow! <amirhesamyan@gmail.com>",
		to: email,
		subject: "Please activate your UWMNow! account",
		text: "Please activate your UWMNow! account",
		html: "<a href = '" + rootURL + "/activate/" + code +
			"'>Activate account (activation link)</a>" +
			"<br /><h3>Thank you for you time!</h3>"
	}

	smtpTransport.sendMail(mail, function(error, response) {
		if (error) {
			callback("error");
		} else {
			callback(null);
		}

		smtpTransport.close();
	});
}
