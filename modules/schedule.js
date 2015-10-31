exports.addClass = function(req, db, classModel, callback) {
	classModel.create({
		className: req.body.className,
		classDate: req.body.classDate,
		classStartTime: req.body.classStartTime,
		classEndTime: req.body.classEndTime,
		hashcode: req.session.user.hashcode
	}).done(function(classSchedule) {
		callback(classSchedule);
	});
}


exports.listClasses = function(req, db, classModel, callback) {
	classModel.findAll({
		where: {
			hashcode: req.session.user.hashcode
		}
	}).done(function(classSchedules) {
		callback(classSchedules);
	});
}
