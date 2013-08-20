$(document).ready(function() {
    var timerId = null;
    $('#screen-saver').hide();
    $('#asd').trigger('pause');
    tuio.cursor_update(function(data) {
        $('div#draw-tool').show();
        $('#screen-saver').hide();
        $('#asd').trigger('pause');

        clearTimeout(timerId);

        timerId = setTimeout(function() {
            $('div#draw-tool').fadeOut('slow');
            $('#screen-saver').fadeIn();
            $('#asd').trigger('play');
        }, 2000);
    });
})