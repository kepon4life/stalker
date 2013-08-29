/**
 *
 *
 */
YUI.add("stalker-pusher", function(Y) {

    var pusher, privateChannel, createdChannel, requestChannel;

    Y.namespace("Stalker").Pusher = Y.Base.create("stalker-pusher", Y.Base, [], {}, {
        getPusher: function() {
            if (!pusher) {
                Pusher.channel_auth_endpoint = 'pusher/auth';
                Pusher.log = Y.log;
                pusher = new Pusher(PUSHER_API_KEY);
            }
            return pusher;
        },
        getChanelDreamCreated: function() {
            if (!privateChannel) {
                privateChannel = Y.Stalker.Pusher.getPusher().subscribe(PUSHER_CHANEL_DREAM_CREATED);
            }
            return privateChannel;
        },
        getChanelDreamValidated: function() {
            if (!createdChannel) {
                createdChannel = Y.Stalker.Pusher.getPusher().subscribe(PUSHER_CHANEL_DREAM_VALIDATED);
            }
            return createdChannel;
        },
        getChanelDreamRequested: function() {
            if (!requestChannel) {
                requestChannel = Y.Stalker.Pusher.getPusher().subscribe(PUSHER_CHANEL_DREAM_REQUESTED);
            }
            return requestChannel;
        }
    });

});
