// sources
var flickr = true;
var imgur = true;

// options
var keyword = 'landscape';
var speed = 5000;


$(document).ready(function () {

    // global vars
    var imagesArray = [];
    var globalCounter = 0;
    var renderInterval = null;
    var renderTimeout = null;
    var globalTimer = 0;
    var globalTimerRest = 0;

    var initApp = {
        init: function () {
            this.getDom();
            this.bindEvents();
        },
        getDom: function () {
            this.getButton = $('#getButton');
            this.input = $('#input');
            this.body = $('body');
        },
        bindEvents: function () {
            this.getButton.on('click', function () {
                controller.handleImageRequest();
            });

            this.input.on('keyup', function (e) {
                if (e.keyCode == 13) {
                    controller.handleImageRequest();
                }
            });
        },
    };

    var controller = {
        input: null,
        handleImageRequest: function () {
            renderImages.reset();

            //refresh searchTerm
            this.input = $('#input');

            if (initApp.input.val() !== '') {
                keyword = initApp.input.val();
            }

            getImages.init();

            initApp.body.on('touchstart mousedown', function (e) {
                if (e.target !== initApp.body[0])
                    return;

                options.pause();
            });
            initApp.body.on('touchend mouseup', function (e) {
                if (e.target !== initApp.body[0])
                    return;

                options.pause(true);
            });
            
        }
    }

    var getImages = {
        init: function () {
            if (imgur)
                this.getImgur();
            if (flickr)
                this.getFlickr();
        },
        getImgur: function () {

            $.ajax({
                url: "https://api.imgur.com/3/gallery/search/?q=" + keyword,
                type: "GET",
                headers: { "Authorization": "Client-ID 742860e56a4ce17" },
                success: function (resultData) {

                    if (resultData.hasOwnProperty('data') && resultData.data.length > 0) {

                        for (var dataCounter = 0; dataCounter < resultData.data.length; dataCounter++) {

                            if (resultData.data[dataCounter].is_album === true) {

                                for (var imageCounter = 0; imageCounter < resultData.data[dataCounter].images.length; imageCounter++) {
                                    imagesArray.push(resultData.data[dataCounter].images[imageCounter].link);
                                }
                            }
                            else {
                                imagesArray.push(resultData.data[dataCounter].link);
                            }
                        }
                    }
                    else {
                        console.log('no data from imgur');
                    }
                    if (imagesArray.length > 0 && !renderInterval) {
                        renderImages.init(true);
                    }
                }
            });
        },
        getFlickr: function () {
            $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
            {
                tags: keyword,
                tagmode: "any",
                format: "json"
            },
            function (data) {
                for (var i = 0; i < data.items.length; i++) {
                    imagesArray.push(data.items[i].media.m.replace("_m", "_b"));
                }

                if (imagesArray.length > 0 && !renderInterval) {
                    renderImages.init(true);
                }
            });
        }
    };

    var renderImages = {
        init: function (paused) {
            var restTime = 0;
            // beeing able to init when paused
            if (paused) {
                restTime = globalTimerRest - globalTimer;
            }

            var renderTimeout = setTimeout(function() {

                renderImages.render();

                renderInterval = setInterval(function () {
                    renderImages.render();
                }, speed);

            }, restTime ? speed-restTime : 0);
        },
        render: function () {

            $('#time').removeClass('running');  
            $('body').css('background-image', "url('" + imagesArray[globalCounter] + "')");

            globalCounter++;
            globalTimer = Date.now();

            setTimeout(function() {
                $('#time').addClass('running');  
            },50)

            if (imagesArray.length <= globalCounter) {
                renderImages.reset();
            }
        },
        reset: function () {
            $('imagePane1').css('background-image', "none");
            clearInterval(renderInterval);
            clearTimeout(renderTimeout);
            imagesArray = [];
            renderInterval = null;
            globalCounter = 0;

            initApp.body.off();
        }
    };

    var options = {
        pause: function (paused) {
            if (paused) {
                $('#time').css('animation','');
                renderImages.init(paused);
            }
            else {
                clearInterval(renderInterval);
                clearTimeout(renderTimeout);
                globalTimerRest = Date.now();
                $('#time').css('width',$('#time').css('width'));
                $('#time').css('animation','none');
            }
        }
    };

    initApp.init();
});
