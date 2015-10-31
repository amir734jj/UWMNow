exports.getData = function(forecast, callback) {
	forecast.get([43.082414, -87.881444], function(err, weather) {
		callback(weather);
	});
};
