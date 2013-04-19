	var color = '#fff'
	$(document).ready(function(){
	//Pusher
	Pusher.channel_auth_endpoint = 'pusher/auth/private_auth.php';
            var pusher = new Pusher('2608f7fc5798192ced83'); // Replace with your app key
            var privateChannel = pusher.subscribe('private-mychannel');
            var triggered;
            
            privateChannel.bind('pusher:subscription_succeeded', function() {
            	console.log("ok"+status);
            	$('body').on('click','#send',function(){
            		triggered = privateChannel.trigger('client-myevent', { your: 'datas' });
            	});
            });
            privateChannel.bind('pusher:subscription_error', function(status) {
            	console.log("pas ok"+status);
            });
    //Canvas
    $('#controls').on('click','#draw',function(){
    	color = '#fff';
    	paint = false;
    });
    $('#controls').on('click','#erase',function(){
    	color = '#000';
    	paint = false;
    });


    var canvas = document.getElementById("mycanvas");
    var context = canvas.getContext("2d");

    $('#controls').on('click','#send',function(){
    	var img    = canvas.toDataURL("image/png");
    	console.log(img);
    });

    $('#mycanvas').mousedown(function(e){		
    	paint = true;
    	addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    	redraw();
    });

    $('#mycanvas').mousemove(function(e){
    	if(paint){
    		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    		redraw();
    	}
    });

    $('#mycanvas').mouseup(function(e){
    	paint = false;
    });

    $('#mycanvas').mouseleave(function(e){
    	paint = false;
    });

    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var clickColor = new Array();
    var paint;

    function addClick(x, y, dragging)
    {
    	clickX.push(x);
    	clickY.push(y);
    	clickDrag.push(dragging);
    	clickColor.push(color)
    }

    function redraw(){
	  canvas.width = canvas.width; // Clears the canvas
	  
	  
	  context.lineJoin = "round";
	  context.lineWidth = 5;

	  for(var i=0; i < clickX.length; i++)
	  {		
	  	context.beginPath();
	  	if(clickDrag[i] && i){
	  		context.moveTo(clickX[i-1], clickY[i-1]);
	  	}else{
	  		context.moveTo(clickX[i]-1, clickY[i]);
	  	}
	  	context.lineTo(clickX[i], clickY[i]);
	  	context.closePath();
	  	context.strokeStyle = clickColor[i];
	  	context.stroke();

	  }
	}
});