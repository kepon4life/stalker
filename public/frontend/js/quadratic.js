var defaultcolor = '#000'
var canvaswidth;
var canvasheight;
var color = defaultcolor;
var indexPoints = 0;
var tab = [];
tab[1] = 0;
var stockpoints = [];
var nw;
var nh;
$(document).ready(function(){
nw = window.innerWidth;
nh = window.innerHeight;

//Pusher
            Pusher.channel_auth_endpoint = 'pusher/auth';
            var pusher = new Pusher(PUSHER_API_KEY); 
            var privateChannel = pusher.subscribe(PUSHER_CHANEL);
            var triggered;
            
            
            privateChannel.bind('pusher:subscription_error', function(status) {
                console.log("error "+status);
            });    

//Canvas
// Bind canvas to listeners 
var canvas = document.getElementById('mycanvas');
canvas.addEventListener('mousedown', mouseDown, false);
canvas.addEventListener('mousemove', mouseMove, false);
canvas.addEventListener('mouseup', mouseUp, false);
canvas.style.width = nw+'px';
canvas.style.height = nh+'px';
canvas.width = nw;
canvas.height = nh;
canvaswidth = nw;
canvasheight = nh;

var ctx = canvas.getContext('2d');

//Permet de stocker la couleur de chaque point dessiné
var clickColor = [];

$('#controls').on('click','#erase',function(){
    clear();
});

$('body').on('click','#mycanvas',function(e){
        var x;
    var y;
    if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    }
    else {
      x = e.clientX + document.body.scrollLeft +
           document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop +
           document.documentElement.scrollTop;
    }
})

initControls();
function initControls(){

    //Délimitation
    ctx.strokeStyle="#000"
    ctx.beginPath();
    ctx.moveTo(nw-200,0);
    ctx.lineWidth = 3;
    ctx.lineTo(nw-200,nh);
    ctx.stroke();

    //Bouttons
    ctx.fillStyle="#CCAABB";
    ctx.fillRect(nw-198,0,200,160)
    ctx.fillStyle="#AAFFBB";
    ctx.fillRect(nw-198,160,200,160)
}


var started = false;
var lastx = 0;
var lasty = 0;

// create an in-memory canvas
var memCanvas = document.createElement('canvas');
memCanvas.width = canvaswidth;
memCanvas.height = canvasheight;
//in-memory context
var memCtx = memCanvas.getContext('2d');
var points = [];
//permet de sauvegarder les courbes dessinées
var savedCurves = [];

function mouseDown(e) {
    var m = getMouse(e, canvas);
    if( m.x<(nw-80) && m.x>(nw-180) && m.y>20 && m.y < 60){
        console.log("ok")
    }
    points.push({
        x: m.x,
        y: m.y
    });    
    clickColor.push(color)
    started = true;
};

function mouseMove(e) { 
        if (started) {
            ctx.clearRect(0, 0, canvaswidth,canvasheight);
            // put back the saved content
            ctx.drawImage(memCanvas, 0, 0);
            initControls();
            var m = getMouse(e, canvas);
            points.push({
                x: m.x,
                y: m.y
            });
            clickColor.push(color);
            drawPoints(ctx, points);
        }
    };

function mouseUp(e) { 
    if (started) {
        started = false;
        // When the pen is done, save the resulting context
        // to the in-memory canvas
        memCtx.clearRect(0, 0, canvaswidth,canvasheight);
        memCtx.drawImage(canvas, 0, 0);
        indexPoints++;
        savedCurves.push(points)
        points = [];
        clickColor = [];
    }
};

// clear both canvases!
function clear() {
    ctx.clearRect(0, 0, canvaswidth,canvasheight);
    memCtx.clearRect(0, 0, canvaswidth,canvasheight);
    initControls();
};

tuio.start();

tuio.cursor_add(function(e){started=true;
    var x = e.x;
    var y = e.y;
    //Efface (rose)
    if( x*nw<(nw) && x*nw>(nw-200) && y*nh>0 && y*nh<160){
        console.log("click")  
    }
    //Envoie (verre)
    if( x*nw<(nw) && x*nw>(nw-200) && y*nh>160 && y*nh<320){ 
        console.log("click")
    }
})

tuio.cursor_remove(function(){

    if (started) {
        started = false;
        // When the pen is done, save the resulting context
        // to the in-memory canvas
        memCtx.clearRect(0, 0, canvaswidth,canvasheight);
        memCtx.drawImage(canvas, 0, 0);
        indexPoints++;
        savedCurves.push(points)
        points = [];
        clickColor = [];
        stockpoints = [];
    }
})
tuio.cursor_update(function(data) {

    ctx.clearRect(0, 0, canvaswidth,canvasheight);
    initControls();
    ctx.drawImage(memCanvas, 0, 0);
    for (var i = 0; i < tuio.cursors.length; i++){
        //ctx.clearRect(0, 0, canvaswidth,canvasheight);
        if(stockpoints[i] == null){
            stockpoints[i] = []
        }
            // put back the saved content
        //ctx.drawImage(memCanvas, 0, 0);
        var px = tuio.cursors[i].x;
        var py = tuio.cursors[i].y;
        
        if (px*nw < nw-200){
            points = stockpoints[i];
            points.push({
                x: px*nw,
                y: py*nh
            })
            stockpoints.splice(i, 1, points);
            clickColor.push(color)

            
        }
        drawPoints(ctx,stockpoints[i])
    }
});

function drawPoints(ctx, points) {
    ctx.beginPath(), ctx.moveTo(points[0].x, points[0].y);
    ctx.strokeStyle = color;
    // draw a bunch of quadratics, using the average of two points as the control point
    for (i = 1; i < points.length - 2; i++) {
        var c = (points[i].x + points[i + 1].x) / 2,
            d = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, c, d)
    }
    ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y), ctx.stroke();
    ctx.closePath();
}

// Creates an object with x and y defined,
// set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky,
// we have to worry about padding and borders
// takes an event and a reference to the canvas
function getMouse(e, canvas) {
  var element = canvas, offsetX = 0, offsetY = 0, mx, my;

  // Compute the total offset. It's possible to cache this if you want
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;

  // We return a simple javascript object with x and y defined
  return {x: mx, y: my};
};

privateChannel.bind('pusher:subscription_succeeded', function() {
    $('body').on('click','#send',function(){

        console.log("click")
        //Sauvegarde l'état actuel du canvas (permettra de rétablir l'état du canvas après les modifications/inversions pour l'envoi)
        var myImageData = ctx.getImageData(0,0,canvaswidth,canvasheight);

        //Background color du canvas à envoyer
        var gradient1 = ctx.createLinearGradient(0, 0, canvaswidth,canvasheight);
        gradient1.addColorStop(0,   '#f00'); // red
        gradient1.addColorStop(0.5, '#ff0'); // yellow
        gradient1.addColorStop(1,   '#00f'); // blue
        ctx.stroke();

        //Permet de remplacer la couleur des courbes dessinées
        //Efface le contenu du canvas (context) puis redessine chaque courbe avec la nouvelle couleur   
        //La nouvelle couleur
        color = "#F0A";
        //On efface le contenu du canvas (context)
        ctx.clearRect(0,0,canvaswidth,canvasheight);
        clickColor = [];

        //Pour chaque courbe sauvegardées (savedCurves[indexPoints]), on attribue la nouvelle couleur (clickcolor[]) à chacun des points de la courbe. 
        for (var j = 0; j < indexPoints; j++) {
            var curvestodraw = savedCurves[j];
            for (var i = 0; i < curvestodraw.length; i++) {
                clickColor.push(color)
            };
            drawPoints(ctx,curvestodraw)
        };

        //Permet de modifier le backgroudColor du canvas qui est transparant par défaut
        //store the current globalCompositeOperation
        var compositeOperation = ctx.globalCompositeOperation;
        //set to draw behind current content
        ctx.globalCompositeOperation = "destination-over";
        //set background color
        ctx.fillStyle = gradient1;
        //draw background / rect on entire canvas
        ctx.fillRect(0,0,canvaswidth,canvasheight);

        var imgData = ctx.getImageData(0,0,300,300);
        var pngCanvas = document.createElement('canvas');
        pngCanvas.width = 300;
        pngCanvas.height = 300;
        var pngCtx = pngCanvas.getContext('2d');
        pngCtx.putImageData(imgData,0,0);

        var img = pngCanvas.toDataURL("image/jpg");

        $.ajax({
          type: 'POST',
          url: '/frontend/save',
          data: {id : img},
            success: function(data){
                triggered = privateChannel.trigger('client-myevent', { imgUrl: data.imgUrl });
                //Efface le contenu du canvas
                ctx.clearRect(0, 0,canvaswidth,canvasheight);  
                //Rétablissement de la couleur de dessin par défaut
                color=defaultcolor
                //restore it with original / cached ImageData
                ctx.putImageData(myImageData, 0,0);        
         
                //reset the globalCompositeOperation to what it was
                ctx.globalCompositeOperation = compositeOperation;                 
            }
        });
    });
});
})