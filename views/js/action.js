 $(document).ready(function() {

 	$("#listOfDepartment").select2({width: '100%'});

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

 	$(".rating").rating({
 		showClear: false,
 		starCaptions: {
 			1: "Very Easy",
 			2: "Easy",
 			3: "Moderate",
 			4: "Difficult",
 			5: "Very Difficult"
 		},
 		starCaptionClasses: {
 			1: "text-danger",
 			2: "text-warning",
 			3: "text-info",
 			4: "text-primary",
 			5: "text-success"
 		}
 	});

 	$(".rating").on("rating.change", function(event, value, caption) {
 		$.ajax({
 			url: "/rate",
 			type: "POST",
 			data: {
 				"value": value,
 				"classDepartment": event.delegateTarget.getAttribute("classDepartment"),
 				"classNumber": event.delegateTarget.getAttribute("classNumber"),
 				"classUID": event.delegateTarget.getAttribute("classUID")
 			},
 			dataType: "json",
 			success: function(message) {
 				console.log(message);
 			}
 		});
 	});

 	$.fn.modal.Constructor.prototype.enforceFocus = function() {};

 });
