/**
 *
 * + Customization
 * + Extension
 * +
 */

var actual_dream_id = 0;

var pusher = new Pusher(PUSHER_API_KEY);
var channel = pusher.subscribe(PUSHER_CHANEL_DREAM_REQUESTED);

YUI.add("stalker-webslider", function(Y) {
    YUI_config.stalkerbase = YUI_config.stalkerbase || "";

    var strip_width;
    var nbDreamsLoaded;

    Y.namespace("Stalker").WebSlider = Y.Base.create("stalker-slider", Y.Stalker.Slider, [], {
        CONTENT_TEMPLATE: '<div>'
                + renderSharingBtns()
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
        initializer: function() {
            Y.Stalker.webslider = this;                                            // Set up singleton
        },
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

                $("#shares").on("click", "#sharewall", function(e){
                    actual_dream_id = $('#preview-strip li.dreamselected img').attr("alt");
                });

                $("#walls_btn").on("click",".wall_btn",function(e){
                    selectWall(this);
                });

                $(".modal-footer").on("click", "#modal_ok_btn", function(e){
                    shareOnWall();
                });

                $("#sharefb").on("click",function(){
                    shareOnFacebook();
                })
            });
            previewStripHeightAdjust()
            Y.Stalker.WebSlider.superclass.renderUI.call(this);
        },
        populateAlbum: function(pictures) {
            populateAlbum(pictures);
        },
        selectFirstPicture: function() {
            if(Y.Stalker.webslider.get("customStart") != null){
                if(Y.Stalker.webslider.get("customStartModerationState")){
                    $("#"+Y.Stalker.webslider.get("customStart")).addClass("moderate")
                }else{
                    if(!(Y.Stalker.webslider.get("customStartValidated"))){
                        $("#"+Y.Stalker.webslider.get("customStart")).removeClass("moderate")
                        $("#"+Y.Stalker.webslider.get("customStart")).addClass("notvalid")
                    }
                }

                this.selectPicture($("#"+Y.Stalker.webslider.get("customStart")).index());

                //Scroll to specific thumbnail
            $('#preview-strip').animate({
                scrollTop: $("#"+Y.Stalker.webslider.get("customStart")).offset().top
            }, 1000);
            }else{
                this.selectPicture(0);
            }
        },
        selectPicture: function(index) {
            if(index > nbDreamsLoaded - 1){
                index = 0
            }
            Y.Stalker.WebSlider.superclass.selectPicture.call(this,index);
            dreamselected(index);
        },
        showLegend: function(pictureCfg) {
            var metas,
                    detailsNode = $("#detailsandshare .details"),
                    date = new Date(Date.parse(pictureCfg.created_at));
                    detailsNode.text(prettyDate(date));
            try {
                metas = Y.JSON.parse(pictureCfg.metadatas);
                detailsNode.append("<br />" + metas.event);
            } catch (e) {
                // GOTCHA
            }
        },
    }, {
        ATTRS: {
            customStart: {
                value: null
            },
            customStartModerationState: {
                value: null
            },
            customStartValidated: {
                value: null 
            },
        }
    });
    
    function dreamselected(index){
        var idDreamSelected = $('#preview-strip>ul>li').get(index).id
        if($("#"+idDreamSelected).hasClass("moderate")){
            $("#sharefb").hide();
            $('#sharewall').hide();
            $('#moderatetext').show();
            $("#notvalidatetext").hide();
        }else{
            if($("#"+idDreamSelected).hasClass("notvalid")){
                $("#sharefb").hide();
                $('#sharewall').hide();
                $('#moderatetext').hide();
                $("#notvalidatetext").show();
            }else{
                $("#sharefb").show();
                $('#sharewall').show();
                $('#moderatetext').hide()
                $('#notvalidatetext').hide()
            }      
        }

        $('#preview-strip ul .dreamselected').removeClass("dreamselected");
        $("#"+idDreamSelected).addClass("dreamselected");
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
            li.attr('id',name)
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

        var indexOfDreamRequested;
        nbThumbnailToLoad = 25;
        if(Y.Stalker.webslider.get("customStart")!= null){
            for (var i = 0; i < photo_album.length; i++) {
                if(photo_album[i].id == Y.Stalker.webslider.get("customStart")){
                    indexOfDreamRequested = i;
                    break;
                }
            }
            if(indexOfDreamRequested+1 > 25){
                nbThumbnailToLoad = (indexOfDreamRequested+1)
            }
        }

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
                nbDreamsLoaded = $('#preview-strip>ul>li').length
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
        $('#preview-strip ul').on("click","li",function(){
            dreamselected($(this).index());
        })
    }

});
(function($) {
    $.fn.slider_web = function(idDreamRequested,serviceUrl,dreamRequestedIsUnderModeration,dreamRequestedIsValid) {
        //DREAMS_SERVICE_URL = window.location.protocol+'//'+window.location.host + "/services/dreamsvalidated";
        DREAMS_SERVICE_URL = serviceUrl;
        FADEOUTTIME = 2000;
        FADINTIME = 2000;
        PICTURETIME = 3000;
        var dreamsAlbum = [];
        var nbDreamsLoaded;
        var isLoaded = false; // Allow to know if the gallery is loded and the slider ready to start
        var timeoutFirstImg;
        var timeout;
        var customStartTimeout;
        this.each(function() {
            init();
            if(idDreamRequested == null){
                loadAlbum(startImgSlider);
            }else{
                var idimg = idDreamRequested.toString();
                loadAlbum(function(){
                    customSliderStart($("#"+idimg));
                    $('#preview-strip-nowebgl').animate({
                    scrollTop: $("#"+idimg).offset().top
                    }, 1000);
                })

                
            }
        });

        function init() {

            $('body').append('<div id="sink"><div id="nav-bar"><div id="status"></div></div><div id="preview-image"></div><div id="preview-strip"></div><div id="preview-strip-nowebgl"></div></div>');
            $('body').append(renderSharingBtns());
            $('body').append('<div id="simpleImgSlider"></div>');
            $('#sink').show();
            $("#sharefb").on("click",function(){
                shareOnFacebook();
            })

            
            $("#shares").on("click", "#sharewall", function(e){
                actual_dream_id = $('#preview-strip-nowebgl li.dreamselected img').attr("alt");
            });

            $("#walls_btn").on("click",".wall_btn",function(e){
                selectWall(this);
            });

            $(".modal-footer").on("click", "#modal_ok_btn", function(e){
                shareOnWall();
            });
            
            previewStripHeightAdjust();
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

        function startImgSlider() {
            $("#simpleImgSlider img").remove();
            var li = $(".dreamslist li").get(0)
            addPrettyDateToScroll(li.title)
            dreamselected(0)

            showLegend(li.info)
            var nameImg = ($(".dreamslist img").get(0).parentNode.id);
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

        function customSliderStart(liClicked) {

            if(liClicked.attr("id") == idDreamRequested){
                if(dreamRequestedIsUnderModeration){
                    liClicked.addClass("moderate")
                }else{
                    if(!(dreamRequestedIsValid)){
                        liClicked.removeClass("moderate")
                        liClicked.addClass("notvalid")
                    }
                }
            }
            dreamselected(liClicked.index())

            clearTimeout(customStartTimeout)
            var imgToDisplay = new Image();
            imgToDisplay.id = (liClicked.index())
            imgToDisplay.src = PATH_TO_DREAMS + liClicked.attr('id') + DREAM_EXTENSION;
            var li = liClicked.get(0);
            addPrettyDateToScroll(li.title)
            showLegend(li.info)
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
            if (indexCurrentImg < nbDreamsLoaded - 1) {
                indexCurrentImg = parseInt(indexCurrentImg);
                var indexNextImg = indexCurrentImg + 1;
                var nameImg = ($(".dreamslist img").get(indexNextImg).parentNode.id);
                var src = PATH_TO_DREAMS + nameImg + DREAM_EXTENSION;
                $("#simpleImgSlider").append("<img id='" + indexNextImg + "' src='" + src + "' style='display: none;'/>");
                $("#" + indexNextImg).bind("load", function() {
                        timeout = setTimeout(function() {
                        fadeout(indexCurrentImg, indexNextImg);
                    }, PICTURETIME)
                })
            } else {
                var indexNextImg = 0;
                var nameImg = ($(".dreamslist img").get(indexNextImg).parentNode.id);
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

            var indexOfDreamRequested;
            nbThumbnailToLoad = 25;
            if(idDreamRequested!= null){
                for (var i = 0; i < album.length; i++) {
                    if(album[i].name == idDreamRequested){
                        indexOfDreamRequested = i;
                        break;
                    }
                }
                if(indexOfDreamRequested+1 > 25){
                    nbThumbnailToLoad = (indexOfDreamRequested+1)
                }
            }

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
                    nbDreamsLoaded = $('#preview-strip-nowebgl>ul>li').length
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

                if (name) {
                    img.alt = name;
                }

                var li = $('<li/>').append(img);
                li.attr('id',name)

                var date = new Date(Date.parse(info.created_at));
                li.attr("title",prettyDate(date));

                li[0].info = photo_album[index];
                ul.append(li);
            }

            $('#preview-strip-nowebgl .dreamslist').on('click', 'li', function() {
                customSliderStart($(this));
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
            $('.handle4').html(tooltip);

        }

        $("#preview-strip-nowebgl").on("click","li",function(e){
            var node = e.currentTarget;
            showLegend(node.info)
        })
        
        
        
        
        

        function showLegend (pictureCfg) {
            var metas,
                detailsNode = $("#detailsandshare .details"),
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
            var idDreamSelected = $('#preview-strip-nowebgl>ul>li').get(index).id
            if($("#"+idDreamSelected).hasClass("moderate")){
                $("#sharefb").hide();
                $('#sharewall').hide();
                $('#moderatetext').show();
                $("#notvalidatetext").hide();
            }else{
                if($("#"+idDreamSelected).hasClass("notvalid")){
                    $("#sharefb").hide();
                    $('#sharewall').hide();
                    $('#moderatetext').hide();
                    $("#notvalidatetext").show();
                }else{
                    $("#sharefb").show();
                    $('#sharewall').show();
                    $('#moderatetext').hide()
                    $('#notvalidatetext').hide()
                }      
            }

            $('#preview-strip-nowebgl ul .dreamselected').removeClass("dreamselected");
            $("#"+idDreamSelected).addClass("dreamselected");
        }



    }   

}(jQuery));

(function($) {
    $.fn.slider_web_mobile = function(idDreamRequested,serviceUrl,dreamRequestedIsUnderModeration,dreamRequestedIsValid) {
        //DREAMS_SERVICE_URL = window.location.protocol+'//'+window.location.host + "/services/dreamsvalidated";
        DREAMS_SERVICE_URL = serviceUrl;
        FADEOUTTIME = 2000;
        FADINTIME = 2000;
        PICTURETIME = 3000;
        var timerDateInfo = null; 
        var dreamsAlbum = [];
        var isLoaded = false; // Allow to know if the gallery is loded and the slider ready to start
        var timeoutFirstImg;
        var timeout;
        var customStartTimeout;
        var indexThumbnail = 0;// useful to know which thumbnail (index) was the last thumnail loaded
        var nbThumbnailToLoad = 12;
        var nbDreamsLoaded;
        this.each(function() {
            init();
            var totalScrollOffsetH=$(".totalScrollOffset").height();

            $('#preview-strip-nowebgl').mCustomScrollbar({
                scrollInertia: 0,
                autoDraggerLength: false,
                callbacks:{
                        onTotalScroll:function(){
                            if(indexThumbnail < dreamsAlbum.length){
                                if ((indexThumbnail + nbThumbnailToLoad) > dreamsAlbum.length) { // Useful when we have less thumbnails to load than nbThumbnailToLoad
                                nbThumbnailToLoad = (dreamsAlbum.length - indexThumbnail);
                                }
                                for (var i = 0; i < nbThumbnailToLoad; i++) {
                                    createThumbnail(dreamsAlbum,indexThumbnail + i);
                                }
                                indexThumbnail = indexThumbnail + nbThumbnailToLoad;
                                nbDreamsLoaded = $('#preview-strip-nowebgl ul>li').length
                            }
                        },
                        whileScrolling:function(){
                            $.waypoints("refresh")
                        },
                        onScroll: function(){
                            clearTimeout(timerDateInfo);
                            $('#detailsandshare').css('z-index','0')
                            $('#dateThumbnail').show()
                            timerDateInfo = setTimeout(function(){$('#dateThumbnail').fadeOut(1000);$('#detailsandshare').css('z-index','14')},2000);
                        }
                    }
            });

            if(idDreamRequested == null){
                loadAlbum(startImgSlider); // Normal start
            }else{
                var idimg = idDreamRequested.toString();

                loadAlbum(function(){
                    customSliderStart($("#"+idimg));
                    $("#preview-strip-nowebgl").mCustomScrollbar("scrollTo","#"+idimg,{
                        scrollInertia:3000
                    });
                })
                
            }
        });

        function init() {

            $('body').append('<div id="sink"><div id="nav-bar"><div id="status"></div></div><div id="preview-image"></div><div id="preview-strip"></div><div id="preview-strip-nowebgl"></div></div>');
            $('body').append(renderSharingBtns());
            $('body').append('<div id="simpleImgSlider"></div>');
            
            $('#sink').show();
            $('#preview-strip').hide();

            $("#sharefb").on("click",function(){
                shareOnFacebook();
            });

            $("#shares").on("click", "#sharewall", function(e){
                    actual_dream_id = $('#preview-strip-nowebgl li.dreamselected img').attr("alt");
            });

            $("#walls_btn").on("click",".wall_btn",function(e){
                selectWall(this);
            });

            $(".modal-footer").on("click", "#modal_ok_btn", function(e){
                shareOnWall();
            });
            
            previewStripHeightAdjust();

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

        function startImgSlider() {

            $("#simpleImgSlider img").remove();
            var li = $(".dreamslist li").get(0)
            addPrettyDateToScroll(li.title)
            dreamselected(0)

            showLegend(li.info)
            var nameImg = ($(".dreamslist img").get(0).parentNode.id);
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

        function customSliderStart(liClicked) {

            if(liClicked.attr("id") == idDreamRequested){
                if(dreamRequestedIsUnderModeration){
                    liClicked.addClass("moderate")
                }else{
                    if(!(dreamRequestedIsValid)){
                        liClicked.removeClass("moderate")
                        liClicked.addClass("notvalid")
                    }
                }
            }
            dreamselected(liClicked.index())

            clearTimeout(customStartTimeout)
            var imgToDisplay = new Image();
            imgToDisplay.id = (liClicked.index())
            imgToDisplay.src = PATH_TO_DREAMS + liClicked.attr('id') + DREAM_EXTENSION;
            var li = liClicked.get(0);
            addPrettyDateToScroll(li.title)
            showLegend(li.info)
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
            if (indexCurrentImg < nbDreamsLoaded - 1) {
                indexCurrentImg = parseInt(indexCurrentImg);
                var indexNextImg = indexCurrentImg + 1;
                var nameImg = ($(".dreamslist img").get(indexNextImg).parentNode.id);
                var src = PATH_TO_DREAMS + nameImg + DREAM_EXTENSION;
                $("#simpleImgSlider").append("<img id='" + indexNextImg + "' src='" + src + "' style='display: none;'/>");
                $("#" + indexNextImg).bind("load", function() {
                        timeout = setTimeout(function() {
                        fadeout(indexCurrentImg, indexNextImg);
                    }, PICTURETIME)
                })
            } else {
                var indexNextImg = 0;
                var nameImg = ($(".dreamslist img").get(indexNextImg).parentNode.id);
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
            $('.mCSB_container').append(ul);

            var indexOfDreamRequested;

            if(idDreamRequested!= null){
                for (var i = 0; i < album.length; i++) {
                    if(album[i].name == idDreamRequested){
                        indexOfDreamRequested = i;
                        break;
                    }
                }
                if(indexOfDreamRequested+1 > nbThumbnailToLoad){
                    nbThumbnailToLoad = (indexOfDreamRequested+1)
                }
            }
            
            for (var i = 0; i < nbThumbnailToLoad; i++) {
                createThumbnail(album, indexThumbnail + i);
            }
            indexThumbnail = indexThumbnail + nbThumbnailToLoad;
            nbDreamsLoaded = $('#preview-strip-nowebgl ul>li').length

            /*Init value info for scroll*/
            var tooltip = '<div id="dateThumbnail" class="handle-tooltip"><div class="handle-tooltip-inner"></div></div>'
            $('.mCSB_dragger_bar').html(tooltip)
            addPrettyDateToScroll($(".dreamslist li").get(0).title);
            
        }

        function createThumbnail(photo_album, index) {
                ul = $('.dreamslist');
                var info = photo_album[index],
                        name = info.name,
                        thumbnail_url = info.thumbnail_url,
                        img = new Image();

                img.src = thumbnail_url;
                info.index = index;

                if (name) {
                    img.alt = name;
                }

                var li = $('<li/>').append(img);
                li.attr('id',name)

                var date = new Date(Date.parse(info.created_at));
                li.attr("title",prettyDate(date));

                li[0].info = photo_album[index];
                ul.append(li);
                $('#preview-strip-nowebgl').mCustomScrollbar("update");

                $(li).waypoint({
                    handler: function() {
                        addPrettyDateToScroll($(this).attr("title"))
                    }
                });
                
        }

        $('body').on('click', '.dreamslist li', function() {
            customSliderStart($(this));
        })

        $('body').on('click', '.dreamslist li',function(e){
            var node = e.currentTarget;
            showLegend(node.info)
        })
              
        function showLegend (pictureCfg) {
            var metas,
                detailsNode = $("#detailsandshare .details"),
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
            var idDreamSelected = $('#preview-strip-nowebgl ul>li').get(index).id
            if($("#"+idDreamSelected).hasClass("moderate")){
                $("#sharefb").hide();
                $('#sharewall').hide();
                $('#moderatetext').show();
                $("#notvalidatetext").hide();
            }else{
                if($("#"+idDreamSelected).hasClass("notvalid")){
                    $("#sharefb").hide();
                    $('#sharewall').hide();
                    $('#moderatetext').hide();
                    $("#notvalidatetext").show();
                }else{
                    $("#sharefb").show();
                    $('#sharewall').show();
                    $('#moderatetext').hide()
                    $('#notvalidatetext').hide()
                }      
            }

            $('#preview-strip-nowebgl ul .dreamselected').removeClass("dreamselected");
            $("#"+idDreamSelected).addClass("dreamselected");
        }

    }   

}(jQuery));

function previewStripHeightAdjust(){
    if($(window).width() >767){
        var winH = $(window).height()-40;
        $('#preview-strip').height(winH)
        $('#preview-strip-nowebgl').height(winH)
    }else{
        $('#preview-strip-nowebgl').height(winH)
    }
}

$(window).resize(function(){
    previewStripHeightAdjust();
}) 

function prettyDate(date){
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2)
    return (date.getHours() + ":" + date.getMinutes()
    + " "+day+"/"+ month+"/"+ date.getFullYear());
}

function addPrettyDateToScroll(date){
    date = date.split(" ")
    date = date[1].split("/")
    date = (date[0]+"/"+date[1]+"/"+date[2])
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

function shareOnWall(){    
    var event_selected_id = $(".wall_btn.selected img").attr("alt");
    if(event_selected_id != null){
        channel.trigger(PUSHER_EVENT_DREAM_REQUESTED, {"dreamId" : parseInt(actual_dream_id), "eventId" : event_selected_id });  
    }
    console.log({"dreamId" : parseInt(actual_dream_id), "eventId" : event_selected_id });
}

function selectWall(e){
    $('#walls_btn').find('.wall_btn').each(function() {
        if($(this).hasClass("selected")){
            $(this).removeClass("selected");
        }
    });
    $(e).addClass("selected");
}


function renderSharingBtns(){
    var walls_btn = '<div id="walls_btn">';

    for(var i= 0; i < events.length; i++){
        walls_btn += '<div class="wall_btn"><p class="title">'+events[i]["name"]+'</p><img alt="'+events[i]["id"]+'" src="events/'+events[i]["image"]+'" /><p class="description">'+events[i]["description"]+'</p><p><a target="_blank" href="'+events[i]["address_url"]+'">where?</a></p></div>';
    }
    walls_btn += '</div>'

    return '<div id="detailsandshare"><div id="shares"><span id="sharefb"></span><a href="#myModal" role="button" data-toggle="modal"><span id="sharewall"></span></a><span id="moderatetext">En cours de validation</span><span id="notvalidatetext">Dessin desaprouvé</span></div><span class="details"></span></div>'
         + '<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-header"><img src="frontend/img/projo_big.png" />Projeter sur la paroi</div><div class="modal-body"><p>Choisir le type de paroi:</p>'+walls_btn+'</div><div class="modal-footer"><button data-dismiss="modal"><span id="modal_back_btn"></button></span><button data-dismiss="modal"><span id="modal_ok_btn"></span></button></div></div>';
}
