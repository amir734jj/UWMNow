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
		}
	}, {
		freezeTableName: true
	});

	// var Class = db.define("class", {
	// 	className: {
	// 		type: Sequelize.STRING
	// 	},
	// 	classDate: {
	// 		type: Sequelize.DATE
	// 	},
	// 	classStartTime: {
	// 		type: Sequelize.STRING
	// 	},
	// 	classEndTime: {
	// 		type: Sequelize.STRING
	// 	},
	// 	hashcode: {
	// 		type: Sequelize.STRING
	// 	}
	// }, {
	// 	freezeTableName: true
	// });


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

	db.sync({
		force: false
	});

	return {
		"userModel": User,
		"newsModel": News
	};
};
