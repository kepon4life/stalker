/**
 *
 * + Customization
 * + Extension
 * +
 */
YUI.add("stalker-webslider", function(Y) {
    YUI_config.stalkerbase = YUI_config.stalkerbase || "";

    var strip_width;

    Y.namespace("Stalker").WebSlider = Y.Base.create("stalker-slider", Y.Stalker.Slider, [], {
        CONTENT_TEMPLATE: '<div>'
                + '<div id="detailsandshare"><div id="shares"><span id="sharefb"></span><span id="sharewall"></span></div><span class="details"></span></div>'
                + '<div class="qr"></div>'
                + '<div id="sink">'
                + '<div id="nav-bar">'
                + '<div id="status"></div>'
                + '</div>'
                + '<div id="preview-image"></div>'
//                + '<div id="preview-strip"><!-- prev next --></div>'
                + '<div id="preview-strip"></div>'
                + '<div id="preview-strip-nowebgl"><div id="slider-dreams-nowebgl" class="ui-slider-vertical"></div></div>'
                + '</div>'
                + '</div>',
        /**
         *
         * @returns {undefined}
         */
        renderUI: function() {
            this.once("webglInitialized", function() {
                $('#preview-strip').enscroll({
                    verticalTrackClass: 'track4',
                    verticalHandleClass: 'handle4',
                    zIndex: 10000
                });
                $('#preview-strip-nowebgl').css("display", "none")
                $('#simpleImgSlider').css("display", "none");
                $('#stats').css("display", "none");
                $("#sink").toggle();
            });
            Y.Stalker.WebSlider.superclass.renderUI.call(this);
        },
        populateAlbum: function(pictures) {
            populateAlbum(pictures);
        },
        loadAlbumByDate: function(dates) {
            if (this.dreamAlbum != null || "undefined") {                       // Super faux, va toujourers retourner true, est évalué tel que (a || true)
                
                var startDate,endDate;

                if(dates[0]<dates[1]){
                    startDate = dates[0];
                    endDate = dates[1];
                }else{
                    startDate = dates[1];
                    endDate = dates[0];
                }
                
                var photos = this.dreamAlbum;
                photos.sort(Y.Stalker.WebSlider.superclass.comparePhotosDate)
                dreamAlbum = [];
                for (var i = 0; i < photos.length; i++) {
                    var a = photos[i];
                    var datePhoto = new Date(a.created_at);
                    var datePhoto = datePhoto.getTime(), photo;

                    photo = photos[i]["id"];

                    if (datePhoto > startDate && datePhoto < endDate) {
                        dreamAlbum.push({
                            name: photo,
                            thumbnail_url: PATH_TO_DREAMS_THUMBNAILS + photo + DREAM_EXTENSION
                        });
                    }
                }
                populateAlbum(dreamAlbum);
                this.selectFirstPicture();
                this.startSlideshow();
            }
        },
        selectPicture: function(index) {
            Y.Stalker.WebSlider.superclass.selectPicture.call(this,index);
            dreamselected(index);
        },
    }, {
        ATTRS: {}
    });
    
    function dreamselected(index){
        $('#preview-strip ul .dreamselected').removeClass("dreamselected");
            var c = $('#preview-strip>ul>li').get(index);
            c.className = c.className + "dreamselected";
    }
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
            var li = $('<li/>').append(img);

            li[0].info = photo_album[index];

            var date = new Date(Date.parse(info.created_at));
            li.attr("title",prettyDate(date));
            li.attr('id',date.getDate())
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
        nbThumbnailToLoad = 25; // number of thumbnail loaded at the beginning
        indexThumbnail = 0; // useful to know which thumbnail (index) was the last thumnail loaded
        $('.dreamslist').waypoint({
            context: "#preview-strip",
            offset: "bottom-in-view", // waypoint is triggered when the bottom of .dreamslist is in view in the viewport
            handler: function(direction) {
                if (direction == "down") {  // we must load the next thumbnail only if the user is scrolling down
                    $('.dreamslist').waypoint("disable") // Allow to load dynamically the next thumbnails into .dreamslist. Then the waypoint will be enabled again.
                    if ((indexThumbnail + nbThumbnailToLoad) > photo_album.length) { // Useful when we have less thumbnails to load than nbThumbnailToLoad
                        nbThumbnailToLoad = (photo_album.length - indexThumbnail);
                    }
                    for (var i = 0; i < nbThumbnailToLoad; i++) {
                        createThumbnail(photo_album, indexThumbnail + i);
                    }
                }
                indexThumbnail = indexThumbnail + nbThumbnailToLoad;
                if (indexThumbnail < photo_album.length) {
                    $('.dreamslist').waypoint("enable")
                }

                $('li').waypoint({
                    context: "#preview-strip",
                    handler: function() {
                        addPrettyDateToScroll($(this).attr("title"))             
                    }
                });

            }
        });
        
        checks();
        /*Init value info for scroll*/
        var tooltip = '<div id="dateThumbnail" class="handle-tooltip"><div class="handle-tooltip-inner"></div></div>'
        $('.handle4').html(tooltip)
        addPrettyDateToScroll($(".dreamslist li").get(0).title);
        /*Dream selected style*/
        $('#preview-strip ul li').on("click","img",function(){
            dreamselected($(this).parent().index());
        })
    }
    function prettyDate(date){
        monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        return (date.getHours() + ":" + date.getMinutes()
        + " " + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear());
    }

    function addPrettyDateToScroll(date){
        date = date.split(" ")
        date = (date[1]+" "+date[2]+" "+date[3])
        $("#dateThumbnail .handle-tooltip-inner").html(date)
    }

    function comparePhotosDate(a,b) {
        var da = new Date(a.created_at);
        var db = new Date(b.created_at);
        da = da.getTime();
        db = db.getTime();
        if (da < db)
            return 1;
        if (da > db)
            return -1;
        return 0;
    }
});
(function($) {
    $.fn.slider_web = function() {
        DREAMS_SERVICE_URL = window.location.protocol+'//'+window.location.host + "/services/dreamsvalidated";
        FADEOUTTIME = 2000;
        FADINTIME = 2000;
        PICTURETIME = 3000;
        var dreamsAlbum = [];
        var isLoaded = false; // Allow to know if the gallery is loded and the slider ready to start
        var timeoutFirstImg;
        var timeout;
        var customStartTimeout;

        this.each(function() {
            init();
            loadAlbum(startImgSlider);
        });

        function init() {

            $('body').append('<div id="sink"><div id="nav-bar"><div id="status"></div></div><div id="preview-image"></div><div id="preview-strip"></div><div id="preview-strip-nowebgl"></div></div>')
            $('body').append('<div id="detailsandshare"><span class="details"></span></div><div id="simpleImgSlider"></div>')
            
            $('#sink').show();
        }

        function loadAlbum(callback) {
            $.getJSON(DREAMS_SERVICE_URL, function(data) {
                $.each(data, function(key, val) {
                    var photo = val.id;
                    dreamsAlbum.push({
                        name: photo,
                        thumbnail_url: PATH_TO_DREAMS_THUMBNAILS + photo + DREAM_EXTENSION,
                        created_at: val.created_at
                    });
                })
                dreamsAlbum.sort(comparePhotosDate);
                populateAlbum(dreamsAlbum);
                callback();
            })
        }

        function loadAlbumByDate(dates, callback) {
            clearTimeout(customStartTimeout)
            clearTimeout(timeout);
            clearTimeout(timeoutFirstImg);
            dreamsAlbum = [];
            $.getJSON(DREAMS_SERVICE_URL, function(data) {
                $.each(data, function(key, val) {
                    var photo = val.id;

                    var datePhoto = new Date(val.created_at);
                    var datePhoto = datePhoto.getTime();
                    if (datePhoto > dates[0] && datePhoto < dates[1]) {
                        dreamsAlbum.push({
                            name: photo,
                            thumbnail_url: PATH_TO_DREAMS_THUMBNAILS + photo + DREAM_EXTENSION,
                            created_at: val.created_at
                        });
                    }
                })
                dreamsAlbum.sort(comparePhotosDate)
                populateAlbum(dreamsAlbum);
                callback();
            })

        }

        function startImgSlider() {
            $("#simpleImgSlider img").remove();
            var li = $(".dreamslist li").get(0)
            addPrettyDateToScroll(li.title)
            dreamselected(0)

            showLegend(li.info)
            var nameImg = ($(".dreamslist img").get(0).id);
            var img = new Image();
            img.src = PATH_TO_DREAMS + nameImg + DREAM_EXTENSION;
            img.id = 0;
            img.onload = function() {
                $("#simpleImgSlider").append(img)
            }
            timeoutFirstImg = setTimeout(function() {
                loadingNextImg(0);
            }, PICTURETIME)
        }

        function customSliderStart(imgClicked) {

            dreamselected($("li").index((imgClicked.parent())))

            clearTimeout(customStartTimeout)
            var imgToDisplay = new Image();
            imgToDisplay.id = ($("li").index((imgClicked.parent())))
            imgToDisplay.src = PATH_TO_DREAMS + imgClicked.attr('id') + DREAM_EXTENSION;
            clearTimeout(timeout);
            clearTimeout(timeoutFirstImg);
            $("#simpleImgSlider").find('img').remove();

            imgToDisplay.onload = function() {
                $("#simpleImgSlider").append(imgToDisplay)
                customStartTimeout = setTimeout(function() {
                    loadingNextImg(imgToDisplay.id);
                }, PICTURETIME)
            }
        }

        function loadingNextImg(indexCurrentImg) {
            if (indexCurrentImg < dreamsAlbum.length - 1) {
                iindexCurrentImg = parseInt(indexCurrentImg);
                var indexNextImg = indexCurrentImg + 1;
                var nameImg = ($(".dreamslist img").get(indexNextImg).id);
                var src = PATH_TO_DREAMS + nameImg + DREAM_EXTENSION;
                $("#simpleImgSlider").append("<img id='" + indexNextImg + "' src='" + src + "' style='display: none;'/>");
                $("#" + indexNextImg).bind("load", function() {
                        timeout = setTimeout(function() {
                        fadeout(indexCurrentImg, indexNextImg);
                    }, PICTURETIME)
                })
            } else {
                var indexNextImg = 0;
                var nameImg = ($(".dreamslist img").get(indexNextImg).id);
                var src = PATH_TO_DREAMS + nameImg + DREAM_EXTENSION;
                $("#simpleImgSlider").append("<img id='" + indexNextImg + "' src='" + src + "' style='display: none;'/>");
                $("#" + indexNextImg).bind("load", function() {
                    timeout = setTimeout(function() {
                        fadeout(indexCurrentImg, indexNextImg);
                    }, PICTURETIME)
                })
            }

        }

        function fadeout(idLastImg, idImgToDisplay){
            $("#" + idLastImg).fadeOut(FADEOUTTIME, function() {
                $("#" + idLastImg).remove();
                if (idImgToDisplay < 0) { // An idImgToDisplay negative means that the next image is not loaded
                    init();
                } else {
                    $("#" + idImgToDisplay).fadeIn(FADINTIME, function() {
                        loadingNextImg(idImgToDisplay);
                    });
                    dreamselected(idImgToDisplay)
                }
            })
        }

        function populateAlbum(album) {
            $('#preview-strip-nowebgl').find('.dreamslist').remove();
            ul = $('<ul class="dreamslist"/>');
            $('#preview-strip-nowebgl').append(ul);
            /*$('#preview-strip-nowebgl').append(ul);
            for (var i = 0; i < album.length; i++) {
                createThumbnail(album, i);
            }*/

            nbThumbnailToLoad = 25; // number of thumbnail loaded at the beginning
            indexThumbnail = 0; // useful to know which thumbnail (index) was the last thumnail loaded
            $('.dreamslist').waypoint({
                context: "#preview-strip-nowebgl",
                offset: "bottom-in-view", // waypoint is triggered when the bottom of .dreamslist is in view in the viewport
                handler: function(direction) {
                    if (direction == "down") {  // we must load the next thumbnail only if the user is scrolling down
                        $('.dreamslist').waypoint("disable") // Allow to load dynamically the next thumbnails into .dreamslist. Then the waypoint will be enabled again.
                        if ((indexThumbnail + nbThumbnailToLoad) > album.length) { // Useful when we have less thumbnails to load than nbThumbnailToLoad
                            nbThumbnailToLoad = (album.length - indexThumbnail);
                        }
                        for (var i = 0; i < nbThumbnailToLoad; i++) {
                            createThumbnail(album, indexThumbnail + i);
                        }
                    }
                    indexThumbnail = indexThumbnail + nbThumbnailToLoad;
                    if (indexThumbnail < album.length) {
                        $('.dreamslist').waypoint("enable")
                    }

                    $('li').waypoint({
                        context: "#preview-strip-nowebgl",
                        handler: function() {
                            addPrettyDateToScroll($(this).attr("title"))             
                        }
                    });

                }
            });

            function createThumbnail(photo_album, index) {
                var info = photo_album[index],
                        name = info.name,
                        thumbnail_url = info.thumbnail_url,
                        img = new Image();

                img.src = thumbnail_url;
                info.index = index;
                img.id = name;

                if (name) {
                    img.alt = name;
                }

                var li = $('<li/>').append(img);


                var date = new Date(Date.parse(info.created_at));
                li.attr("title",prettyDate(date));

                li[0].info = photo_album[index];
                ul.append(li);
            }

            $('#preview-strip-nowebgl .dreamslist').on('click', 'li', function() {
                customSliderStart($(this).find('img'));
            })

            $('#preview-strip-nowebgl').enscroll({
                verticalTrackClass: 'track4',
                verticalHandleClass: 'handle4',
                zIndex: 10000
            });
            $('li').waypoint({
            context: "#preview-strip-nowebgl",
            handler: function() {
                addPrettyDateToScroll($(this).attr("title"))
                }
            });
            var tooltip = '<div id="dateThumbnail" class="handle-tooltip"><div class="handle-tooltip-inner"></div></div>'
            $('.handle4').html(tooltip)

        }

        function comparePhotosDate(a,b) {
            var da = new Date(a.created_at);
            var db = new Date(b.created_at);
            da = da.getTime();
            db = db.getTime();
            if (da < db)
                return 1;
            if (da > db)
              return -1;
            return 0;
        }

        $("#preview-strip-nowebgl").on("click","li",function(e){
            var node = e.currentTarget;
            showLegend(node.info)
        })

        function prettyDate(date){
            monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            return (date.getHours() + ":" + date.getMinutes()
            + " " + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear());
        }

        function addPrettyDateToScroll(date){
            date = date.split(" ")
            date = (date[1]+" "+date[2]+" "+date[3])
            $("#dateThumbnail .handle-tooltip-inner").html(date)
        }
        function showLegend (pictureCfg) {
            var metas,
                    detailsNode = $("#detailsandshare"),
                    date = new Date(Date.parse(pictureCfg.created_at));
                    detailsNode.text(prettyDate(date));
            try {
                metas = Y.JSON.parse(pictureCfg.metadatas);
                detailsNode.append("<br />" + metas.event);
            } catch (e) {
                // GOTCHA
            }
        }

        function dreamselected(index){
        $('#preview-strip-nowebgl ul .dreamselected').removeClass("dreamselected");
            var c = $('#preview-strip-nowebgl>ul>li').get(index);
            c.className = c.className + "dreamselected";
        }

    }   

}(jQuery));


