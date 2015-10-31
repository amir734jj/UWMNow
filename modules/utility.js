exports.getDateName = function(date) {
	var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	return weekday[date.getDate() % 7];
}


exports.parseDate = function(inputTimestamp) {
	var date = Date.parse(inputTimestamp);
	return new Date(date);
}



// app.get("/schedule", function(req, res) {
// 	schedule.listClasses(req, sequelize, databaseModels.classModel, function(classSchedules) {
// 		classSchedules = JSON.parse(JSON.stringify(classSchedules));
// 		_.map(classSchedules, function(classSchedule) {
// 			classSchedule.classDate = utility.getDateName(utility.parseDate(classSchedule.classDate));
// 		});
// 		res.render("schedule", {
// 			"user": req.session.user,
// 			"classes": classSchedules
// 		});
// 	});
// });


// app.post("/updateschedule", function(req, res) {
// 	schedule.addClass(req, sequelize, databaseModels.classModel, function(classSchedule) {
// 		res.redirect("/schedule");
// 	});
// });
