$(document).ready(function () {
	//on charge les categories
	getCategoriesCheckboxes();

	//Buble with dreams number initialization
	$.ajax({
	    dataType: 'jsonp',
	    type: "GET",
		url: "/services/nbdreams",
	    success: function(response) {
	    	incrementNbDreams(parseInt(response.nbImg));
	    }
	});

        // Set up logger
        Pusher.log = function(msg) {
            console.log(msg);
        }

	






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
	          	title: "<input type='checkbox' name='in_secret_room' id='in_secret_room' /> In secret room",
	          	trigger: "manual",
	          	content: $("#popover_" + id).html()
	        }
	    )
	});
}
/*
function addImgToTagg(imgUrl){
	var imgName = imgUrl.replace(DREAM_EXTENSION ,"");
	if($("div#tag_dreams img.dream").length == 0){
		$("div#tag_dreams").empty();
	}
	$("div#tag_dreams").append("<div class='dream' id='dream_"+imgName+"'><img class='dream' src='/dreams/untreated/"+imgUrl+"' alt='"+imgName+"' /><div class='btn-toolbar'><div class='btn-group'><a href='#myModal_"+imgName+"' data-toggle='modal' class='btn'><i class='icon-search'></i></a><a class='btn dream-accept' rel='popover' href='#' data-original-title=''><i class='icon-ok'></i></a><a class='btn dream-refuse' href='#''><i class='icon-remove'></i></a></div></div><div id='myModal_"+imgName+"' class='modal hide fade' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'><img src='/dreams/untreated/"+imgUrl+"' alt='"+imgName+"'></div></div><div class='form_categories' id='popover_"+imgName+"'><form><div class='form_categories_inputs'>"+$("div#cat_for_add").html()+"</div><a class='btn btn-mini btn-success dream-accept-save' id='dream-accept-save-"+imgName+"'>Save</a></form></div>");

	initPopover();
}
*/
function getCategoriesCheckboxes(){
	$.getJSON("/services/categories", function(data) {
		var c = "";
   		$.each(data, function(id,name){
      		c = c + "<input type='checkbox' value='"+id+"' name='category_ids[]'> "+name+"<br>";
    	});
   		$("#content").append("<div id='cat_for_add' style='display:none;'>" + c + "<br></div>");
 	});
}




