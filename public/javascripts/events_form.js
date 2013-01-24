$(document).ready(function () {

	showOrHideCategories();

	$('#form-events-all-categories').change(function(){
		showOrHideCategories();
	});



	







});


function showOrHideCategories(){

	if($('#form-events-all-categories').is(':checked')){

		$("#form-events-categories input[type=checkbox]").attr('checked', false);


		$("#form-events-categories").hide();
	} else{
		$("#form-events-categories").show();
	}
}