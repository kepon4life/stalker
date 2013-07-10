var FADINTIME = 2000;
var FADEOUTTIME = 2000;
var PICTURETIME = 3000;
$(document).ready(function() {

  init();

  function init(){
    $("img").remove();
    loadingFirstImg();
  }

  function loadingFirstImg(){
    var idImg = -1;
    var isLoaded = false;
    $.ajax({
      url:"/services/dreamforsimpleslider",
      data: {id: 0},
      success: function(idNextImgToDisplay){
          idImg = idNextImgToDisplay.id;
          $("body").append("<img id='"+idNextImgToDisplay.id+"' src='/dreams/"+idNextImgToDisplay.id+".png' style='display: none;'/>");
      },
      error: function(msg){
        console.log(msg)
      }
    }).done(function(){
      var src = "/dreams/"+idImg+".png";
      waitingForLoading(src,function(){
        $("#"+idImg).fadeIn(FADINTIME,function(){
          setTimeout(function(){
            loadingNextImg(idImg)
          },PICTURETIME)
        })
      })
    }
    )
  }

  function waitingForLoading(src, callback){
      var firstImg = new Image();
      firstImg.onload = callback;
      firstImg.src = src;
  }

  function loadingNextImg(idImgDisplayed){
    var idNextImg = -1;
    $.ajax({
      url:"/services/dreamforsimpleslider",
      data: {id: idImgDisplayed},
      success: function(idNextImgToDisplay){
          $("body").append("<img id='"+idNextImgToDisplay.id+"' src='/dreams/"+idNextImgToDisplay.id+".png' style='display: none;'/>");
          $("#"+idNextImgToDisplay.id).bind("load",function(){
            idNextImg = idNextImgToDisplay.id; // Allow as well to know if the picture is loaded
          })
      },
      error: function(msg){
        console.log(msg)
      }
    }).done(setTimeout(function(){
      fadeout(idImgDisplayed,idNextImg);
    },PICTURETIME))
  }

  function fadeout(idLastImg, idImgToDisplay){
    $("#"+idLastImg).fadeOut(FADEOUTTIME,function(){
      $("#"+idLastImg).remove();
      if(idImgToDisplay<0){ // An idImgToDisplay negative means that the next image is not loaded
        init();
      }else{
        $("#"+idImgToDisplay).fadeIn(FADINTIME,function(){
        loadingNextImg(idImgToDisplay);
        });
      }
    })
  }
});