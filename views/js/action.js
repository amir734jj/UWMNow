 $(document).ready(function() {

 	var icons = new Skycons({
 			"color": "darkblue"
 		}),
 		list = [
 			"clear-day",
 			"clear-night",
 			"partly-cloudy-day",
 			"partly-cloudy-night",
 			"cloudy",
 			"rain",
 			"sleet",
 			"snow",
 			"wind",
 			"fog"
 		],
 		i;

 	for (i = list.length; i--;)
 		icons.set(list[i], list[i]);

 	icons.play();

 	$('.input-group.date').datepicker({
 		weekStart: 1,
 		startDate: new Date(),
 		endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
 		autoclose: true
 	});

 	$('.clockpicker').clockpicker({
 		donetext: 'Done'
 	});
 });
