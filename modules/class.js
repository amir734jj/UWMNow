var _ = require("underscore");
var encrypt = require("sha1");

exports.getAllClasses = function(req, db, models, callback) {
	models.classModel.findAll().done(function(classList) {
		if (_.isArray(classList)) {
			_.map(classList, function(classItem) {
				if (!classItem.extendedAttributes && !_.isUndefined(classItem.extendedAttributes) && !_.isNull(classItem.extendedAttributes)) {
					extendedAttributes = {};
				} else {
					extendedAttributes = JSON.parse(classItem.extendedAttributes);
					var sum = 0,
						count = 0;
					_.each(extendedAttributes, function(value, key) {
						sum += parseInt(value);
						count++;
					});

					if (count !== 0) {
						classItem.value = Math.ceil(sum / count);
						classItem.count = count;
					} else {
						classItem.value = 3;
						classItem.count = count;
					}
				}
			});
			callback(sortByKey(classList, "value"));
		}
	});
}

exports.getUsersEnrolled = function(req, db, models, callback) {
	models.classModel.findOne({
		where: {
			classUID: encrypt(req.params.departmentCode + req.params.classNumber)
		}
	}).done(function(classItem) {
		models.userModel.findAll().done(function(users) {
			var usersReturn = [];
			_.map(users, function(userItem) {
				listOfClasses = JSON.parse(userItem["listOfSubscribedClasses"]);

				if (listOfClasses && listOfClasses[encrypt(req.params.departmentCode + req.params.classNumber)]) {
					usersReturn.push(userItem);
				}
			});
			callback(usersReturn);
		});
	});
}

exports.setClassRating = function(req, db, models, callback) {
	models.classModel.findOne({
		where: {
			classUID: req.body.classUID
		}
	}).done(function(classItem) {
		var extendedAttributes;
		if (!classItem.extendedAttributes && !_.isUndefined(classItem.extendedAttributes) && !_.isNull(classItem.extendedAttributes)) {
			extendedAttributes = {};
		} else {
			extendedAttributes = JSON.parse(classItem.extendedAttributes);
		}
		extendedAttributes[req.session.user.hashcode] = req.body.value;
		models.classModel.update({
			"extendedAttributes": JSON.stringify(extendedAttributes)
		}, {
			where: {
				classUID: req.body.classUID
			}
		}).done(function(updatedRow) {
			callback(updatedRow);
		});
	});
}


function sortByKey(array, key) {
	return array.sort(function(a, b) {
		var y = a[key];
		var x = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}


exports.classAnalyze = function(myClassList, allClassList) {
	_.each(myClassList, function(value, key) {
		var rate;
		_.map(allClassList, function(classItem) {
			if (key === classItem.classUID) {
				value.rate = classItem.value;
				value.name = classItem.classDepartment + "-" + classItem.classNumber;
			}
		});
	});

	var result = [];
	var temp;
	var count;

	// check for multiple class in the same day
	count = 0;
	temp = {};
	_.map(myClassList, function(value1, key1) {
		_.map(value1.classDate, function(value2) {
			if (temp[value2]) {
				temp[value2].name.push(value1.name);
				temp[value2].count = 1 + temp[value2].count;
			} else {
				temp[value2] = {};
				temp[value2].name = [value1.name];
				temp[value2].count = 1;
			}
		});
	});



	temp.temp = [];
	_.map(temp, function(value, key) {
		if (value.count >= 2) {
			temp.temp.push(value.name);
			count = value.count;
		}
	});

	if (count >= 4) {
		result.push({
			"message": "According to the schedule, you have at least 4 classes on the same day",
			"important": "alert alert-danger",
			"result": temp.temp
		});
	}


	// check for difficult class
	count = 0;
	temp = [];
	_.map(myClassList, function(value, key) {
		if (value.rate >= 4) {
			count++;
			temp.push(value.name);
		}
	});
	if (count >= 2) {
		result.push({
			"message": "According to the users ratings: You have at least two difficult classes in the same semester",
			"important": "alert alert-danger",
			"result": temp
		});
	}

	// check for difficult class
	count = 0;
	temp = [];
	_.map(myClassList, function(value, key) {
		if (parseInt(value.classNumber) >= 700) {
			count++;
			temp.push(value.name);
		}
	});
	if (count >= 2) {
		result.push({
			"message": "According to the class number: You have at least two graduate level classes in the same semester",
			"important": "alert alert-danger",
			"result": temp
		});
	}


	// check for difficult class
	count = 0;
	temp = [];
	_.map(myClassList, function(value, key) {
		if (parseInt(value.classNumber) >= 500 && parseInt(value.classNumber) < 700) {
			count++;
			temp.push(value.name);
		}
	});
	if (count >= 2) {
		result.push({
			"message": "According to the class number: You have at least two senior level undergraduate classes in the same semester",
			"important": "alert alert-danger",
			"result": temp
		});
	}

	// check for easy class
	count = 0;
	temp = [];
	_.map(myClassList, function(value, key) {
		if (value.rate >= 1 && value.rate < 3) {
			count++;
			temp.push(value.name);
		}
	});
	if (count >= 2) {
		result.push({
			"message": "According to the users ratings: You have at least two easy classes in the same semester",
			"important": "alert alert-info",
			"result": temp
		});
	}

	// check for empty result
	temp = [];
	if (result.length === 0) {
		result.push({
			"message": "No issue has been found by the system",
			"important": "alert alert-success",
			"result": temp
		});
	}

	return result;
}
