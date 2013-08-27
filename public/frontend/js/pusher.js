/**
 *
 *
 */
YUI.add("stalker-pusher", function(Y) {

    var pusher, privateChannel;

    Y.namespace("Stalker").Pusher = Y.Base.create("stalker-pusher", Y.Base, [], {}, {
        

        getChanelDreamCreated: function() {
            if (!pusher) {
                pusher = new Pusher(PUSHER_API_KEY);
                privateChannel = pusher.subscribe(PUSHER_CHANEL_DREAM_CREATED);
            }
            return privateChannel;
        },

         getChanelDreamValidated: function() {
            if (!pusher) {
                pusher = new Pusher(PUSHER_API_KEY);
                privateChannel = pusher.subscribe(PUSHER_CHANEL_DREAM_VALIDATED);
            }
            return privateChannel;
        }
    });




});
