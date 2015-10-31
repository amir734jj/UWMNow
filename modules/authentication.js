var _ = require("underscore");
var encrypt = require("sha1");

exports.loginAccount = function(req, db, userModel, callback) {
	userModel.findOne({
		where: {
			email: req.body.email,
			password: req.body.password
		}
	}).done(function(user) {
		callback(user);
	});
};

exports.registerAccount = function(req, db, userModel, callback) {
	userModel.findOne({
		where: {
			email: req.body.email
		}
	}).done(function(user) {
		if (!_.isNull(user)) {
			user.already = true;
			callback(user);
		} else {
			userModel.create({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				password: req.body.password,
				hashcode: encrypt(req.body.firstName + req.body.lastName + req.body.email)
			}).done(function(user) {
				callback(user);
			});
		}
	});
};


exports.updateAccount = function(req, db, userModel, callback) {
	userModel.update({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: req.body.password,
		hashcode: encrypt(req.body.firstName + req.body.lastName + req.body.email)
	}, {
		where: {
			hashcode: req.session.user.hashcode
		}
	}).done(function(rows) {
		userModel.findOne({
			where: {
				email: req.body.email
			}
		}).done(function(user) {
			callback(user);
		});
	});
}


exports.listAccounts = function(req, db, userModel, callback) {
	userModel.findAll().done(function(users) {
		callback(users);
	});
}


exports.updateAccountByAdmin = function(req, db, userModel, callback) {
	if (req.params.command === "activate" || req.params.command === "inactivate") {
		userModel.update({
			active: (req.params.command === "activate") ? true : false
		}, {
			where: {
				hashcode: req.params.uid
			}
		}).done(function(user) {
			callback(user);
		});
	} else if (req.params.command === "user" || req.params.command ===
		"administrator") {
		userModel.update({
			admin: (req.params.command === "administrator") ? true : false
		}, {
			where: {
				hashcode: req.params.uid
			}
		}).done(function(user) {
			callback(user);
		});
	}
}

exports.activateUserByEmail = function(req, db, userModel, callback) {
	userModel.update({
		active: true
	}, {
		where: {
			hashcode: req.params.hashcode
		}
	}).done(function(rows) {
		userModel.findOne({
			where: {
				hashcode: req.params.hashcode
			}
		}).done(function(user) {
			callback(user);
		});
	});
}
