/**
 *
 *
 */
YUI.add("stalker-canvas", function(Y) {
    YUI_config.stalkerbase = YUI_config.stalkerbase || "";

    var canvas, ctx, canvaswidth, canvasheight,
            defaultcolor = '#fff',
            color = defaultcolor, //permet de sauvegarder toutes les courbes dessinées
            savedCurves = [], //Permet de connaître combien de doigts sont actuellement sur la surface
            nbdoigts = 0, //Le nombre de courbes sauvrgardées et dessinées en live. Cela signifie que dans ce tableau on ne stock que les courbes
            //que l'on est en train de dessiner, celles pour lesquelles on a encore le doigts posé sur l'écran
            stockpoints = [],
            nw, //Screen width
            nh, // Screnn Height
            controlPanelWidth = 0; // Largeur de la bande qui contient les boutons envoyer et effacer


    Y.namespace("Stalker").Canvas = Y.Base.create("stalker-canvas", Y.Widget, [], {
        CONTENT_TEMPLATE: '<div >'
                + '<canvas id="mycanvas"></canvas>'
                + '<!--<canvas id="mycanvasbis" width="600" height="600"></canvas>-->'
                + '</div>',
        renderUI: function() {
            Y.Stalker.canvas = this;

            nw = Y.DOM.winWidth() - 5;
            nh = Y.DOM.winHeight() - 5;

            //Canvas
            // Bind canvas to listeners
            // Le canvas prend la taille de l'écran
            canvas = Y.one('#mycanvas').getDOMNode();
            this.canvasNode = canvas;
            canvas.style.width = nw + 'px';
            canvas.style.height = nh + 'px';
            canvas.width = nw;
            canvas.height = nh;
            canvaswidth = nw;
            canvasheight = nh;

            ctx = canvas.getContext('2d');
            color = defaultcolor;
        },
        bindUI: function() {
            tuio.start();                                                       // Initialize Tuio

            tuio.cursor_add(Y.bind(function(e) {
                var x = e.x * nw,
                        y = e.y * nh,
                        simulateEvent = function(node) {
                    var nodeXY = node.getXY();
                    if (x > nodeXY[0] && x < nodeXY[0] + node.get("width")
                            && y > nodeXY[1] && y < nodeXY[1] + node.get("height")) {
                        node.simulate("click");
                    }
                };
                nbdoigts++;

                if (Y.one("#draw-tool").getStyle("opacity") === "1") {
                    Y.one("#draw-tool").get("children").each(simulateEvent);
                } else {
                    Y.one("#draw-tool2").get("children").each(simulateEvent);
                }
                if (!this.get("allowEdition") && nbdoigts === 1) {              // Not in edit move -> move cam
                    var e = {
                        clientX: e.x * Y.DOM.winWidth(),
                        clientY: e.y * Y.DOM.winHeight()
                    }
                    //Y.Stalker.slider.controls.setE(e);
                    Y.one("#particleCanvas").simulate("mousedown", e);
                    //moveCam(cursors);
                    return;
                }
            }, this));
            //Tuio.cursor_update == déplacement du doigts sur la surface
            tuio.cursor_update(Y.bind(function(data) {
                //Y.log("CursorUpdate()");
                this.fire("cursorUpdate");
                this.onCursorUpdate(tuio.cursors);
            }, this));

            tuio.cursor_remove(Y.bind(this.onCursorRemove, this));              // Tuio.cursor_remove == plus aucun doigts sur la surface

            /**
             * Mouse events (for dev)
             */
            Y.one("body").on("click", function() {
                this.fire("cursorUpdate");
            }, this);

            Y.one("body").on("mousemove", function(e) {                         // Allow to draw on canvas w/ mouse
                if (e.button === 1) {
                    //Y.log("CursorUpdate()");
                    this.fire("cursorUpdate");
                    if (this.get("allowEdition")) {
                        this.onCursorUpdate([{x: e.clientX / Y.DOM.winWidth(), y: e.clientY / Y.DOM.winHeight()}]);

                    }
                }
            }, this);

            Y.one("body").on("mouseup", this.onCursorRemove, this);
            Y.all("#particleCanvas").on("mouseup", this.onCursorRemove, this);

            Y.one("#envoyer").on('click', this.sendTosave, this);
            Y.one("#newpage").on('click', this.reset, this);
            Y.one("#trash").on('click', this.reset, this);
            Y.one("#undo").on('click', this.undo, this);
        },
        sendTosave: function() {

            //var imgBgColor = drawColorBg();
//            var imgBgWhite = drawWhiteBg();

            this.fire("saved");
      //      window.open(drawWhiteBg());
        //    window.open(this.canvasNode.toDataURL("image/png"));
            Y.io('/frontend/save', {
                method: "POST",
                context: this,
                data: {
                    metadatas: Y.JSON.stringify({
                        event: Y.Stalker.slider.get("event")
                    }),
                    //imgNormal: imgBgWhite
                    imgNormal: this.canvasNode.toDataURL("image/png")
                },
                on: {
                    success: function(tId, e) {
                        this.clear();
                     //   Y.Stalker.Pusher.getChannel().trigger('client-myevent', Y.JSON.parse(e.response));
                    }
                }
            });
        },
        /*
         * Manual camera position based on tuio inputs, NOT IN USE
         */
        moveCam: function(cursors) {
//            Y.log("onCursorUpdate");
            function mult(a, b) {
                a.x *= b;
                a.y *= b;
                return a;
            }
            function add(a, b) {
                a.x += b.x;
                a.y += b.y;
                return a;
            }
            function getLength(a, b) {
                return {
                    x: a.x - b.x,
                    y: a.y - b.y
                };
            }
            function sub(a, b) {
                return [a[0] - b[0], a[1] - b[1]];
            }
            function length(a) {
                return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2));
            }
            if (cursors.length > 0 && cursors[0].path.length > 1) {
                var maxScale = 0,
                        move = [0, 0];
                for (var i = 0; i < cursors.length; i++) {

                    var path1 = cursors[i].path,
                            delta = sub(path1[path1.length - 1], path1[path1.length - 2]);
                    move[0] = (move[0] + delta[0]) / 2;
                    move[1] = (move[1] + delta[1]) / 2;
                    if (cursors.length > 1) {
                        for (var j = i + 1; j < cursors.length; j++) {
                            var path2 = cursors[j].path;
                            if (path1.length > 1 && path2.length > 1) {
                                var delta1 = sub(path1[path1.length - 2], path2[path2.length - 2]),
                                        delta2 = sub(path1[path1.length - 1], path2[path2.length - 1]),
                                        scale = length(delta1) - length(delta2);

                                if (Math.abs(scale) > Math.abs(maxScale)) {
                                    maxScale = scale;
                                }
                                //maxScale = (maxScale + scale) / 2;
                            }
                        }
                    }
                }
//                    console.log("max", maxScale, Y.Stalker.slider.camera.position.z);
                if (Math.abs(maxScale * 1000) > 3) {
                    Y.Stalker.slider.camera.position.z = Math.min(Y.Stalker.slider.camera.position.z + (maxScale * 1000), 2000);
                } else {
                    Y.Stalker.slider.camera.position.x -= move[0] * 3000;
                    Y.Stalker.slider.camera.position.y += move[1] * 3000;
                }

            }
        },
        onCursorUpdate: function(cursors) {
            if (!this.get("allowEdition")) {                                    // Not in edit move -> move cam
                if (cursors.length > 0 && cursors[0].path.length > 0) {
                    var path = cursors[0].path[cursors[0].path.length - 1];
                    var e = {
                        clientX: path[0] * Y.DOM.winWidth(),
                        clientY: path[1] * Y.DOM.winHeight()
                    }
                    Y.Stalker.slider.controls.setE(e);
                    Y.one("#particleCanvas").simulate("mousemove", e);
                }
                //moveCam(cursors);
                return;
            }

            color = defaultcolor;

            //Pour chaque doigts on détecte son déplacement
            for (var i = 0; i < cursors.length; i++) {
                //Pour chaque nouveau doigt on crée un nouveau tableau dans lequel on va stocker la courbe que le doigt dessine
                stockpoints[i] = stockpoints[i] || [];

                var px = cursors[i].x;
                var py = cursors[i].y;

                //On contrôle si on se trouve à l'intérieur ou non de la surface de dessin. (Pour interdire à l'utilisateur de dessiner ailleurs)
                if (px * nw < nw - controlPanelWidth) {
                    stockpoints[i].push({
                        x: px * nw,
                        y: py * nh
                    });

                    drawLastSegment(ctx, stockpoints[i], i);
                }
            }
            this.fire("update");
        },
        onCursorRemove: function(data) {
            nbdoigts -= nbdoigts;
            if (nbdoigts == 0) {
                if (!this.get("allowEdition")) {

                    Y.one("#particleCanvas").simulate("mouseup");
                }
                for (var i = 0; i < stockpoints.length; i++) {
                    if (stockpoints[i].length > 0) {
                        savedCurves.push(stockpoints[i]);
                    }
                }

                stockpoints = [];
            }
        },
        reset: function() {
            Y.log("Canvas.reset()");
            this.clear();
            this.fire("reset");
        },
        clear: function() {
            Y.log("Canvas.clear()");
            clear();
        },
        undo: function() {
            Y.log("Canvas.undo()");
            ctx.clearRect(0, 0, canvaswidth, canvasheight);
            savedCurves.pop();
            //Redessin chacune des courbes avec la couleur (color) definie.
            for (var j = 0; j < savedCurves.length; j++) {
                var curvestodraw = savedCurves[j];
                drawPoints(ctx, curvestodraw);
            }
            this.fire("update");
        }
    }, {
        ATTRS: {
            allowEdition: {
                value: true
            }
        }
    });

    // clear both canvases!
    function clear() {
        ctx.clearRect(0, 0, canvaswidth, canvasheight);
        savedCurves = [];
        stockpoints = [];
        color = defaultcolor;
    }


    function drawLastSegment(ctx, points) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';

        var current = points.length - 1,
                currentPoint = points[current],
                previousPoint = points[current - 1] || currentPoint,
                ppreviousPoint = points[current - 2] || previousPoint,
                prevInter = {
            x: (ppreviousPoint.x + previousPoint.x) / 2,
            y: (ppreviousPoint.y + previousPoint.y) / 2
        },
        curInter = {
            x: (previousPoint.x + currentPoint.x) / 2,
            y: (previousPoint.y + currentPoint.y) / 2
        };

        ctx.beginPath();

        ctx.moveTo(prevInter.x, prevInter.y);
        ctx.quadraticCurveTo(previousPoint.x, previousPoint.y, curInter.x, curInter.y);

        //ctx.moveTo(previousPoint.x, previousPoint.y);
        //ctx.quadraticCurveTo( curInter.x, curInter.y, currentPoint.x, currentPoint.y);

        ctx.stroke();
        ctx.closePath();
    }

    //Permet de redessiner les courbes lorsqu'on applique des changement de background au canvas
    function drawPoints(ctx, points) {
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        if (points.length < 6) {
            var b = points[0];
            ctx.beginPath(), ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0), ctx.closePath(), ctx.fill();
            return;
        }
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 0; i < points.length - 1; i++) {

            var c = (points[i].x + points[i + 1].x) / 2,
                    d = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
        }

        ctx.stroke();
        ctx.closePath();
    }

    var compositeOperation;

    //Permet d'ajouter un fond coloré à l'image envoyée au server
    function drawColorBg() {
        //Background color du canvas à envoyer
        var gradient1 = ctx.createLinearGradient(0, 0, canvaswidth, canvasheight);
        gradient1.addColorStop(0, '#330936');
        gradient1.addColorStop(0.25, '#7b52ab');
        gradient1.addColorStop(0.5, '#850062');
        gradient1.addColorStop(0.75, '#9a1551');
        gradient1.addColorStop(1, '#ffef24');
        ctx.stroke();

        //Permet de remplacer la couleur des courbes dessinées
        //Efface le contenu du canvas (context) puis redessine chaque courbe avec la nouvelle couleur

        //La nouvelle couleur
        color = "#fff";
        //On efface le contenu du canvas (context)
        ctx.clearRect(0, 0, canvaswidth, canvasheight);

        //Redessin chacune des courbes avec la couleur (color) definie.
        for (var j = 0; j < savedCurves.length; j++) {
            var curvestodraw = savedCurves[j];
            drawPoints(ctx, curvestodraw);
        }

        //Permet de modifier le backgroudColor du canvas qui est transparant par défaut
        //store the current globalCompositeOperation
        compositeOperation = ctx.globalCompositeOperation;
        //set to draw behind current content
        ctx.globalCompositeOperation = "destination-over";
        //set background color
        ctx.fillStyle = gradient1;

        /*var imagebg = document.createElement('img'); // Si on utilise pas un dégradé mais une background image
         imagebg.src = "todraw.png"*/
        //ctx.drawImage(imagebg,0,0,canvaswidth,canvasheight); // Si on utilise pas une dégradé mais une image en background

        //draw background
        ctx.fillRect(0, 0, canvaswidth, canvasheight);

        //Le canvas de base ne comprend pas seulement la surface de dessin, mais aussi la partie de contrôle (effacer/enregistrer)
        //On doit créer un canvas temporaire de la taille exacte de la surface de dessin pour y "copier" la surface de dessin.
        //On fait cela pour pouvoir utiliser la méthode .toDataUrl() qui permet d'enregister le contenu de la balise canvas pour l'envoyer ensuite au backend et au slider.
        var imgData = ctx.getImageData(0, 0, nw - controlPanelWidth, nh);
        var pngCanvas = document.createElement('canvas');
        pngCanvas.width = nw - controlPanelWidth;
        pngCanvas.height = nh;
        var pngCtx = pngCanvas.getContext('2d');
        pngCtx.putImageData(imgData, 0, 0);
        var imgBgColor = pngCanvas.toDataURL("image/png");
        pngCtx.clearRect(0, 0, canvaswidth, canvasheight);

        ctx.globalCompositeOperation = "source-over";
        return imgBgColor;
    }

    //Permet d'ajouter un fond blanc à l'image envoyée au server
    function drawWhiteBg() {
        color = "#fff";
        ctx.clearRect(0, 0, canvaswidth, canvasheight);
        for (var j = 0; j < savedCurves.length; j++) {
            var curvestodraw = savedCurves[j];
            drawPoints(ctx, curvestodraw);
        }

        compositeOperation = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "000";
        ctx.fillRect(0, 0, canvaswidth, canvasheight);

        var imgData = ctx.getImageData(0, 0, nw - controlPanelWidth, nh);
        var pngCanvas = document.createElement('canvas');
        pngCanvas.width = nw - controlPanelWidth;
        pngCanvas.height = nh;
        var pngCtx = pngCanvas.getContext('2d');
        pngCtx.putImageData(imgData, 0, 0);

        var imgBgWhite = pngCanvas.toDataURL("image/png");
        pngCtx.clearRect(0, 0, canvaswidth, canvasheight);

        ctx.globalCompositeOperation = "source-over";
        return imgBgWhite;
    }

//    function drawSeg(ctx, points, index) {
//        ctx.lineWidth = 20;
//        ctx.lineCap = 'round';
//        ctx.strokeStyle = color;
//
//        ctx.beginPath();
//
//        // First
//        var previous = index - 1,
//                pprevious = previous - 1,
//                prevInter = {
//            x: (points[pprevious].x + points[previous].x) / 2,
//            y: (points[pprevious].y + points[previous].y) / 2
//        },
//        curInter = {
//            x: (points[previous].x + points[index].x) / 2,
//            y: (points[previous].y + points[index].y) / 2
//        };
//        ctx.moveTo(prevInter.x, prevInter.y);
//        ctx.quadraticCurveTo(points[previous].x, points[previous].y, curInter.x, curInter.y);
//
//        //Second
//        if (points.length < 6) {
//            var b = points[0];
//            ctx.beginPath();
//            ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
//            ctx.closePath();
//            ctx.fill();
//            return;
//        }
//
//        ctx.moveTo(points[0].x, points[0].y);
//        for (i = 1; i < points.length - 2; i++) {
//
//            var c = (points[i].x + points[i + 1].x) / 2,
//                    d = (points[i].y + points[i + 1].y) / 2;
//            ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
//        }
//
//        // finally
//        ctx.stroke();
//        ctx.closePath();
//    }
});

