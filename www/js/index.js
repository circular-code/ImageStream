// sources
var flickr = true;
var imgur = true;

// options
var keyword = 'landscape';


$(document).ready(function () {

    /* global vars
    var imagesArray = [];
    var globalCounter = 0;
    var renderInterval = null;
    var renderTimeout = null;
    var globalTimer = 0;
    var globalTimerRest = 0;
    var elapsedTime = 0;
    */

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
            handleDrawingImages.reset();

            //refresh searchTerm
            this.input = $('#input');

            if (initApp.input.val() !== '') {
                keyword = initApp.input.val();
            }

            getImages.init();

            initApp.body.on('touchstart mousedown', function (e) {
                if (e.target !== initApp.body[0])
                    return;

                handleDrawingImages.pause(true);
            });
            initApp.body.on('touchend mouseup', function (e) {
                if (e.target !== initApp.body[0])
                    return;

                handleDrawingImages.pause();
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
                    if (imagesArray.length > 0 && !handleDrawingImages.targetTime) {
                        handleDrawingImages.init(true);
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

                if (imagesArray.length > 0 && !handleDrawingImages.targetTime) {
                    handleDrawingImages.init(true);
                }
            });
        }
    };

    var handleDrawingImages = {
        init: function () {
            this.varReset;
            this.targetTime = Date.now() - 1;
            this.checkInterval = setInterval(function () {
                handleDrawingImages.check();
            },10)
        },
        varReset: function (){
            this.duration = 5000;
            this.targetTime = 0;
            this.downTime = 0;
            this.pressed = false;
            this.checkInterval = false;
        },
        check: function () {
            if(!this.pressed && Date.now() > this.targetTime){
                this.render();
            }
        },
        render: function () {
            this.targetTime += this.duration;

            $('#time').removeClass('running');
            $('body').css('background-image', "url('" + imagesArray[globalCounter] + "')");

            globalCounter++;

            setTimeout(function() {
                $('#time').addClass('running');  
            },20)

            if (imagesArray.length <= globalCounter) {
                handleDrawingImages.reset();
            }
        },
        reset: function () {
            $('imagePane1').css('background-image', "none");
            clearInterval(this.checkInterval);
            this.varReset();
            imagesArray = [];
            globalCounter = 0;
            initApp.body.off();
        },
        pause: function (paused) {
            if (paused) {
                this.downTime = Date.now();
                this.pressed = true;
            }
            else {
                this.targetTime += Date.now() - this.downTime;
                this.pressed = false;

                $('#time').css('width',$('#time').css('width'));
                $('#time').css('transition','none');
            }
            
        },
        next: function () {
            this.render();
            this.targetTime = Date.now() + this.duration;
        }
    };

    initApp.init();
});
