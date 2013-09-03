/**
 *
 * + Customization
 * + Extension
 * +
 */

var actual_dream_id = 0;


YUI.add("stalker-webslider", function(Y) {
    YUI_config.stalkerbase = YUI_config.stalkerbase || "";

    var strip_width;

    var walls_btn = '<div id="walls_btn">';
    for(var i= 0; i < events.length; i++){
        walls_btn += '<div class="wall_btn"><img alt="'+events[i]["id"]+'" src="events/'+events[i]["image"]+'" /><p>'+events[i]["name"]+'</p></div>';
    }
    walls_btn += '</div>'

    Y.namespace("Stalker").WebSlider = Y.Base.create("stalker-slider", Y.Stalker.Slider, [], {
        CONTENT_TEMPLATE: '<div>'
                + '<div id="detailsandshare"><div id="shares"><span id="sharefb"></span><a href="#myModal" role="button" data-toggle="modal"><span id="sharewall"></span></a></div><span class="details"></span></div>'
                + '<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-header"><img src="frontend/img/projo_big.png" />Projeter sur la paroi</div><div class="modal-body"><p>Choisir le type de paroi:</p>'+walls_btn+'</div><div class="modal-footer"><button data-dismiss="modal"><span id="modal_back_btn"></button></span><button data-dismiss="modal"><span id="modal_ok_btn"></span></button></div></div>'
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
                var channel = Y.Stalker.Pusher.getChanelDreamRequested();
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
                    $('#walls_btn').find('.wall_btn').each(function() {
                        if($(this).hasClass("selected")){
                            $(this).removeClass("selected");
                        }
                    });
                    $(this).addClass("selected");
                });
                $(".modal-footer").on("click", "#modal_ok_btn", function(e){
                    var event_selected_id = $(".wall_btn.selected img").attr("alt");
                    if(event_selected_id != null){
                        channel.trigger(PUSHER_EVENT_DREAM_REQUESTED, {"dreamId" : parseInt(actual_dream_id), "eventId" : event_selected_id });  
                    }
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
            }
        }
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
    $.fn.slider_web = function(idDreamRequested,serviceUrl) {
        //DREAMS_SERVICE_URL = window.location.protocol+'//'+window.location.host + "/services/dreamsvalidated";
        DREAMS_SERVICE_URL = serviceUrl;
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

            $('body').append('<div id="sink"><div id="nav-bar"><div id="status"></div></div><div id="preview-image"></div><div id="preview-strip"></div><div id="preview-strip-nowebgl"></div></div>')
            $('body').append('<div id="detailsandshare"><div id="shares"><span id="sharefb"></span><a href="#myModal" role="button" data-toggle="modal"><span id="sharewall"></span></a></div><span class="details"></span></div>')
            $('body').append('<div id="simpleImgSlider"></div>')
            $('#sink').show();
            var pusher = new Pusher(PUSHER_API_KEY);
            channel = pusher.subscribe(PUSHER_CHANEL_DREAM_REQUESTED);
            $("#sharefb").on("click",function(){
                shareOnFacebook();
            })
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
            console.log("startImgSlider")
            $("#simpleImgSlider img").remove();
            var li = $(".dreamslist li").get(0)
            addPrettyDateToScroll(li.title)
            dreamselected(0)

            showLegend(li.info)
            var nameImg = ($(".dreamslist img").get(0).id);
            console.log(nameImg)
            var img = new Image();
            img.src = PATH_TO_DREAMS + nameImg + DREAM_EXTENSION;
            img.id = 0;
            console.log("img.src "+img.src)
            img.onload = function() {
                console.log("loaded")
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
            var li = imgClicked.parent().get(0);
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
            if (indexCurrentImg < dreamsAlbum.length - 1) {
                indexCurrentImg = parseInt(indexCurrentImg);
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

        $("#preview-strip-nowebgl").on("click","li",function(e){
            var node = e.currentTarget;
            showLegend(node.info)
        })
        

        
        $("#shares").on("click", "#sharewall", function(e){
            actual_dream_id = $('#preview-strip li.dreamselected img').attr("alt");
        });
        
        $("#walls_btn").on("click",".wall_btn",function(e){
            $('#walls_btn').find('.wall_btn').each(function() {
                if($(this).hasClass("selected")){
                    $(this).removeClass("selected");
                }
            });
            $(this).addClass("selected");
        });
        
        $(".modal-footer").on("click", "#modal_ok_btn", function(e){
            var event_selected_id = $(".wall_btn.selected img").attr("alt");
            if(event_selected_id != null){
                channel.trigger(PUSHER_EVENT_DREAM_REQUESTED, {"dreamId" : parseInt(actual_dream_id), "eventId" : event_selected_id });  
            }
        });

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
        $('#preview-strip-nowebgl ul .dreamselected').removeClass("dreamselected");
            var c = $('#preview-strip-nowebgl>ul>li').get(index);
            c.className = c.className + "dreamselected";
        }

    }   

}(jQuery));

function previewStripHeightAdjust(){
        var winH = $(window).height()-40;
        $('#preview-strip').height(winH)
        $('#preview-strip-nowebgl').height(winH)
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
function shareOnFacebook(){

    var imageToShare = $('.dreamselected img');
    imageToShare = imageToShare[0].src;

    FB.ui(
      {
       method: 'feed',
       name: 'Stalker Exhibition. Draw your dreams',
       caption: 'Un sous titre ici?!',
       description: ( 'Description sur l\'expo?'),
       link: 'http://193.134.221.115/web_slider',
       picture: imageToShare,
      },
      function(response) {
        if (response && response.post_id) {
          alert('Post was published.');
        } else {
          alert('Post was not published.');
        }
      }
    );
}
