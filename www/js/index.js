//global accesible vars

// sources
var flickr = true;
var imgur = true;

// options
var keyword = 'landscape';

$(document).ready(function () {

    //global unaccessible vars
    var imagesArray = [];
    var globalCounter = 0;

    var initApp = {
        init: function () {
            this.getDom();
            this.bindSwipeDetection();
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
            this.body.touchswipe({
                swipeLeft: function() { 
                    handleDrawingImages.next();
                },
                swipeRight: function() {
                    handleDrawingImages.prev();
                    },
                swipeUp: function() { 
                    window.plugins.socialsharing.share('Shared via ImageStream', null /* img */, imagesArray[globalCounter], function() {console.log('share ok')}, function(errormsg){alert(errormsg)})
                 },
                swipeDown: function() { 
                    downloadFiles.downloadFile(imagesArray[globalCounter],'Download',keyword + Date.now());
                },
                min_move_x: 50,
                min_move_y: 50,
                preventDefaultEvents: true
           });
        },
        bindSwipeDetection: function() {
            (function($) { 
                $.fn.touchswipe = function(settings) {
                  var config = {
                         min_move_x: 20,
                         min_move_y: 20,
                          swipeLeft: function() { },
                          swipeRight: function() { },
                          swipeUp: function() { },
                          swipeDown: function() { },
                         preventDefaultEvents: true
                  };
                  
                  if (settings) $.extend(config, settings);
              
                  this.each(function() {
                      var startX;
                      var startY;
                      var isMoving = false;
             
                      function cancelTouch() {
                          this.removeEventListener('touchmove', onTouchMove);
                          startX = null;
                          isMoving = false;
                      }	
                      
                      function onTouchMove(e) {
                          if(config.preventDefaultEvents) {
                              e.preventDefault();
                          }
                          if(isMoving) {
                              var x = e.touches[0].pageX;
                              var y = e.touches[0].pageY;
                              var dx = startX - x;
                              var dy = startY - y;
                              if(Math.abs(dx) >= config.min_move_x) {
                                 cancelTouch();
                                 if(dx > 0) {
                                     config.swipeLeft();
                                 }
                                 else {
                                     config.swipeRight();
                                 }
                              }
                              else if(Math.abs(dy) >= config.min_move_y) {
                                     cancelTouch();
                                     if(dy > 0) {
                                        config.swipeUp();
                                     }
                                     else {
                                        config.swipeDown();
                                     }
                                  }
                          }
                      }
                      
                      function onTouchStart(e)
                      {
                          if (e.touches.length == 1) {
                              startX = e.touches[0].pageX;
                              startY = e.touches[0].pageY;
                              isMoving = true;
                              this.addEventListener('touchmove', onTouchMove, false);
                          }
                      }    	 
                      if ('ontouchstart' in document.documentElement) {
                          this.addEventListener('touchstart', onTouchStart, false);
                      }
                  });
              
                  return this;
                };
              
              })(jQuery);
        }
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

    var downloadFiles = {
        downloadFile : function (URL, Folder_Name, File_Name) {
            //Parameters mismatch check
            if (URL == null && Folder_Name == null && File_Name == null) {
                return;
            }
            else {
                //checking Internet connection availablity
                var networkState = navigator.connection.type;
                if (networkState == Connection.NONE) {
                    return;
                } else {
                    downloadFiles.download(URL, Folder_Name, File_Name); //If available download function call
                }
            }
        },
        download : function(URL, Folder_Name, File_Name) {
                //step to request a file system 
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);
                
                function fileSystemSuccess(fileSystem) {
                    var download_link = encodeURI(URL);
                    ext = download_link.substr(download_link.lastIndexOf('.') + 1); //Get extension of URL
                
                    var directoryEntry = fileSystem.root; // to get root path of directory
                    directoryEntry.getDirectory(Folder_Name, { create: true, exclusive: false }, onDirectorySuccess, onDirectoryFail); // creating folder in sdcard
                    var rootdir = fileSystem.root;
                    var fp = rootdir.toURL();  // Returns Fulpath of local directory
                
                    fp = fp + "/" + Folder_Name + "/" + File_Name + "." + ext; // fullpath and name of the file which we want to give
                    // download function call
                    downloadFiles.filetransfer(download_link, fp);
                }
                
                function onDirectorySuccess(parent) {
                    // Directory created successfuly
                }
                
                function onDirectoryFail(error) {
                    //Error while creating directory
                    alert("Unable to create new directory: " + error.code);
                }
                
                function fileSystemFail(evt) {
                //Unable to access file system
                alert(evt.target.error.code);
                }
            },
            filetransfer: function (download_link, fp) {
                var fileTransfer = new FileTransfer();
                // File download function with URL and local path
                fileTransfer.download(download_link, fp,
                    function (entry) {
                        alert("download complete: " + entry.fullPath);
                    },
                    function (error) {
                        //Download abort errors or download failed errors
                        alert("download error source " + error.source);
                        //alert("download error target " + error.target);
                        //alert("upload error code" + error.code);
                    }
                );
            }
    }

    var handleDrawingImages = {
        init: function () {
            this.varReset;
            this.targetTime = Date.now() - 1;
            this.checkInterval = setInterval(function () {
                handleDrawingImages.check();
            },10);
        },
        varReset: function (){
            this.iterationTime = 5000;
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
            this.targetTime += this.iterationTime;
            this.timeline("run");
            $('body').css('background-image', "url('" + imagesArray[globalCounter] + "')");
            globalCounter++;

            if (imagesArray.length <= globalCounter) {
                handleDrawingImages.reset();
            }
        },
        reset: function () {
            this.timeline("reset");
            clearInterval(this.checkInterval);
            $('imagePane1').css('background-image', "none");
            this.varReset();
            imagesArray = [];
            globalCounter = 0;
            initApp.body.off();
        },
        pause: function (paused) {
            if (paused) {
                this.downTime = Date.now();
                this.pressed = true;
                this.timeline("pause");
            }
            else {
                this.targetTime += Date.now() - this.downTime;
                this.pressed = false;
                this.timeline("rerun");
            }
        },
        timeline: function(action) {
            var timeline = $('#time');
            switch (action) {
                case "run": 
                    timeline.removeClass('running');
                    timeline.css('width','');
                    timeline.css('transition','');
                    setTimeout(function() {
                       timeline.addClass('running');  
                    },20);
                    break;
                case "pause":
                    timeline.css('width',timeline.css('width'));
                    timeline.css('transition','none');
                    break;
                case "reset": 
                   timeline.removeClass('running');
                    break;
                case "rerun": 
                    timeline.css('transition','width ' + (this.targetTime - Date.now()) + 'ms linear');
                    timeline.css('width','');
                    break;
            }
        },
        next: function () {
            if(globalCounter === 0) {
                alert('keine Bilder vorhanden');
                return;
            }
            else{
                this.render();
                this.targetTime = Date.now() + this.iterationTime;
            } 
        },
        prev: function () {
            if (globalCounter > 1){
                globalCounter -= 2;
            }
            else {
                alert('keine Bilder vorhanden');
                return;
            }

            this.render();
            this.targetTime = Date.now() + this.iterationTime;
        }
    };

    initApp.init();
});
