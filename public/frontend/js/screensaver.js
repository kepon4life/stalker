/**
 *
 *
 */
YUI.add("stalker-screensaver", function(Y) {

    var ScreenSaver = Y.Base.create("stalker-screensaver", Y.Widget, [], {
        CONTENT_TEMPLATE: "<div><div></div></div>",
        initializer: function() {

            this.cDreamIndex = 2;

            var cb = this.get("contentBox");                                    // Retrieve current widget node, the one we animate
            //cb.getDOMNode()
            this.anim = new Y.Anim({
                node: this.get("contentBox"),
                duration: 0.1
                        //easing: Y.Easing.elasticOut
            });                                                                 // Create the anim object
            cb.hide();

            Y.io('/frontend/js/screensaver_multi.json', {
                context: this,
                on: {
                    success: function(tx, r) {
                        // protected against malformed JSON response
                        try {
                            this.dreamsToDisplay = Y.JSON.parse(r.responseText);

                            for (var i = 0; i < this.dreamsToDisplay.dreams.length; i++) {
                                var dream = this.dreamsToDisplay.dreams[i];
                                for (var j = 0; j < dream.strokes.length; j++) {
                                    for (var k = 0; k < dream.strokes[j].curves.length; k++) {
                                        var cPoint = dream.strokes[j].curves[k];
                                        dream.strokes[j].curves[k] = {
                                            curve: [[cPoint.x1, cPoint.y1], [cPoint.x2, cPoint.y2], [cPoint.x, cPoint.y]]
                                        };
                                    }
                                }
                            }
                        }
                        catch (e) {
                            Y.log("JSON Parse failed!");
                            return;
                        }
                    }
                }
            });

            this.anim.on("end", this._step, this);
        },
        run: function() {
            Y.log("ScreenSaver.run()");

            this.cDream = this.dreamsToDisplay.dreams[this.cDreamIndex];
            this.cDreamIndex = (this.cDreamIndex + 1) % this.dreamsToDisplay.dreams.length;

            this.currentStrokeIndex = 0;
            this.currentCurveIndex = 0;

            this.show();            // Show the widget
            this.get("contentBox").setXY([this.cDream.strokes[0].start.x, this.cDream.strokes[0].start.y]); //from json setInitial position

            this._step();
        },
        _step: function() {

            if (!this.cDream) {
                return;
            }
            var nextPoint = this.cDream.strokes[this.currentStrokeIndex].curves[this.currentCurveIndex],
                    nextStroke = this.cDream.strokes[this.currentStrokeIndex + 1];

            if (nextPoint) {
                this.anim.set("to", nextPoint);
                this.anim.run();
                this.currentCurveIndex += 1;                                    // Increment index
            } else if (nextStroke) {
                this.currentStrokeIndex += 1;
                this.currentCurveIndex = 0;
                this.get("contentBox").setXY([nextStroke.start.x, nextStroke.start.y]);
                this.fire("strokeEnd");
                this._step();
            } else {                                                            // No more strokes: animation is over
                this.fire("strokeEnd");
                this.fire("drawingEnd");
                this.hide();
            }
        },
        stop: function() {
            this.cDream = null;
            this.anim.stop(false);
            this.hide();
        },
        show: function() {
            ScreenSaver.superclass.hide.call(this);
            this.get("contentBox").show(true);
        },
        hide: function() {
            ScreenSaver.superclass.hide.call(this);
            this.get("contentBox").hide(true);
            this.fire("strokeEnd");

            //Y.one('#screen-saver').hide();
            //$('#asd').trigger('pause');
            //$('div#draw-tool').fadeOut('slow');
            //Y.one("#screen-saver").show(true);
        }
    }, {
        ATTRS: {
            dream: {
                value: null
            }
        }
    });
    Y.namespace("Stalker").ScreenSaver = ScreenSaver;
});
