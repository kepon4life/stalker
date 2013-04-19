var defaultcolor = '#fff'
var canvaswidth;
var canvasheight;
var color = defaultcolor;
//permet de sauvegarder toutes les courbes dessinées
var savedCurves = [];
//Permet de connaître combien de doigts sont actuellement sur la surface
var nbdoigts = 0; 
//Le nombre de courbes sauvrgardées et dessinées en live. Cela signifie que dans ce tableau on ne stock que les courbes
//que l'on est en train de dessiner, celles pour lesquelles on a encore le doigts posé sur l'écran
var stockpoints = [];
var nw; //Screen width
var nh; // Screnn Height
/*var imagebg = document.createElement('img'); // Si on utilise pas un dégradé mais une background image 
imagebg.src = "todraw.png"*/
var envoyerimg = document.getElementById('envoyer');
var effacerimg = document.getElementById('effacer');

var controlPanelWidth = 200; // Largeur de la bande qui contient les boutons envoyer et effacer

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
    // Le canvas prend la taille de l'écran
    var canvas = document.getElementById('mycanvas');
    canvas.style.width = nw+'px';
    canvas.style.height = nh+'px';
    canvas.width = nw;
    canvas.height = nh;
    canvaswidth = nw;
    canvasheight = nh;

    var ctx = canvas.getContext('2d');

    initControls();

    envoyerimg.onload = function(){
        ctx.drawImage(envoyerimg,nw-190,210);
    }
    effacerimg.onload = function(){
        ctx.drawImage(effacerimg,nw-182,40);
    }

    function initControls(){

        color = defaultcolor;

        //Délimitation
        ctx.strokeStyle="#fff"
        ctx.beginPath();
        ctx.moveTo(nw-controlPanelWidth,0);
        ctx.lineWidth = 3;
        ctx.lineTo(nw-controlPanelWidth,nh);
        ctx.stroke();

        //Bouttons rose et vert. Certainement à supprimer pour la mise en prod.
        ctx.fillStyle="#CCAABB";
        ctx.fillRect(nw-198,0,200,160)
        ctx.fillStyle="#AAFFBB";
        ctx.fillRect(nw-198,160,200,160)
        ctx.drawImage(envoyerimg,nw-190,210);
        ctx.drawImage(effacerimg,nw-182,40);
    }

    // clear both canvases!
    function clear() {
        ctx.clearRect(0, 0, canvaswidth,canvasheight);
        savedCurves = [];
        initControls();
    };

    tuio.start();

    //Tuio.cursor_remove == plus aucun doigts sur la surface
    tuio.cursor_remove(function(data){
        nbdoigts -= nbdoigts;
        if (nbdoigts == 0) {

            for (var i = 0; i < stockpoints.length; i++) {
                if(stockpoints[i].length > 0){
                    savedCurves.push(stockpoints[i])
                }
            };
            stockpoints = [];
        }
    })
    //Tuio.cursor_update == déplacement du doigts sur la surface
    tuio.cursor_update(function(data) {
        initControls();
        
        //Pour chaque doigts on détecte son déplacement
        for (var i = 0; i < tuio.cursors.length; i++){
            //Pour chaque nouveau doigt on crée un nouveau tableau dans lequel on va stocker la courbe que le doigt dessine
            if(stockpoints[i] == null){
                stockpoints[i] = []
            }

            var px = tuio.cursors[i].x;
            var py = tuio.cursors[i].y;
            
            //On contrôle si on se trouve à l'intérieur ou non de la surface de dessin. (Pour interdire à l'utilisateur de dessiner ailleurs)
            if (px*nw < nw-controlPanelWidth){
                
                stockpoints[i].push({
                    x: px*nw,
                    y: py*nh
                });
                
            }

            if (stockpoints[i].length > 3) {
                    drawLastSegment(ctx,stockpoints[i], i);
                }
        }
    });

    function drawLastSegment(ctx, points) {
        ctx.strokeStyle = color;

        var current = points.length - 1;
        var previous = current - 1;
        var pprevious = previous - 1;


        var prevInter = {
            x: (points[pprevious].x + points[previous].x) / 2,
            y: (points[pprevious].y + points[previous].y) / 2
        }

        var curInter = {
            x: (points[previous].x + points[current].x) / 2,
            y: (points[previous].y + points[current].y) / 2
        }

        ctx.lineWidth = 7;
        ctx.lineCap = 'round';

        ctx.beginPath(); 

        ctx.moveTo(prevInter.x, prevInter.y);
        ctx.quadraticCurveTo(points[previous].x, points[previous].y, curInter.x, curInter.y);
        ctx.stroke();
        ctx.closePath();
    };

    //Permet de redessiner les courbes lorsqu'on applique des changement de background au canvas
    function drawPoints(ctx, points) {
        ctx.strokeStyle = color;
        if (points.length < 6) {
            var b = points[0];
            ctx.beginPath(), ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0), ctx.closePath(), ctx.fill();
            return
        }
        ctx.beginPath(); 
        ctx.moveTo(points[0].x, points[0].y);
        for (i = 1; i < points.length - 2; i++) {
        
            var c = (points[i].x + points[i + 1].x) / 2,
                d = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, c, d)
        }

        ctx.stroke();
        ctx.closePath();
    }

    privateChannel.bind('pusher:subscription_succeeded', function() {
        $('body').on('click','#send',function(){
            sendTosave();
        });
    tuio.cursor_add(function(e){         
        var x = e.x;
        var y = e.y;
        nbdoigts++;

        //Efface (bouton rose) --> Zone à redéfinir pour la mise en prod 
        if( x*nw<(nw) && x*nw>(nw-200) && y*nh>0 && y*nh<160){
            clear();  
        }
        //Envoie (bouton verre) --> Zone à redéfinir pour la mise en prod
        if( x*nw<(nw) && x*nw>(nw-200) && y*nh>160 && y*nh<320){
            console.log('sended!') 
            sendTosave();

        }
    })
    });

    var imgBgColor;
    var imgBgWhite;
    var compositeOperation;

    function sendTosave(){
        
        drawColorBg();
        drawWhiteBg();

        $.ajax({
          type: 'POST',
          url: '/frontend/save',
          data: {imgColor : imgBgColor, imgNormal : imgBgWhite},
          success: function(data){
            triggered = privateChannel.trigger('client-myevent', data); 
                clear();
            }
        });
        
    }

    //Permet d'ajouter un fond coloré à l'image envoyée au server
    function drawColorBg(){
        //Background color du canvas à envoyer
        var gradient1 = ctx.createLinearGradient(0, 0, canvaswidth,canvasheight);
        gradient1.addColorStop(0,'#330936');
        gradient1.addColorStop(0.25,'#7b52ab');
        gradient1.addColorStop(0.5,'#850062');
        gradient1.addColorStop(0.75,'#9a1551');
        gradient1.addColorStop(1,'#ffef24'); 
        ctx.stroke();

        //Permet de remplacer la couleur des courbes dessinées
        //Efface le contenu du canvas (context) puis redessine chaque courbe avec la nouvelle couleur   
        
        //La nouvelle couleur
        color = "#fff";
        //On efface le contenu du canvas (context)
        ctx.clearRect(0,0,canvaswidth,canvasheight);
        
        //Redessin chacune des courbes avec la couleur (color) definie.
        for (var j = 0; j < savedCurves.length; j++) {
            var curvestodraw = savedCurves[j];
            drawPoints(ctx,curvestodraw)
            
        };

        //Permet de modifier le backgroudColor du canvas qui est transparant par défaut
        //store the current globalCompositeOperation
        compositeOperation = ctx.globalCompositeOperation;
        //set to draw behind current content
        ctx.globalCompositeOperation = "destination-over";
        //set background color
        ctx.fillStyle = gradient1;
        //ctx.drawImage(imagebg,0,0,canvaswidth,canvasheight); // Si on utilise pas une dégradé mais une image en background

        //draw background
        ctx.fillRect(0,0,canvaswidth,canvasheight);

        //Le canvas de base ne comprend pas seulement la surface de dessin, mais aussi la partie de contrôle (effacer/enregistrer)
        //On doit créer un canvas temporaire de la taille exacte de la surface de dessin pour y "copier" la surface de dessin.
        //On fait cela pour pouvoir utiliser la méthode .toDataUrl() qui permet d'enregister le contenu de la balise canvas pour l'envoyer ensuite au backend et au slider.
        var imgData = ctx.getImageData(0,0,nw-controlPanelWidth,nh);
        var pngCanvas = document.createElement('canvas');
        pngCanvas.width = nw-controlPanelWidth;
        pngCanvas.height = nh;
        var pngCtx = pngCanvas.getContext('2d');
        pngCtx.putImageData(imgData,0,0);
        imgBgColor = pngCanvas.toDataURL("image/png");
        pngCtx.clearRect(0, 0, canvaswidth,canvasheight);

        ctx.globalCompositeOperation = "source-over";
    }

        //Permet d'ajouter un fond blanc à l'image envoyée au server
        function drawWhiteBg(){
        color = "#fff";
        ctx.clearRect(0,0,canvaswidth,canvasheight);
        for (var j = 0; j < savedCurves.length; j++) {
            var curvestodraw = savedCurves[j];
            drawPoints(ctx,curvestodraw)
        };
        compositeOperation = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "000";
        ctx.fillRect(0,0,canvaswidth,canvasheight);

        var imgData = ctx.getImageData(0,0,nw-controlPanelWidth,nh);
        var pngCanvas = document.createElement('canvas');
        pngCanvas.width = nw-controlPanelWidth;
        pngCanvas.height = nh;
        var pngCtx = pngCanvas.getContext('2d');
        pngCtx.putImageData(imgData,0,0);

        imgBgWhite = pngCanvas.toDataURL("image/png");
        pngCtx.clearRect(0, 0, canvaswidth,canvasheight);

        ctx.globalCompositeOperation = "source-over";
    }

})