/**
 *
 *
 */
YUI.add("stalker-pusher", function(Y) {
    var pusher, privateChannel;

    Y.namespace("Stalker").Pusher = Y.Base.create("stalker-pusher", Y.Base, [], {}, {
        getChannel: function() {
            if (!pusher) {
                pusher = new Pusher(PUSHER_API_KEY);
                privateChannel = pusher.subscribe(PUSHER_CHANEL);
            }
            return privateChannel;
        }
    });
});
