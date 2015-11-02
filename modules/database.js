exports.initialize = function(db, Sequelize) {
	var User = db.define("user", {
		firstName: {
			type: Sequelize.STRING
		},
		lastName: {
			type: Sequelize.STRING
		},
		email: {
			type: Sequelize.STRING,
			unique: true
		},
		password: {
			type: Sequelize.STRING
		},
		hashcode: {
			type: Sequelize.STRING,
			unique: true
		},
		active: {
			type: Sequelize.BOOLEAN,
			defaultValue: false
		},
		admin: {
			type: Sequelize.BOOLEAN,
			defaultValue: false
		},
		listOfSubscribedClasses: {
			type: Sequelize.BLOB
		}
	}, {
		freezeTableName: true
	});

	var Class = db.define("class", {
		classDepartment: {
			type: Sequelize.STRING
		},
		classNumber: {
			type: Sequelize.INTEGER
		},
		classUID: {
			type: Sequelize.STRING,
			unique: true
		}
	}, {
		freezeTableName: true
	});


	var News = db.define("news", {
		newsText: {
			type: Sequelize.STRING
		},
		newsDate: {
			type: Sequelize.DATE
		},
		newsApprove: {
			type: Sequelize.BOOLEAN,
			defaultValue: false
		},
		hashcode: {
			type: Sequelize.STRING
		},
		newsUID: {
			type: Sequelize.STRING,
			unique: true
		}
	}, {
		freezeTableName: true
	});


	var Discussion = db.define("discussion", {
		discussionText: {
			type: Sequelize.BLOB
		},
		discussionDate: {
			type: Sequelize.DATE
		},
		discussionApprove: {
			type: Sequelize.BOOLEAN,
			defaultValue: true
		},
		hashcode: {
			type: Sequelize.STRING
		},
		discussionUID: {
			type: Sequelize.STRING,
			unique: true
		},
		classUID: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	db.sync({
		force: false
	});

	return {
		"userModel": User,
		"newsModel": News,
		"classModel": Class,
		"discussionModel": Discussion
	};
};
