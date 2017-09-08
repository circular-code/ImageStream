$(document).ready(function()
{
   var imagesArray = [];
   var globalCounter = 0;
   var keyword = 'landscape';
   var renderInterval = null;

   var initApp = {
      init: function() 
      {
         this.getDom();
         this.bindEvents();
      },
      getDom: function() 
      {
         this.getButton = $('#getButton');
         this.input = $('#input');
         this.body = $('body');
      },
      bindEvents: function() 
      {
         this.getButton.on('click', function() 
         {
            initApp.handleImageRequest();
         });
         
         this.input.on('keyup', function(e) 
         {
            if (e.keyCode == 13)
            {
               initApp.handleImageRequest();
            }
         });
      },
      handleImageRequest: function() 
      {
         // reset Images
         renderImages.reset();

         //refresh searchTerm
         this.input = $('#input');

         if (initApp.input.val() !== ''){
            keyword = initApp.input.val();
         }

         getImages.init();

         this.body.on('touchstart', function(e) 
         {
            if (e.target !== initApp.body[0])
               return;

            options.pause();
         });
         this.body.on('touchend', function(e) 
         {
            if (e.target !== initApp.body[0])
               return;

            options.pause();
         });
      }
   };

   var getImages = {
      init: function() 
      {
         this.getImgur();
         this.getFlickr();
      },
      getImgur: function() {

         $.ajax({
            url: "https://api.imgur.com/3/gallery/search/?q=" + keyword,
            type: "GET",
            headers: {"Authorization": "Client-ID 742860e56a4ce17"},
            success: function(resultData) {

               if (resultData.hasOwnProperty('data') && resultData.data.length > 0) 
               {

                  for (var dataCounter = 0; dataCounter < resultData.data.length; dataCounter++) 
                  {

                     if (resultData.data[dataCounter].is_album === true) 
                     {

                        for (var imageCounter = 0; imageCounter < resultData.data[dataCounter].images.length; imageCounter++) 
                        {
                           imagesArray.push(resultData.data[dataCounter].images[imageCounter].link);
                        }
                     }
                     else 
                     {
                        imagesArray.push(resultData.data[dataCounter].link);
                     }
                  }
               }
               else {
                  console.log('no data');
               }
               if (imagesArray.length > 0 && !renderInterval) 
               {
                  renderImages.init(true);
               }
            }
         });
      },
      getFlickr: function() {
         $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
         {
            tags: keyword,
            tagmode: "any",
            format: "json"
         },
         function(data) {
            for (var i = 0; i < data.items.length; i++) 
            {
               imagesArray.push(data.items[i].media.m.replace("_m", "_b"));
            }

            if (imagesArray.length > 0 && !renderInterval) 
            {
               renderImages.init(true);
            }
         });
      }
   };
   var renderImages = {
      init: function(paused) {

         // beeing able to init when paused
         if (paused)
         {
            renderImages.render();
         }

         renderInterval = setInterval(function() 
         {
            renderImages.render();
         },3000);
      },
      render: function() 
      {
         $('body').css('background-image', "url('" + imagesArray[globalCounter] + "')");
         //$('imagePane2').css('background-image', "url('" + imagesArray[globalCounter+1] + "')");
         //$('imagePane3').css('background-image', "url('" + imagesArray[globalCounter+2] + "')");
         globalCounter+=3;

         if (imagesArray.length <= globalCounter) 
         {
            renderImages.reset();
         }
      },
      reset: function() 
      {
         $('imagePane1').css('background-image', "none");
         //$('imagePane2').css('background-image', "none");
         //$('imagePane3').css('background-image', "none");
         clearInterval(renderInterval);
         imagesArray = [];
         renderInterval = null;
         globalCounter = 0;

         initApp.body.off('click');
      }
   };

   var options = {
      paused: false,
      pause: function() 
      {
         if (this.paused) 
         {
            renderImages.init(this.paused);
            this.paused = false;
         }
         else 
         {
            clearInterval(renderInterval);
            this.paused = true;
         }
      }
   };

   initApp.init();
});
