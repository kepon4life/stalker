/**
 *
 *
 */
YUI.add("stalker-screensaver", function(Y) {

    var ScreenSaver = Y.Base.create("stalker-screensaver", Y.Widget, [], {
        CONTENT_TEMPLATE: "<div><div></div></div>",
        initializer: function() {
            var cb = this.get("contentBox");                                    // Retrieve current widget node, the one we animate
            this.anim = new Y.Anim({
                node: this.get("contentBox"),
                duration: 1.5
                        //easing: Y.Easing.elasticOut
            });                                                                 // Create the anim object
            cb.hide();
        },
        run: function() {
            Y.log("ScreenSaver.run()");

            this.show();                                                        // Show the widget
            this.get("contentBox").setXY([200, 200]);                           // Set initial position

            this.currentIndex = 0;
            this.currentAnim = [
                {curve: [[398, 197], [389, 418], [210, 417]]},
                {xy: [200, 200]}
            ];
            this._step();
        },
        _step: function() {
            var nextPoint = this.currentAnim[this.currentIndex];

            if (nextPoint) {
                this.anim.set("to", nextPoint);
                this.anim.once("end", this._step, this);
                this.anim.run();
                this.currentIndex += 1;                                         // Increment index
            } else {                                                            // No more points: animation is over
                this.fire("drawingEnd");
            }
        },
        show: function() {
            ScreenSaver.superclass.hide.call(this);
            this.get("contentBox").show(true);
        },
        hide: function() {
            ScreenSaver.superclass.hide.call(this);
            this.get("contentBox").hide(true);
            this.anim.stop();

            //Y.one('#screen-saver').hide();
            //$('#asd').trigger('pause');
            //$('div#draw-tool').fadeOut('slow');
            //Y.one("#screen-saver").show(true);
        }
    });

    Y.namespace("Stalker").ScreenSaver = ScreenSaver;
});
