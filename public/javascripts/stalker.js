$(document).ready(function () {


	//Buble with dreams number initialization
	$.ajax({
	    dataType: 'jsonp',
	    type: "GET",
		url: "/services/nbdreams",
	    success: function(response) {
	    	incrementNbDreams(parseInt(response.nbImg));
	    }
	});



	//Recept pusher notifications
	var pusher = new Pusher(PUSHER_API_KEY); 
	var channel = pusher.subscribe(PUSHER_CHANEL);
	//Pusher.channel_auth_endpoint = '/pusher/auth';
	channel.bind(PUSHER_EVENT, function(data) {
	  //alert('An event was triggered with message: ' + data.imgUrl);
	  incrementNbDreams(1);

	  //Change color of buble to red
	  $("#nb_dream").addClass("new_img_received");

	  //If we are on tag page
	  if ($("div#tag_dreams").length > 0){
	  	addImgToTagg(data.imgUrl);
	  }

	});






});

//increment the number of dream in buble
function incrementNbDreams(nb){
	$("#nb_dream em").html(parseInt($("#nb_dream em").html()) + nb);

}


function initPopover(){
	$("a[rel=popover]").each(function() {
		var $pElem= $(this);

		var id = $pElem.parent().parent().parent().attr("id");
		id = id.replace("dream_",'');

	    $pElem.popover(
	        {
	        	html:true,
	          	title: "Categories",
	          	trigger: "manual",
	          	content: $("#popover_" + id).html()
	        }
	    )
	});
}

function addImgToTagg(imgUrl){
	var imgName = imgUrl.replace(DREAM_EXTENSION ,"")
	$("div#tag_dreams").append("<div class='dream' id='dream_"+imgName+"'><img class='dream' src='/dreams/untreated/"+imgUrl+"' alt='"+imgName+"' /><div class='btn-toolbar'><div class='btn-group'><a href='#myModal_"+imgName+"' data-toggle='modal' class='btn'><i class='icon-search'></i></a><a class='btn dream-accept' rel='popover' href='#' data-original-title=''><i class='icon-ok'></i></a><a class='btn dream-refuse' href='#''><i class='icon-remove'></i></a></div></div><div id='myModal_"+imgName+"' class='modal hide fade' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'><img src='/dreams/untreated/"+imgUrl+"' alt='"+imgName+"'></div></div><div class='form_categories' id='popover_"+imgName+"'><form><div class='form_categories_inputs'>"+$("div.form_categories_inputs").parent().first().children().html()+"</div><a class='btn btn-mini btn-success dream-accept-save' id='dream-accept-save-"+imgName+"'>Save</a></form></div>");
	initPopover();
}




