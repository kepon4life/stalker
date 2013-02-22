$(document).ready(function () {

	var one_popover_is_visible = false;
	var clickedAway = false;

	initPopover();

	$(document).on("click", "a[rel=popover]", function(){
	    	if(one_popover_is_visible){
	    		$("a[rel=popover].popover_on").popover("hide");
	    		one_popover_is_visible = false;
	    	} else{
	    		$(this).popover("show");
	    		$(this).addClass("popover_on");
	    		one_popover_is_visible = true;
	    		clickedAway = false;
	    	}  
	})


//prob --> peut pas cliquer ds le form
/*
	$(document).click(function(e) {
  		if(one_popover_is_visible & clickedAway){
    		$('a[rel=popover].popover_on').popover('hide')
    		one_popover_is_visible = clickedAway = false
  		}else{
  			clickedAway = true
  		}
	});
*/

	

	



	$(document).on('click',"a.dream-accept-save", function(){


		var in_secret_room = $(this).parent().parent().parent().children("h3.popover-title").children("input[type=checkbox]").is(':checked');

		var id = $(this).attr("id");

		id = id.replace("dream-accept-save-",'');

		var is_valid = true;

		var category_ids = new Array();



		$.each($(this).parent().children(".form_categories_inputs").children("input[type=checkbox]:checked"), function (key, value) {
    		category_ids.push($(this).val());
		}); 




		if(category_ids.length > 0 || in_secret_room){
			saveDream(id, is_valid, category_ids, in_secret_room);
			$('a[rel=popover].popover_on').popover('hide');
			removeImgInDom(id);
		}

		
	});






	$(document).on("click","a.btn.dream-refuse",function(){
		var id = $(this).parent().parent().parent().attr("id");
		id = id.replace("dream_",'');
		saveDream(id, false, []);
		removeImgInDom(id);
	});

});





function removeImgInDom(id){
	$("div#dream_"+id).remove();
	incrementNbDreams(-1);
	$("#nb_dream").removeClass("new_img_received");
}




function saveDream(id, is_valid, category_ids, in_secret_room){
	$.ajax({
		  type: "GET",
		  url: "/dreams/tagDream",
		  data: { file_name: id+DREAM_EXTENSION, is_valid: is_valid, category_ids: category_ids, in_secret_room: in_secret_room }
		}).done(function( msg ) {
		  //alert( "Data Saved: ");
		});
}