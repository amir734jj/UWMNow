 $(document).ready(function() {

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

 	$.fn.modal.Constructor.prototype.enforceFocus = function() {};
 });
