 $(document).ready(function() {
 	// 	$('.input-group.date').datepicker({
 	// 		weekStart: 1,
 	// 		startDate: new Date(),
 	// 		endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
 	// 		autoclose: true
 	// 	});
 	//
 	// 	$('.clockpicker').clockpicker({
 	// 		donetext: 'Done'
 	// 	});

 	$("#listOfDepartment").select2();

 	$('#discussionText').summernote({
 		toolbar: [
 			['style', ['bold', 'italic', 'underline', 'clear']],
 			['fontsize', ['fontsize']],
 			['color', ['color']],
 			['para', ['ul', 'ol', 'paragraph']],
 			['height', ['height']]
 		],
 		onChange: function($editable, sHtml) {
 			$("#discussionTextCharacterCount").text(" (" +
 				$editable.replace(/(<([^>]+)>)/ig, "").length + " characters)");
 		}
 	});
 });
