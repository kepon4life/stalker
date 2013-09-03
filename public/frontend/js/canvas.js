/**
 *
 *
 */
YUI.add("stalker-canvas", function(Y) {

    YUI_config.stalkerbase = YUI_config.stalkerbase || "";

    var canvas, ctx, canvaswidth, canvasheight,
            defaultcolor = '#fff',
            color = defaultcolor, //permet de sauvegarder toutes les courbes dessinÃ©es
            savedCurves = [], //Permet de connaÃ®tre combien de doigts sont actuellement sur la surface
            nbdoigts = 0, //Le nombre de courbes sauvrgardÃ©es et dessinÃ©es en live. Cela signifie que dans ce tableau on ne stock que les courbes
            //que l'on est en train de dessiner, celles pour lesquelles on a encore le doigts posÃ© sur l'Ã©cran
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
            // Le canvas prend la taille de l'Ã©cran
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
            this.clear();
        },
        bindUI: function() {
            tuio.start();                                                       // Initialize Tuio
            var inputPrevented = false;
            tuio.cursor_add(Y.bind(function(e) {
                inputPrevented = false;
                var x = e.x * nw,
                        y = e.y * nh,
                        simulateEvent = function(node) {
                    var xy = node.getXY();
                    if (x > xy[0] && x < xy[0] + node.get("width")
                            && y > xy[1] && y < xy[1] + node.get("height")) {
                        node.simulate("click");
                        inputPrevented = true;
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
            //Tuio.cursor_update == dÃ©placement du doigts sur la surface
            tuio.cursor_update(Y.bind(function(data) {
                //Y.log("CursorUpdate()");
                this.fire("cursorUpdate");
                if (!inputPrevented) {
                    this.onCursorUpdate(tuio.cursors);
                }
            }, this));

            tuio.cursor_remove(Y.bind(function() {
                nbdoigts -= 1;
                if (!inputPrevented && nbdoigts === 0) {
                    //Y.log("Canva.on")
                    if (!this.get("allowEdition")) {
                        Y.one("#particleCanvas").simulate("mouseup");
                    }
                    this.onCursorRemove();
                }
            }, this));                                                           // Tuio.cursor_remove == plus aucun doigts sur la surface

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

            Y.one("#envoyer").after('click', this.sendTosave, this);
            Y.one("#newpage").on('click', function() {
                this.reset();
                this.fire("newDream");
            }, this);
            Y.one("#trash").on('click', this.reset, this);
            Y.one("#undo").on('click', this.undo, this);
        },
        sendTosave: function() {
            //var imgBgColor = drawColorBg();
            //var imgBgWhite = drawWhiteBg();
            //window.open(this.canvasNode.toDataURL("image/png"));

            Y.io('/frontend/save', {
                method: "POST",
                data: {
                        event_id : 0,//getURLParameter("event"),
                        imgNormal: this.canvasNode.toDataURL("image/png")
                }
            });
            this.fire("saved");
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
            Y.log("Canvas.onCursorRemove()");
            var tmp = [];
            for (var i = 0; i < stockpoints.length; i++) {
                if (stockpoints[i].length > 0) {
                    tmp.push(stockpoints[i]);
                }
            }
            savedCurves.push(tmp);
            stockpoints = [];
        },
        reset: function() {
            Y.log("Canvas.reset()");
            savedCurves = [];
            stockpoints = [];
            this.clear();
            this.fire("reset");
        },
        clear: function() {
            Y.log("Canvas.clear()");

            ctx.clearRect(0, 0, canvaswidth, canvasheight);

            //compositeOperation = ctx.globalCompositeOperation;
            //ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "000";
            ctx.fillRect(0, 0, canvaswidth, canvasheight);

            color = defaultcolor;
        },
        undo: function() {
            Y.log("Canvas.undo(#savecTouches: " + savedCurves.length + ", #current touch points: " + savedCurves[savedCurves.length - 1].length);

            savedCurves.pop();
            this.redraw();
            this.fire("update");
        },
        redraw: function() {
            this.clear();
            //Redessin chacune des courbes avec la couleur (color) definie.
            for (var j = 0; j < savedCurves.length; j++) {
                for (var k = 0; k < savedCurves[j].length; k += 1) {
                    drawPoints(ctx, savedCurves[j][k]);
                }
            }
        },
        /*
         * Manual camera position based on tuio inputs, NOT IN USE
         */
        moveCam: function(cursors) {
            //Y.log("Canvas.moveCam()");
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
                //console.log("max", maxScale, Y.Stalker.slider.camera.position.z);
                if (Math.abs(maxScale * 1000) > 3) {
                    Y.Stalker.slider.camera.position.z = Math.min(Y.Stalker.slider.camera.position.z + (maxScale * 1000), 2000);
                } else {
                    Y.Stalker.slider.camera.position.x -= move[0] * 3000;
                    Y.Stalker.slider.camera.position.y += move[1] * 3000;
                }

            }
        }
    }, {
        ATTRS: {
            allowEdition: {
                value: true
            }
        }
    });

    function drawLastSegment(ctx, points) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        //Y.log("draw last");
        var current = points.length - 1,
                currentPoint = points[current];

        ctx.beginPath();

        switch (points.length) {
            case 0:
                break;
            case 1:
            case 2:
                ctx.moveTo(currentPoint.x, currentPoint.y);
                ctx.lineTo(currentPoint.x + 0.01, currentPoint.y);
                break;
            default:
                var previousPoint = points[current - 1],
                        ppreviousPoint = points[current - 2],
                        prevInter = {
                    x: (ppreviousPoint.x + previousPoint.x) / 2,
                    y: (ppreviousPoint.y + previousPoint.y) / 2
                },
                curInter = {
                    x: (previousPoint.x + currentPoint.x) / 2,
                    y: (previousPoint.y + currentPoint.y) / 2
                };

                ctx.moveTo(prevInter.x, prevInter.y);
                ctx.quadraticCurveTo(previousPoint.x, previousPoint.y, curInter.x, curInter.y);
                //        ctx.moveTo(previousPoint.x, previousPoint.y);
                //        ctx.lineTo(currentPoint.x, currentPoint.y);
                //        ctx.quadraticCurveTo( curInter.x, curInter.y, currentPoint.x, currentPoint.y);
        }



        ctx.stroke();
        ctx.closePath();
    }

    //Permet de redessiner les courbes lorsqu'on applique des changement de background au canvas

    var drawSmoothLine = function(surf, ctrl_points) {
        var l = ctrl_points.length;
        switch (l) {
            case 0:
            case 1: //no control points
                break;
            case 2: //line
                surf.beginPath();
                surf.moveTo(ctrl_points[0].x, ctrl_points[0].y);
                surf.lineTo(ctrl_points[1].x, ctrl_points[1].y);
                surf.stroke();
                break;
            case 3: //lets use the second point as the two middle control points
                surf.beginPath();
                surf.moveTo(ctrl_points[0].x, ctrl_points[0].y);
                surf.bezierCurveTo(ctrl_points[1].x, ctrl_points[1].y, ctrl_points[1].x, ctrl_points[1].y, ctrl_points[2].x, ctrl_points[2].y);
                surf.stroke();
                break;
            default: //lets draw a bezier with the first 4 points, and for the rest lets create a control point to keep the line smooth
                surf.beginPath();
                surf.moveTo(ctrl_points[0].x, ctrl_points[0].y);
                var pnt_a = ctrl_points[1], pnt_b = ctrl_points[2], pnt_end = ctrl_points[3];
                surf.bezierCurveTo(pnt_a.x, pnt_a.y, pnt_b.x, pnt_b.y, pnt_end.x, pnt_end.y);
                ctrl_points = ctrl_points.slice(0);
                l = ctrl_points.length;
                pnt_b = ctrl_points[2];
                var i = 5
                for (; i < l; i += 2) {
                    pnt_a = {x: pnt_end.x + (pnt_end.x - pnt_b.x), y: pnt_end.y + (pnt_end.y - pnt_b.y)};
                    pnt_b = ctrl_points[i - 1];
                    pnt_end = ctrl_points[i];
                    surf.bezierCurveTo(pnt_a.x, pnt_a.y, pnt_b.x, pnt_b.y, pnt_end.x, pnt_end.y);
                }
                if (i == l) { //a last lonely point, lets use the calculated pnt_a as pnt_b
                    pnt_a = {x: pnt_end.x + (pnt_end.x - pnt_b.x), y: pnt_end.y + (pnt_end.y - pnt_b.y)};
                    pnt_b = pnt_a;
                    pnt_end = ctrl_points[l - 1];
                    surf.bezierCurveTo(pnt_a.x, pnt_a.y, pnt_b.x, pnt_b.y, pnt_end.x, pnt_end.y);
                }
                surf.stroke();
                break;
        }
    };

    function drawPoints(ctx, points) {
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        switch (points.length) {
            case 0:                                                             //no control points
                Y.log("no control points")
                break;
            case 1:
//                var b = points[0];
                Y.log("Smallpoint");
                ctx.beginPath();

                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[0].x + 0.01, points[0].y);
                ctx.stroke();
                ctx.closePath();
//                ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
//                ctx.closePath(); ctx.fill();
                break;
            case 2: //line
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[1].x, points[1].y);
                ctx.stroke();
                ctx.closePath();
                break;
            case 3: //lets use the second point as the two middle control points
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.quadraticCurveTo(points[1].x, points[1].y, points[1].x, points[1].y, points[2].x, points[2].y);
                ctx.stroke();
                ctx.closePath();

                break;
            default: //lets draw a bezier with the first 4 points, and for the rest lets create a control point to keep the line smooth
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (var i = 0; i < points.length -1; i++) {
                    var c = (points[i].x + points[i + 1].x) / 2,
                            d = (points[i].y + points[i + 1].y) / 2;
                    ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
                }
                ctx.stroke();
                ctx.closePath();
        }

//        if (points.length < 6) {
//            var b = points[0];
//            Y.log("Smallpoint");
//            ctx.beginPath(), ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0), ctx.closePath(), ctx.fill();
//            return;
//        }

    }

    var compositeOperation;

    //Permet d'ajouter un fond colorÃ© Ã  l'image envoyÃ©e au server
    function drawColorBg() {
        //Background color du canvas Ã  envoyer
        var gradient1 = ctx.createLinearGradient(0, 0, canvaswidth, canvasheight);
        gradient1.addColorStop(0, '#330936');
        gradient1.addColorStop(0.25, '#7b52ab');
        gradient1.addColorStop(0.5, '#850062');
        gradient1.addColorStop(0.75, '#9a1551');
        gradient1.addColorStop(1, '#ffef24');
        ctx.stroke();

        //Permet de remplacer la couleur des courbes dessinÃ©es
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

        //Permet de modifier le backgroudColor du canvas qui est transparant par dÃ©faut
        //store the current globalCompositeOperation
        compositeOperation = ctx.globalCompositeOperation;
        //set to draw behind current content
        ctx.globalCompositeOperation = "destination-over";
        //set background color
        ctx.fillStyle = gradient1;

        /*var imagebg = document.createElement('img'); // Si on utilise pas un dÃ©gradÃ© mais une background image
         imagebg.src = "todraw.png"*/
        //ctx.drawImage(imagebg,0,0,canvaswidth,canvasheight); // Si on utilise pas une dÃ©gradÃ© mais une image en background

        //draw background
        ctx.fillRect(0, 0, canvaswidth, canvasheight);

        //Le canvas de base ne comprend pas seulement la surface de dessin, mais aussi la partie de contrÃ´le (effacer/enregistrer)
        //On doit crÃ©er un canvas temporaire de la taille exacte de la surface de dessin pour y "copier" la surface de dessin.
        //On fait cela pour pouvoir utiliser la mÃ©thode .toDataUrl() qui permet d'enregister le contenu de la balise canvas pour l'envoyer ensuite au backend et au slider.
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

    //Permet d'ajouter un fond blanc Ã  l'image envoyÃ©e au server
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
