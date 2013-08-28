// objet (id, val)
//id = timestamp img
//val = decision (0:notAttributed, 1:Nok, 2:ok, 3:okPlus)
var images = new Object();


$(document).ready(function () {


	//on initialise les 2 boutons permettant de modifier le nb de dessins affichés
	if($("div#tag_dreams").hasClass("bit")){
			$("a.bit").addClass("active");
	}else{
			$("a.lot").addClass("active");
	}

	$("a.lot").click(function(){
			$.cookie("nbImgPerPage", 24);
			window.location = window.location.href.split("?")[0];
			location.location.reload();
	});


	$("a.bit").click(function(){
			$.cookie("nbImgPerPage", 12);
			window.location = window.location.href.split("?")[0];
			location.location.reload();
	});


	//on initialise le tableau avec les images 
	$("div#tag_dreams div.dream").each(function(){
		images[$(this).attr("id").split("dream_")[1]] = 0;
	});


	//toutes les images OK
	$("li#toggleAllOk").click(function(){
		$("div#tag_dreams div.dream").each(function(){
			imgIsOk($(this));
		});
		if($("button#send").hasClass("disabled")){
			$("button#send").removeClass("disabled");
		}
	});

	//toutes les images OK + in secret room
	$("li#toggleAllOkPlus").click(function(){
		$("div#tag_dreams div.dream").each(function(){
			imgIsOkPlus($(this));
		});
		if($("button#send").hasClass("disabled")){
			$("button#send").removeClass("disabled");
		}
	});

	//toutes les images pas ok
	$("li#toggleAllNok").click(function(){
		$("div#tag_dreams div.dream").each(function(){
			imgIsNok($(this));
		});
		if($("button#send").hasClass("disabled")){
			$("button#send").removeClass("disabled");
		}

	});

	//toutes les images déselectionnées
	$("li#toggleAllUnselected").click(function(){
		$("div#tag_dreams div.dream").each(function(){
			imgIsUnatributed($(this));
		});
		$("button#send").addClass("disabled");
	});



	$(document).on("dblclick", ".not_a_link", function(){
    	window.open(this.id, 'nom_interne_de_la_fenetre', config='height=700, width=700, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, directories=no, status=no');
	});


	//lorsque l'on clique sur une image, son état change
	$(document).on("click", "div.dream", function(){
		if($(this).children("div.decision").hasClass("ok")){
			imgIsOkPlus($(this));
			toggleSendButton();
		} else if($(this).children("div.decision").hasClass("nok")){
			imgIsOk($(this));
			toggleSendButton();
		} else if($(this).children("div.decision").hasClass("okPlus")){
			imgIsUnatributed($(this));
			toggleSendButton();
		} else{
			imgIsNok($(this));
			toggleSendButton();
		}
	});


	$("button#send").click(function(){
		if(!$("button#send").hasClass("disabled")){
			$.ajax({
		  		type: "GET",
		  		url: "/dreams/tagDream",
		  		data: { images: images}
			}).done(function( msg ) {
		 		location.reload();
			});
		}
		


	});







});



//Recept pusher notifications
var pusher = new Pusher(PUSHER_API_KEY);
var channel = pusher.subscribe(PUSHER_CHANEL_DREAM_CREATED);
//Pusher.channel_auth_endpoint = '/pusher/auth';
channel.bind(PUSHER_EVENT_DREAM_CREATED, function(data) {
	informUserNewImgForReloadingPage();
});

//active or unactive the send button
function toggleSendButton(){
	var imagesAreDeselected = true;
	for (var key in images){
		if(images[key] != 0){
			imagesAreDeselected = false;
		}
	}
	if($("button#send").hasClass("disabled")){
		if(!imagesAreDeselected){
			$("button#send").removeClass("disabled");
		}
	}else{
		if(imagesAreDeselected){
			$("button#send").addClass("disabled");
		}
	}
}


//Changement de l'état de l'image à ok
function imgIsOk(e){
	var id = e.attr("id").split("dream_")[1];
	e.children("div.decision").removeClass().addClass("decision ok");
	images[id] = 2;

}

//Changement de l'état de l'image à pas ok
function imgIsNok(e){
	var id = e.attr("id").split("dream_")[1];
	e.children("div.decision").removeClass().addClass("decision nok");
	images[id] = 1;
}

//Changement de l'état de l'image à ok + secret room
function imgIsOkPlus(e){
	var id = e.attr("id").split("dream_")[1];
	e.children("div.decision").removeClass().addClass("decision okPlus");
	images[id] = 3;
}

//changement de l'état de l'image à déselectionnée
function imgIsUnatributed(e){
	var id = e.attr("id").split("dream_")[1];
	e.children("div.decision").removeClass().addClass("decision");
	images[id] = 0;
}


//add message to the moderator when a new img is created
function informUserNewImgForReloadingPage(){
	if($("#messages").is(':empty')){
		$("#messages").append("<div class='alert fade in'><button type='button' class='close' data-dismiss='alert'>×</button>Hey! there is <strong id='nb_dream'>1</strong> new dream(s)! <a href=''>Reload the page...</a></div>");
	}else{
		nb_dreams = $("#messages #nb_dream").text();
		$("#messages #nb_dream").text(parseInt(nb_dreams) + 1);
	}
}

