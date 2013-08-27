/**
 *
 *
 */
YUI.add("stalker-pusher", function(Y) {
    var pusher, privateChannel;

    Y.namespace("Stalker").Pusher = Y.Base.create("stalker-pusher", Y.Base, [], {}, {
        getChannel: function() {
            if (!pusher) {
                Pusher.channel_auth_endpoint = 'pusher/auth';
                Pusher.log = Y.log;

                pusher = new Pusher(PUSHER_API_KEY);
                privateChannel = pusher.subscribe(PUSHER_CHANEL);
                privateChannel.bind('pusher:subscription_error', function(status) {
                    Y.log("Pusher error " + status);
                });
            }
            return privateChannel;
        }
    });
});
