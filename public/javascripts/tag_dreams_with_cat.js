$(document).ready(function () {
	var one_popover_is_visible = false;
	var clickedAway = false;

	initPopover();

	$(document).on("click", "div.dream", function(){
		if($(this).children("div.decision").hasClass("ok")){
			$(this).children("div.decision").removeClass("ok");
			$(this).children("div.decision").addClass("okPlus");
		} else if($(this).children("div.decision").hasClass("nok")){
			$(this).children("div.decision").removeClass("nok");
			$(this).children("div.decision").addClass("ok");
		} else if($(this).children("div.decision").hasClass("okPlus")){
			$(this).children("div.decision").removeClass("okPlus");
		} else{
			$(this).children("div.decision").addClass("nok");
		}
	});

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



//Recept pusher notifications
var pusher = new Pusher(PUSHER_API_KEY);
var channel = pusher.subscribe(PUSHER_CHANEL);
//Pusher.channel_auth_endpoint = '/pusher/auth';
channel.bind(PUSHER_EVENT, function(data) {
	informUserNewImgForReloadingPage();
});



//remove img when tagged
function removeImgInDom(id){
	$("div#dream_"+id).remove();
	$("#nb_dream").removeClass("new_img_received");
}


//add message to the moderator when a new img is created
function informUserNewImgForReloadingPage(){
	if($("#messages").is(':empty')){
		$("#messages").append("<div class='alert fade in'><button type='button' class='close' data-dismiss='alert'>×</button>Hey! there is <strong id='nb_dream'>1</strong> new dream(s)! Reload the page...</div>");
	}else{
		nb_dreams = $("#messages #nb_dream").text();
		$("#messages #nb_dream").text(parseInt(nb_dreams) + 1);
	}
}

//function for saving a dream
function saveDream(id, is_valid, category_ids, in_secret_room){
	$.ajax({
		  type: "GET",
		  url: "/dreams/tagDream",
		  data: { file_name: id+DREAM_EXTENSION, is_valid: is_valid, category_ids: category_ids, in_secret_room: in_secret_room }
		}).done(function( msg ) {
		  //alert( "Data Saved: ");
		});
}