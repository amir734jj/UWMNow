var _ = require("underscore");
var encrypt = require("sha1");

exports.addClass = function(req, db, models, callback) {
	models.userModel.findOne({
		where: {
			hashcode: req.session.user.hashcode
		}
	}).done(function(user) {
		var listOfSubscribedClasses = {};
		if (!_.isNull(user.listOfSubscribedClasses)) {
			listOfSubscribedClasses = JSON.parse(user.listOfSubscribedClasses);
		}

		listOfSubscribedClasses[encrypt(req.body.departmentCode + req.body.classNumber)] = {
			"subscribeDate": new Date(),
			"classDepartment": req.body.departmentCode,
			"classNumber": req.body.classNumber,
			"classDate": (_.isArray(req.body.classDate)) ? req.body.classDate : [].append(req.body.classDate)
		}


		models.userModel.update({
			"listOfSubscribedClasses": JSON.stringify(listOfSubscribedClasses)
		}, {
			where: {
				hashcode: req.session.user.hashcode
			}
		}).done(function(userItem) {
			callback(userItem);
		});
	});
}


exports.deleteClass = function(req, db, models, callback) {
	models.userModel.findOne({
		where: {
			hashcode: req.session.user.hashcode
		}
	}).done(function(user) {
		var listOfSubscribedClasses = {};
		if (!_.isNull(user["listOfSubscribedClasses"])) {
			listOfSubscribedClasses = JSON.parse(user["listOfSubscribedClasses"]);

			listOfSubscribedClasses = _.omit(listOfSubscribedClasses, encrypt(req.params.departmentCode + req.params.classNumber))

			models.userModel.update({
				"listOfSubscribedClasses": JSON.stringify(listOfSubscribedClasses)
			}, {
				where: {
					hashcode: req.session.user.hashcode
				}
			}).done(function(userItem) {
				callback(userItem);
			});
		}
	});
}


exports.listClasses = function(req, db, models, callback) {
	models.userModel.findOne({
		where: {
			hashcode: req.session.user.hashcode
		}
	}).done(function(user) {
		if (_.isNull(user.listOfSubscribedClasses) || _.keys(JSON.parse(user["listOfSubscribedClasses"])).length === 0) {
			callback({});
		} else {
			var classes = JSON.parse(user.listOfSubscribedClasses);
			var count = 0;

			_.each(classes, function(value, key, obj) {
				models.discussionModel.findAll({
					where: {
						classUID: encrypt(value.classDepartment + value.classNumber)
					}
				}).done(function(discussions) {
					value.discussionsCount = discussions.length;
					models.userModel.findAll().done(function(users) {
						_.map(users, function(usersItem) {
							listOfClasses = JSON.parse(usersItem["listOfSubscribedClasses"]);
							if (listOfClasses && listOfClasses[encrypt(value.classDepartment + value.classNumber)]) {
								if (value.countOfRegisteredStudents)
									value.countOfRegisteredStudents++;
								else
									value.countOfRegisteredStudents = 1;
							}
						});
						if (count == _.keys(classes).length - 1)
							callback(classes);
						else
							count++;
					});

				});
			});
		}
	});
}
