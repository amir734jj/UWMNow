var _ = require("underscore");

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
			}
		});
	});

	var result = [];

	// check for difficult class
	var count1 = 0;
	_.map(myClassList, function(value, key) {
		if (value.rate >= 4) {
			count1++;
		}
	});
	if (count1 >= 2) {
		result.push({
			"message": "According to the users ratings: You have at least two difficult classes in the same semester",
			"important": "alert alert-danger"
		});
	}

	// check for difficult class
	var count2 = 0;
	_.map(myClassList, function(value, key) {
		if (parseInt(value.classNumber) >= 700) {
			count2++;
		}
	});
	if (count2 >= 2) {
		result.push({
			"message": "According to the class number: You have at least two graduate level classes in the same semester",
			"important": "alert alert-danger"
		});
	}


	// check for difficult class
	var count3 = 0;
	_.map(myClassList, function(value, key) {
		if (parseInt(value.classNumber) >= 500 && parseInt(value.classNumber) < 700) {
			count3++;
		}
	});
	if (count3 >= 2) {
		result.push({
			"message": "According to the class number: You have at least two senior level undergraduate classes in the same semester",
			"important": "alert alert-danger"
		});
	}

	// check for easy class
	var count4 = 0;
	_.map(myClassList, function(value, key) {
		if (value.rate >= 1 && value.rate < 3) {
			count4++;
		}
	});
	if (count4 >= 2) {
		result.push({
			"message": "According to the users ratings: You have at least two easy classes in the same semester",
			"important": "alert alert-info"
		});
	}

	return result;
}
