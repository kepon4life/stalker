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
                this.renderSliderRangeForDreams();
                $('#preview-strip-nowebgl').css("display", "none")
                $('#simpleImgSlider').css("display", "none");
                $('#stats').css("display", "none");
                console.log(Y.Stalker.Slider.vartest)
            });
            Y.Stalker.WebSlider.superclass.renderUI.call(this);
        },
        populateAlbum: function(pictures) {
            populateAlbum(pictures);
        },
        /**
         *
         * @returns {undefined}
         */
//        loadAlbum: function(url) {
//            this.status('Loading album: ' + url);
//            Y.io(url, {
//                context: this,
//                on: {
//                    success: function(tId, e) {
//                        var photo, photos = Y.JSON.parse(e.response).photos;
//                        this.status(photos.photo.length + " photos found.");
//
//                        for (var i = 0; i < photos.photo.length; i++) {
//                            photo = photos.photo[i];
//                            dreamAlbum.push({
//                                name: photo.url,
//                                thumbnail_url: YUI_config.stalkerbase + photo.url,
//                                photo_url: YUI_config.stalkerbase + photo.url
//                            });
//                        }
//                        populateAlbum(dreamAlbum);
//                        this.selectFirstPicture();
//                        this.startSlideshow();
//                    }
//                }
//            });
//        },
//        loadAlbumFromService: function(url) {
//            this.status('Loading album: ' + url);
//            Y.io(url, {
//                context: this,
//                on: {
//                    success: function(tId, e) {
//                        var photos = Y.JSON.parse(e.response), photo;
//                        this.status(photos.length + " photos found.");
//                        jsonPhotos = photos;
//                        for (var i = 0; i < photos.length; i++) {
//                            photo = photos[i]["id"];
//                            dreamAlbum.push({
//                                name: photo,
//                                thumbnail_url: PATH_TO_DREAMS + photo + DREAM_EXTENSION,
//                                photo_url: PATH_TO_DREAMS + photo + DREAM_EXTENSION
//                            });
//                        }
//                        this.populateAlbum(dreamAlbum);
//                        this.selectFirstPicture();
//                        this.startSlideshow();
//                    }
//                }
//            });
//        },
        loadAlbumByDate: function(dates) {
            if (this.dreamAlbum != null || "undefined") {                       // Super faux, va toujourers retourner true, est évalué tel que (a || true)
                var startDate = dates[0];
                var endDate = dates[1];
                var photos = this.dreamAlbum;
                photos.sort(Y.Stalker.WebSlider.superclass.comparePhotosDate)
                dreamAlbum = [];
                for (var i = 0; i < photos.length; i++) {
                    var a = photos[i];
                    var datePhoto = new Date(a.created_at);
                    var datePhoto = datePhoto.getTime(), photo;

                    photo = photos[i]["id"];

                    if (datePhoto > dates[0] && datePhoto < dates[1]) {
                        dreamAlbum.push({
                            name: photo,
                            thumbnail_url: PATH_TO_DREAMS + photo + DREAM_EXTENSION,
                            photo_url: PATH_TO_DREAMS + photo + DREAM_EXTENSION
                        });
                    }
                }
                console.log("POPULATE AVEC PHOTO_ALBUM")
                console.log(dreamAlbum)
                populateAlbum(dreamAlbum);
                this.selectFirstPicture();
                this.startSlideshow();
            }
        },
        // ***************************
        // *** SLIDER RANGE ***
        // ***************************
        /**
         *
         */

        renderSliderRangeForDreams: function() {
            //We use the date in MS to deal with the date comparison
            var initialDate = new Date();
            initialDate.setFullYear(2013, 1, 11); // Start date of exhibition
            var initialDateValinMs = initialDate.getTime();

            var currentDate = new Date()
            var currentDateinMs = currentDate.getTime();

            var initialValues = [initialDateValinMs, currentDateinMs]; // Value to init the slider
            var initialValuesDates = [new Date(initialDateValinMs), new Date(currentDateinMs)];
            var sliderTooltip = function(event, ui) {
                var curValues = ui.values || initialValuesDates; // current value (when sliding) or initial value (at start)
                if (!(curValues[0] instanceof Date)) { // if curValues are not instances of Date they should be in MS (int). We have to convert it in Date format to display it on the slider.
                    curValues[0] = new Date(curValues[0])
                }
                if (!(curValues[1] instanceof Date)) {
                    curValues[1] = new Date(curValues[1])
                }

                var tooltipOne = '<div class="handle-tooltip"><div class="handle-tooltip-inner">' + curValues[0].getDate() + "/" + ((curValues[0].getMonth()) + 1) + "/" + curValues[0].getFullYear() + '</div><div class="handle-tooltip-arrow"></div></div>';
                var tooltipTwo = '<div class="handle-tooltip"><div class="handle-tooltip-inner">' + curValues[1].getDate() + "/" + ((curValues[1].getMonth()) + 1) + "/" + curValues[1].getFullYear() + '</div><div class="handle-tooltip-arrow"></div></div>';


                $('.ui-slider-handle').first().html(tooltipOne); //attach tooltip to the slider handle
                $('.ui-slider-handle').last().html(tooltipTwo); //attach tooltip to the slider handle


            }

            $("#slider-dreams").slider({
                values: initialValues,
                orientation: "vertical",
                range: true,
                min: initialDateValinMs,
                max: currentDateinMs,
                create: sliderTooltip,
                slide: sliderTooltip,
                start: function(e, ui) {
                    $(ui.handle).toggleClass("moveHandle")
                }, // This class allow to display the moved handler over the other handle
                stop: function(e, ui) {
                    $(ui.handle).toggleClass("moveHandle");
                    Y.Stalker.slider.loadAlbumByDate(ui.values);
                }
            });

            $('#preview-strip').enscroll({
                showOnHover: true,
                verticalTrackClass: 'track3',
                verticalHandleClass: 'handle3'
            });

            function sliderHeightAdjust(a){
                var winH = $(window).height()-50;
                $('.ui-slider-vertical').height(winH)
                console.log("adjust"+a)
            }

            sliderHeightAdjust('b');
            
            $(window).resize(function(){
                sliderHeightAdjust('c');
            }) 
        }
    }, {
        ATTRS: {}
    });

    var start = true;
    function populateAlbum(the_album) {
        photo_album = the_album;

        console.log("POPULATE ALBUM photo_album")
        console.log(photo_album)

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

        nbThumbnailToLoad = 10; // number of thumbnail loaded at the beginning
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

            }
        });
        checks();

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

    $.fn.slider_web = function() {
        DREAMS_SERVICE_URL = window.location.origin + "/services/dreamsvalidated";
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
            renderSlider();
            loadAlbum(startImgSlider);
        });

        function init() {
            $('#sink').show();
            $('#preview-strip').css("display", "none")
            $('#preview-strip-nowebgl').enscroll({
                showOnHover: true,
                verticalTrackClass: 'track3',
                verticalHandleClass: 'handle3'
            });
        }

        function loadAlbum(callback) {
            $.getJSON(DREAMS_SERVICE_URL, function(data) {
                $.each(data, function(key, val) {
                    var photo = val.id;
                    dreamsAlbum.push({
                        name: photo,
                        thumbnail_url: PATH_TO_DREAMS + photo + DREAM_EXTENSION,
                        photo_url: PATH_TO_DREAMS + photo + DREAM_EXTENSION
                    });
                })
                populateAlbum(dreamsAlbum);
                callback();
            })

        }

        function loadAlbumByDate(dates, callback) {
            clearTimeout(customStartTimeout)
            clearTimeout(timeout);
            clearTimeout(timeoutFirstImg);
            dreamsAlbum = [];
            console.log("loadAlbumByDate")
            $.getJSON(DREAMS_SERVICE_URL, function(data) {
                $.each(data, function(key, val) {
                    var photo = val.id;

                    var datePhoto = new Date(val.created_at);
                    var datePhoto = datePhoto.getTime();
                    if (datePhoto > dates[0] && datePhoto < dates[1]) {
                        dreamsAlbum.push({
                            name: photo,
                            thumbnail_url: PATH_TO_DREAMS + photo + DREAM_EXTENSION,
                            photo_url: PATH_TO_DREAMS + photo + DREAM_EXTENSION
                        });
                    }
                })
                populateAlbum(dreamsAlbum);
                callback();
            })

        }

        function startImgSlider() {
            $("#simpleImgSlider img").remove();
            var src = ($(".dreamslist img").get(0).src);
            var img = new Image();
            img.src = src;
            img.id = 0;
            img.onload = function() {
                $("#simpleImgSlider").append(img)
            }
            timeoutFirstImg = setTimeout(function() {
                loadingNextImg(0);
            }, PICTURETIME)
        }

        function customSliderStart(imgClicked) {
            clearTimeout(customStartTimeout)
            var imgToDisplay = new Image();
            imgToDisplay.id = ($("li").index((imgClicked.parent())))
            imgToDisplay.src = imgClicked.attr('src');
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

        function loadingNextImg(idCurrentImg) {
            if (idCurrentImg < dreamsAlbum.length - 1) {
                idCurrentImg = parseInt(idCurrentImg);
                var idNextImg = idCurrentImg + 1;
                var src = ($("img").get(idNextImg).src);
                $("#simpleImgSlider").append("<img id='" + idNextImg + "' src='" + src + "' style='display: none;'/>");
                $("#" + idNextImg).bind("load", function() {
                    timeout = setTimeout(function() {
                        fadeout(idCurrentImg, idNextImg);
                    }, PICTURETIME)
                })
            } else {
                var idNextImg = 0;
                var src = ($("img").get(idNextImg).src);
                $("#simpleImgSlider").append("<img id='" + idNextImg + "' src='" + src + "' style='display: none;'/>");
                $("#" + idNextImg).bind("load", function() {
                    timeout = setTimeout(function() {
                        fadeout(idCurrentImg, idNextImg);
                    }, PICTURETIME)
                })
            }

        }

        function fadeout(idLastImg, idImgToDisplay) {

            $("#" + idLastImg).fadeOut(FADEOUTTIME, function() {
                $("#" + idLastImg).remove();
                if (idImgToDisplay < 0) { // An idImgToDisplay negative means that the next image is not loaded
                    init();
                } else {
                    $("#" + idImgToDisplay).fadeIn(FADINTIME, function() {
                        loadingNextImg(idImgToDisplay);
                    });
                }
            })
        }

        function populateAlbum(album) {
            $('#preview-strip-nowebgl').find('.dreamslist').remove();

            ul = $('<ul class="dreamslist"/>');

            $('#preview-strip-nowebgl').append(ul);
            for (var i = 0; i < album.length; i++) {
                createThumbnail(album, i);
            }

            function createThumbnail(photo_album, index) {
                var info = photo_album[index],
                        name = info.name,
                        thumbnail_url = info.thumbnail_url,
                        img = new Image();

                img.src = thumbnail_url;
                info.index = index;

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
            }

            $('#preview-strip-nowebgl .dreamslist').on('click', 'li', function() {
                customSliderStart($(this).find('img'));
            })

        }

        function renderSlider() {
            //We use the date in MS to deal with the date comparison
            var initialDate = new Date();
            initialDate.setFullYear(2013, 4, 11); // Start date of exhibition
            var initialDateValinMs = initialDate.getTime();

            var currentDate = new Date()
            var currentDateinMs = currentDate.getTime();

            var initialValues = [initialDateValinMs, currentDateinMs]; // Value to init the slider
            var initialValuesDates = [new Date(initialDateValinMs), new Date(currentDateinMs)];
            var sliderTooltip = function(event, ui) {
                var curValues = ui.values || initialValuesDates; // current value (when sliding) or initial value (at start)
                if (!(curValues[0] instanceof Date)) { // if curValues are not instances of Date they should be in MS (int). We have to convert it in Date format to display it on the slider.
                    curValues[0] = new Date(curValues[0])
                }
                if (!(curValues[1] instanceof Date)) {
                    curValues[1] = new Date(curValues[1])
                }

                var tooltipOne = '<div class="handle-tooltip"><div class="handle-tooltip-inner">' + curValues[0].getDate() + "/" + ((curValues[0].getMonth()) + 1) + "/" + curValues[0].getFullYear() + '</div><div class="handle-tooltip-arrow"></div></div>';
                var tooltipTwo = '<div class="handle-tooltip"><div class="handle-tooltip-inner">' + curValues[1].getDate() + "/" + ((curValues[1].getMonth()) + 1) + "/" + curValues[1].getFullYear() + '</div><div class="handle-tooltip-arrow"></div></div>';


                $('.ui-slider-handle').first().html(tooltipOne); //attach tooltip to the slider handle
                $('.ui-slider-handle').last().html(tooltipTwo); //attach tooltip to the slider handle


            }

            $("#slider-dreams-nowebgl").slider({
                values: initialValues,
                orientation: "vertical",
                range: true,
                min: initialDateValinMs,
                max: currentDateinMs,
                create: sliderTooltip,
                slide: sliderTooltip,
                start: function(e, ui) {
                    $(ui.handle).toggleClass("moveHandle")
                }, // This class allow to display the moved handler over the other handle
                stop: function(e, ui) {
                    $(ui.handle).toggleClass("moveHandle");
                    loadAlbumByDate(ui.values, startImgSlider)
                }
            });
        }

    }

});


