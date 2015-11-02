var _ = require("underscore");
var encrypt = require("sha1");

exports.getListOfDepartment = function() {
	return {
		"Computer Science (CS)": "CS",
		"Electrical engineering (EE)": "EE",
		"Industrial engineering (IE)": "IE"
	};
}


exports.getAllApprovedDiscussion = function(req, db, models, callback) {
	models.discussionModel.findAll({
		where: {
			discussionApprove: true
		},
		order: [
			['discussionDate', 'DESC']
		],
		limit: 10
	}).done(function(discussions) {
		if (_.isUndefined(discussions) || _.isNull(discussions)) {
			callback(null);
		} else {
			if (discussions.length === 0) {
				callback(discussions)
			} else {
				var count = 0;
				_.map(discussions, function(discussionItem) {
					models.classModel.findOne({
						where: {
							classUID: discussionItem.classUID
						}
					}).done(function(classItem) {
						models.userModel.findOne({
							where: {
								hashcode: discussionItem.hashcode
							}
						}).done(function(userItem) {
							discussionItem.initial = userItem.firstName.charAt(0).toUpperCase() + "." +
								userItem.lastName.charAt(0).toUpperCase() + ".";
							discussionItem.className = classItem.classDepartment + "-" + classItem.classNumber;
							discussionItem.departmentCode = classItem.classDepartment;
							discussionItem.classNumber = classItem.classNumber;
							if (count === discussions.length - 1)
								callback(discussions);
							else
								count++;
						});
					});
				});
			}
		}
	});
}

exports.getAllDiscussion = function(req, db, models, callback) {
	models.discussionModel.findAll({
		order: [
			['discussionDate', 'DESC']
		]
	}).done(function(discussions) {
		if (_.isUndefined(discussions) || _.isNull(discussions)) {
			callback(null);
		} else {
			if (discussions.length === 0) {
				callback(discussions)
			} else {
				var count = 0;
				_.map(discussions, function(discussionItem) {
					models.classModel.findOne({
						where: {
							classUID: discussionItem.classUID
						}
					}).done(function(classItem) {
						models.userModel.findOne({
							where: {
								hashcode: discussionItem.hashcode
							}
						}).done(function(userItem) {
							discussionItem.initial = userItem.firstName.charAt(0).toUpperCase() + "." +
								userItem.lastName.charAt(0).toUpperCase() + ".";
							discussionItem.className = classItem.classDepartment + "-" + classItem.classNumber;
							discussionItem.departmentCode = classItem.classDepartment;
							discussionItem.classNumber = classItem.classNumber;
							if (count === discussions.length - 1)
								callback(discussions);
							else
								count++;
						});
					});
				});
			}
		}
	});
}

exports.getDiscussionByClass = function(req, db, models, callback) {
	models.classModel.findOne({
		where: {
			classUID: encrypt(req.params.departmentCode + req.params.classNumber)
		}
	}).done(function(classItem) {
		if (_.isUndefined(classItem) || _.isNull(classItem)) {
			callback(null);
		} else {
			models.discussionModel.findAll({
				where: {
					classUID: classItem.classUID,
					discussionApprove: true
				},
				order: [
					['discussionDate', 'DESC']
				]
			}).done(function(discussions) {
				if (discussions.length === 0) {
					callback(discussions);
				} else {
					var count = 0;
					_.map(discussions, function(discussionItem) {
						models.userModel.findOne({
							where: {
								hashcode: discussionItem.hashcode
							}
						}).done(function(user) {
							discussionItem.initial = user.firstName.charAt(0).toUpperCase() + "." +
								user.lastName.charAt(0).toUpperCase() + ".";
							discussionItem.className = classItem.classDepartment + "-" + classItem.classNumber;

							if (req.session.user.hashcode === user.hashcode) {
								discussionItem.userSelf = true;
							}
							if (count === discussions.length - 1)
								callback(discussions);
							else
								count++;
						});
					});
				}
			});
		}
	});
}


exports.getDiscussionByUser = function(req, db, models, callback) {
	models.discussionModel.findAll({
		where: {
			hashcode: req.session.user.hashcode
		},
		order: [
			['discussionDate', 'DESC']
		]
	}).done(function(discussions) {
		if (_.isUndefined(discussions) || _.isNull(discussions)) {
			callback(null);
		} else {
			if (discussions.length === 0) {
				callback(discussions);
			} else {
				var count = 0;
				_.map(discussions, function(discussionItem) {
					models.classModel.findOne({
						where: {
							classUID: discussionItem.classUID
						}
					}).done(function(classItem) {
						discussionItem.className = classItem.classDepartment + "-" + classItem.classNumber;
						discussionItem.initial = req.session.user.firstName.charAt(0).toUpperCase() + "." +
							req.session.user.lastName.charAt(0).toUpperCase() + ".";
						if (count === discussions.length - 1)
							callback(discussions);
						else
							count++;
					});
				});
			}
		}
	});
}



exports.addDiscussion = function(req, db, models, callback) {
	models.classModel.findOne({
		where: {
			classUID: encrypt(req.params.departmentCode + req.params.classNumber)
		}
	}).done(function(classItem) {
		if (_.isNull(classItem)) {
			models.classModel.create({
				classDepartment: req.params.departmentCode,
				classNumber: req.params.classNumber,
				classUID: encrypt(req.params.departmentCode + req.params.classNumber)
			}).done(function(newClassItem) {
				models.discussionModel.create({
					discussionText: req.body.discussionText,
					discussionDate: new Date(),
					discussionApprove: true,
					hashcode: req.session.user.hashcode,
					discussionUID: encrypt(req.body.discussionText + new Date() + req.session.user.hashcode),
					classUID: newClassItem.classUID
				}).done(function(discussionItem) {
					callback(discussionItem);
				})
			});
		} else {
			models.discussionModel.create({
				discussionText: req.body.discussionText,
				discussionDate: new Date(),
				discussionApprove: true,
				hashcode: req.session.user.hashcode,
				discussionUID: encrypt(req.body.discussionText + new Date() + req.session.user.hashcode),
				classUID: classItem.classUID
			}).done(function(discussionItem) {
				callback(discussionItem);
			})
		}
	});
}


exports.deleteDiscussionByUser = function(req, db, models, callback) {
	models.discussionModel.destroy({
		where: {
			hashcode: req.session.user.hashcode,
			discussionUID: req.params.discussionUID
		}
	}).done(function(discussionItem) {
		callback(discussionItem);
	});
}



exports.updateDiscussionByAdmin = function(req, db, models, callback) {
	if (req.params.command === "deletediscussion") {
		models.discussionModel.destroy({
			where: {
				discussionUID: req.params.discussionUID
			}
		}).done(function(discussionItem) {
			callback(discussionItem);
		});
	} else if (req.params.command === "approvediscussion" || req.params.command ===
		"unapprovediscussion") {
		models.discussionModel.update({
			discussionApprove: (req.params.command === "approvediscussion") ? true : false
		}, {
			where: {
				discussionUID: req.params.discussionUID
			}
		}).done(function(rows) {
			callback(rows);
		});
	}
}
