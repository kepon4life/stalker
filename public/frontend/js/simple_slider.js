
$(document).ready(function() {

  init();

  function init(){
    $("img").remove();
    $("body").append("<img id='img1' src='img1.png'style='display: none;'/>");
    var idImgToDisplay=1;
    $("img").hide();
    displayImg(idImgToDisplay);
  }

  function displayImg(idImg){
    $("#img"+idImg).fadeIn(2000,function(){
    loadingNextImg(idImg);
    });
  }

  function loadingNextImg(idImgDisplayed){
    var idNextImg = -1;
    var isLoaded = false;
    $.ajax({
      url:"treatment.php",
      data: {idImgDisplayed: idImgDisplayed},
      success: function(idNextImgToDisplay){
          $("body").append("<img id='img"+idNextImgToDisplay+"' src='img"+idNextImgToDisplay+".png' style='display: none;'/>");
          $("#img"+idNextImgToDisplay).bind("load",function(){
            idNextImg = idNextImgToDisplay;
            isLoaded = true;
          })
      },
      error: function(msg){
        console.log(msg)
      }
    }).done(setTimeout(function(){
      if(isLoaded){
        isLoaded = false;
        fadeout(idImgDisplayed,idNextImg);
      }else{
        console.log("error")
        init();
      }
    },3000))
  }

  function fadeout(idLastImg, idNextImg){
    $("#img"+idLastImg).fadeOut(2000,function(){
      console.log("remove "+idLastImg)
      $("#img"+idLastImg).remove();
      displayImg(idNextImg);
    })
  }
});