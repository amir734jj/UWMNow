var _ = require("underscore");
var encrypt = require("sha1");

exports.addNews = function(req, db, newsModel, callback) {
	newsModel.create({
		newsText: req.body.newsText,
		newsDate: new Date(),
		newsApprove: false,
		newsUID: encrypt(req.body.newsText + new Date() + req.session.user.hashcode),
		hashcode: req.session.user.hashcode
	}).done(function(newsItem) {
		callback(newsItem);
	});
}

exports.listApprovedNews = function(req, db, newsModel, userModel, callback) {
	newsModel.findAll({
		where: {
			newsApprove: true
		},
		order: [
			['newsDate', 'DESC']
		]
	}).done(function(news) {
		userModel.findAll().done(function(users) {
			_.map(news, function(newsItem) {
				_.map(users, function(user) {
					if (newsItem.hashcode === user.hashcode) {
						newsItem.email = user.email;
						newsItem.initial = user.firstName.charAt(0).toUpperCase() + "." +
							user.lastName.charAt(0).toUpperCase() + ".";
					}
				});
			});
			callback(news);
		});
	});
}

exports.listUnapprovedNews = function(req, db, newsModel, userModel, callback) {
	newsModel.findAll({
		where: {
			newsApprove: false
		},
		order: [
			['newsDate', 'DESC']
		]
	}).done(function(news) {
		userModel.findAll().done(function(users) {
			_.map(news, function(newsItem) {
				_.map(users, function(user) {
					if (newsItem.hashcode === user.hashcode) {
						newsItem.email = user.email;
						newsItem.initial = user.firstName.charAt(0).toUpperCase() + "." +
							user.lastName.charAt(0).toUpperCase() + ".";
					}
				});
			});
			callback(news);
		});
	});
}

exports.listNewsByUser = function(req, db, newsModel, callback) {
	newsModel.findAll({
		where: {
			hashcode: req.session.user.hashcode
		},
		order: [
			['newsDate', 'DESC']
		]
	}).done(function(news) {
		_.map(news, function(newsItem) {
			if (newsItem.hashcode === req.session.user.hashcode) {
				newsItem.email = req.session.user.email;
				newsItem.initial = req.session.user.firstName.charAt(0).toUpperCase() +
					"." + req.session.user.lastName.charAt(0).toUpperCase() + ".";
			}
		})
		callback(news);
	});
}


exports.deletePostedNewsByUser = function(req, db, newsModel, callback) {
	newsModel.destroy({
		where: {
			newsUID: req.params.uid,
			hashcode: req.session.user.hashcode
		}
	}).done(function(deleteNews) {
		callback(deleteNews);
	});
}

exports.updatePostedNewsByAdmin = function(req, db, newsModel, callback) {
	if (req.params.command === "deletenews") {
		newsModel.destroy({
			where: {
				newsUID: req.params.uid
			}
		}).done(function(deleteNews) {
			callback(deleteNews);
		});
	} else if (req.params.command === "approvenews" || req.params.command ===
		"unapprovenews") {
		newsModel.update({
			newsApprove: (req.params.command === "approvenews") ? true : false
		}, {
			where: {
				newsUID: req.params.uid
			}
		}).done(function(rows) {
			callback(rows);
		});
	}
}
