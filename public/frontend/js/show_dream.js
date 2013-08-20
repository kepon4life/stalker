/**
 *
 * + Customization
 * + Extension
 * +
 */
YUI.add("stalker-showdream", function(Y) {
    YUI_config.stalkerbase = YUI_config.stalkerbase || "";

    var strip_width;

    Y.namespace("Stalker").ShowDream = Y.Base.create("stalker-slider", Y.Stalker.Slider, [], {
        CONTENT_TEMPLATE: '<div>'
                + '<div class="details"></div>'
                + '<div class="qr"></div>'
                + '<div id="sink">'
                + '<div id="nav-bar">'
                + '<div id="status"></div>'
                + '</div>'
                + '<div id="preview-image"></div>'
//                + '<div id="preview-strip"><!-- prev next --></div>'
                + '<div id="preview-strip"><div id="slider-dreams" class="ui-slider-vertical"></div></div>'
                + '<div id="preview-strip-nowebgl"><div id="slider-dreams-nowebgl" class="ui-slider-vertical"></div></div>'
                + '</div>'
                + '</div>',
        /**
         *
         * @returns {undefined}
         */
        renderUI: function() {
            this.once("webglInitialized", function() {
                this.loadTheDream();
            });
            Y.Stalker.ShowDream.superclass.renderUI.call(this);
        },
        populateAlbum: function(pictures) {
            populateAlbum(pictures);
        },
        loadTheDream: function() {
            var img = $("#personaldream");
            dreamAlbum = [];
            dreamAlbum.push({
                name: img.attr("id"),
                thumbnail_url: img.attr("src"),
                photo_url: img.attr("src")

            });
            this.populateAlbum(dreamAlbum);
            this.selectFirstPicture();
        },
    }, {
        ATTRS: {}
    });

    var start = true;
    function populateAlbum(the_album) {
        Y.Stalker.slider.photo_album = photo_album = the_album;

        $('#preview-strip').find('.dreamslist').remove();

        ul = $('<ul class="dreamslist"/>');
        var strip = $('#preview-strip');
        var autofire;
        var laste;
        currently_playing = -1;
        function mousemove(e) {
            if (!e)
                e = laste;
            else
                laste = e;
            var toMove;
            var margins = 100;
            strip_width = strip.width();
            if (e.clientX < margins) {
                toMove = -10;
            } else if ((strip_width - e.clientX) < margins) {
                toMove = 10;
            }
            if (toMove)
                strip.scrollLeft(strip.scrollLeft() + toMove);
        }
        strip.on('mouseout', function(e) {
            clearInterval(autofire);
        }).on('scroll', function(e) {
            checks();
        });
        function checks() {
            var ins = [], outs = [];
            $('#preview-strip>ul>li').each(function(a, b) {
                var c = $(b);
                var moo = isInView(c);
                if (moo) {
                    ins.push(b);
                    c.trigger('smartload');
                } else {
                    outs.push(b);
                }
            });
        }
        function isInView(b) {
            var thumbx = b.offset().left;
            var left = 0;
            var more = 200;
            if ((thumbx + b.width() + more) < left) {
                return false;
            } else if (thumbx > (strip_width + left + more)) {
                return false;
            }
            return true;
        }
        $('#preview-strip').append(ul);

        function createThumbnail(photo_album, index) {
            var info = photo_album[index],
                    name = info.name,
                    thumbnail_url = info.thumbnail_url,
                    img = new Image();

            info.index = index;

            img.visible = false;
            if (name) {
                img.alt = name;
            }
            if (index % 2 === 0) {
                var li = $('<li class="even-display"  />').append(img);
            } else {
                var li = $('<li />').append(img);
            }

            li[0].info = photo_album[index];
            ul.append(li);
            li.hover(function(e) {
                return;
                var o = $(this).offset();
                var b = $(window).height() - o.top + 10;
                var cloned = img.cloneNode();
                $('#preview-image').html(cloned).width(info.thumbnail_width).
                        height(info.thumbnail_height).css({
                    left: o.left + 'px',
                    bottom: b + 'px'
                }).show();
            }).mouseout(function(e) {
                $('#preview-image').hide();
            }).on('smartload', smartload);
            var hasActivated = false;
            var scaleImages = true;
            function smartload() {
                if (hasActivated)
                    return;
                img.src = thumbnail_url;
                hasActivated = true;
            }
            $(img).load(function(e) {
                var t = $(this).show();
                var w = img.width, h = img.height, asp = w / h, target = 80;
                if (scaleImages) {
                    if (w >= h) {
                        w = target;
                        h = w / asp;
                    } else {
                        h = target;
                        w = asp * h;
                    }
                    t.width(w).height(h);
                } else {
                    t.css('left', (80 - w) / 2 + 'px');
                }
                t.css('top', (80 - h) / 2 + 'px');
            });
        }
        for (var i = 0; i < the_album.length; i++) {
            createThumbnail(the_album, i);
        }
        checks();
    } 
});