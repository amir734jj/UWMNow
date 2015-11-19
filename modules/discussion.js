var _ = require("underscore");
var encrypt = require("sha1");

exports.getListOfDepartment = function() {
	return {
		"CIV_ENG": "Civil Engineering and Mechanics",
		"COMPSCI": "Computer Science",
		"ELECENG": "Electrical Engineering",
		"EAS": "Engineering and Applied Science",
		"IND_ENG": "Industrial and Manufacturing Engineering",
		"MATLENG": "Materials Science and Engineering",
		"MECHENG": "Mechanical Engineering",
		"BMS": "Biomedical Sciences",
		"COMSDIS": "Communication Sciences and Disorders",
		"HCA": "Health Care Administration",
		"HIS": "Health Sciences",
		"KIN": "Kinesiology",
		"NUTR": "Nutritional Sciences",
		"OCCTHPY": "Occupational Therapy",
		"SPT&REC": "Sport and Recreation",
		"THERREC": "Therapeutic Recreation",
		"AFRICOL": "Africology",
		"AIS": "American Indian Studies",
		"ANTHRO": "Anthropology",
		"ARABIC": "Arabic",
		"ARTHIST": "Art History",
		"ASTRON": "Astronomy",
		"ATM_SC": "Atmospheric Sciences",
		"BIO_SCI": "Biological Sciences",
		"CELTIC": "Celtic Studies",
		"CHEM": "Chemistry and Biochemistry",
		"CHINESE": "Chinese",
		"CLASSIC": "Classics",
		"COMMUN": "Communication",
		"COMPLIT": "Comparative Literature",
		"CES": "Conservation and Environmental Sciences",
		"ECON": "Economics",
		"ENGLISH": "English",
		"ESL": "English as a Second Language",
		"ETHNIC": "Ethnic Studies, Comparative",
		"FILMSTD": "Film Studies",
		"FOOD": "Food Studies",
		"FLL": "Foreign Languages and Literature",
		"FRENCH": "French",
		"GEOG": "Geography",
		"GEO_SCI": "Geosciences",
		"GERMAN": "German",
		"GREEK": "Greek",
		"HEBR_ST": "Hebrew Studies",
		"HIST": "History",
		"HMONG": "Hmong Studies",
		"HONORS": "Honors College",
		"IND_REL": "Industrial and Labor Relations",
		"INTLST": "International Studies",
		"ITALIAN": "Italian",
		"JAPAN": "Japanese",
		"JEWISH": "Jewish Studies",
		"JAMS": "Journalism, Advertising, and Media Studies",
		"KOREAN": "Korean",
		"LATIN": "Latin",
		"LACS": "Latin American and Caribbean Studies",
		"LATINO": "Latino Studies",
		"LGBT": "Lesbian, Gay, Bisexual & Transgender Studies",
		"L&S_HUM": "Letters and Science-Humanities",
		"L&S_NS": "Letters and Science-Natural Science",
		"L&S_SS": "Letters and Science-Social Sciences",
		"LIBRLST": "Liberal Studies",
		"LINGUIS": "Linguistics",
		"MALLT": "M.A. in Language, Literature, and Translation",
		"MATH": "Mathematical Sciences",
		"MTHSTAT": "Mathematical Statistics",
		"NONPROF": "Nonprofit Administration",
		"PEACEST": "Peace Studies",
		"PHILOS": "Philosophy",
		"PHYSICS": "Physics",
		"POLISH": "Polish",
		"POL_SCI": "Political Science",
		"PORTUGS": "Portuguese",
		"PSYCH": "Psychology",
		"PUB_ADM": "Public Administration",
		"RELIGST": "Religious Studies",
		"RUSSIAN": "Russian",
		"SCNDVST": "Scandinavian Studies",
		"SOCIOL": "Sociology",
		"SPANISH": "Spanish",
		"TRNSLTN": "Translation and Interpreting",
		"URB_STD": "Urban Studies Program",
		"WMNS": "Women's Studies Program",
		"CRM_JST": "Criminal Justice",
		"MIL_SCI": "Military Science",
		"SOC_WRK": "Social Work",
		"ART_ED": "Art Education",
		"ART": "Art and Design",
		"DANCE": "Dance",
		"FILM": "Film, Video, Animation and New Genres",
		"FINEART": "Fine Arts-Interdepartmental",
		"MUSIC": "Music",
		"MUS_ED": "Music Education",
		"MUSPERF": "Music Performance",
		"THEATRE": "Theater",
		"ARCH": "Architecture",
		"URBPLAN": "Urban Planning",
		"AD_LDSP": "Administrative Leadership",
		"COUNS": "Counseling",
		"CURRINS": "Curriculum and Instruction",
		"ED_POL": "Educational Policy and Community Studies",
		"Educational Psychology": "ED_PSY",
		"EXCEDUC": "Exceptional Education",
		"FRSHWTR": "Freshwater Sciences",
		"INFOST": "Information Studies",
		"NURS": "Nursing",
		"UWS_NSG": "UWS Collaborative Nursing Program",
		"EOH": "Environmental and Occupational Health",
		"PH": "Public Health",
		"BUS_ADM": "Business Administration",
		"BUSMGMT": "Business Management"
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
							discussionItem.initial = userItem.firstName.ucfirst() + ". " +
								userItem.lastName.charAt(0).toUpperCase() + ".";
							discussionItem.user = userItem;
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
							discussionItem.initial = userItem.firstName.ucfirst() + ". " +
								userItem.lastName.charAt(0).toUpperCase() + ".";
							discussionItem.user = userItem;
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
							discussionItem.initial = user.firstName.ucfirst() + ". " +
								user.lastName.charAt(0).toUpperCase() + ".";
							discussionItem.className = classItem.classDepartment + "-" + classItem.classNumber;
							discussionItem.user = user;
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
						discussionItem.user = req.session.user;
						discussionItem.className = classItem.classDepartment + "-" + classItem.classNumber;
						discussionItem.initial = req.session.user.firstName.ucfirst() + ". " +
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
		if (_.isNull(classItem) || _.isUndefined(classItem)) {
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


exports.getAllApprovedDiscussionByGivenUser = function(req, db, models, callback) {
	models.discussionModel.findAll({
		where: {
			discussionApprove: true,
			hashcode: req.params.hashcode
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
							discussionItem.initial = userItem.firstName.ucfirst() + ". " +
								userItem.lastName.charAt(0).toUpperCase() + ".";
							discussionItem.user = userItem;
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
