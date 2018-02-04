//array of polygon point coordinates for SG's boundaries

    var sgLatLongs = [
      [1.44387,103.7651],
      [1.44307,103.74224],
      [1.45464,103.71801],
      [1.43177,103.68739],
      [1.32975,103.66185],
      [1.35635,103.63687],
      [1.2599,103.60752],
      [1.26384,103.64133],
      [1.29808,103.69326],
      [1.29323,103.75562],
      [1.23521,103.8328],
      [1.29955,103.92495],
      [1.31241,104.02053],
      [1.41864,103.9917],
      [1.42233,103.91617],
      [1.43516,103.87772],
      [1.47246,103.83034],
      [1.47224,103.80081]

/*      [1.35909,103.64013],
      [1.30074,103.60957],
      [1.21562,103.59893],
      [1.17186,103.82861],
      [1.26668,104.02139],
      [1.37002,104.08825],
      [1.42943,104.08369],
      [1.44528,104.03202],
      [1.42345,103.99871],
      [1.42233,103.95956],
      [1.43109,103.93344],
      [1.42663,103.89494],
      [1.46714,103.8399],
      [1.47403,103.80535],
      [1.4576,103.77745],
      [1.44463,103.75447],
      [1.45844,103.71776],
      [1.44213,103.69514],
      [1.43147,103.67738],
      [1.41701,103.66931],
      [1.4032,103.65729]*/ ]

//returns random number within a range
    function getRandomInRange(from, to, fixed) {
      return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
      // .toFixed() returns string, so ' * 1' is a trick to convert to number
    }

//checks if a given (x,y) point coordinate is within a given array of polygon coordinates
    function checkPointInPoly(point, poly) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

      var x = point[0], y = point[1];

      var inside = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          var xi = poly[i][0], yi = poly[i][1];
          var xj = poly[j][0], yj = poly[j][1];

          var intersect = ((yi > y) != (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }

      return inside;
    };

    var currentPosHolder = [];

//gets new position coordinates randomly within polygon
    function getNewPos() {
      currentPosHolder = [getRandomInRange(1.30000,1.475000,6),getRandomInRange(103.550000,104.100000,6)];
      while (checkPointInPoly(currentPosHolder, sgLatLongs) !== true) {
        currentPosHolder = [getRandomInRange(1.30000,1.475000,6),getRandomInRange(103.550000,104.100000,6)];
      }
      return currentPosHolder;
    };

    var resultsArray = [
      [50000, "Are you sure you're still in SG??"],
      [40000, "At this distance, you might end up lost in JB..."],
      [30000, "Getting there. At least you probably won't confuse Bukit Panjang with Bukit Merah. But Bukit Batok and Bukit Timah might be another story!"],
      [20000, "Good effort. Maybe your friends will finally trust you to navigate after another 100 tries. #mylifestory"],
      [10000, "Great job! At this distance, you can probably run to your original position in 2 hours. Maybe 10min with Grab."],
      [5000, "You're pretty good! There's still room to improve, but...please share your navigating tips with me!"],
      [1000, "I'm pretty sure you're Google Maps."],
      [0, "No human could be this accurate. You're either Waze or a robot...Amazing job!"]
    ];

    var panoPos = [];
    var panoPosLiteral = "";
    var panorama = "";
    var map = "";
    var markerPos = [];
    var markerPosLiteral = "";
    var posMoved = -1;

    function initPano() {
      // Note: constructed panorama objects have visible: true
      // set by default.
      var sv = new google.maps.StreetViewService();
      getNewPos();

      sv.getPanorama({location: {lat: currentPosHolder[0], lng:currentPosHolder[1]}, radius: 50}, processSVData);
      //window.alert("getPanorama initiated")
      function processSVData(data, status) {
        //window.alert("running processSVData")
        //window.alert("status: " + status)
        //window.alert("data: " + data + "location: " + data.location.latLng)
        if (status === 'OK') {
          var panorama = new google.maps.StreetViewPanorama(
              document.getElementById('streetmap'), {
                position: {lat: currentPosHolder[0], lng: currentPosHolder[1]},
                linksControl: false,
                enableCloseButton: false,
                addressControl: false,
                showRoadLabels: false,
                zoomControl: true,
                zoomControlOptions: {position: google.maps.ControlPosition.LEFT_CENTER},
                panControl: true,
                panControlOptions: {position: google.maps.ControlPosition.LEFT_CENTER},
                fullscreenControl: false,
                motionTrackingControlOptions: {position: google.maps.ControlPosition.LEFT_CENTER}

          });

          panoPos = [panorama.getPosition().lat(), panorama.getPosition().lng()];
          panoPosLiteral = panorama.getPosition();


          google.maps.event.addListener(panorama, 'position_changed', function(event) {
            posMoved += 1;

            return posMoved;
          });

          $(document).ready(function() {

              $('#toolbar-size').click(function() {
                if ($('.map-container').hasClass('open')) {
                  $('.map-container').removeClass('open');
                  $('#toolbar-size').html('<i class="fa fa-expand"></i>');
                } else {
                  $('.map-container').addClass('open');
                  google.maps.event.trigger(map, 'resize')
                  $('#toolbar-size').html('<i class="fa fa-compress"></i>');
                };
              });

              $('.btn-origin').click(function() {
                panorama.setPosition(panoPosLiteral);
                posMoved -= 2;

              });

            });

        } else {
          getNewPos();
          sv.getPanorama({location: {lat:currentPosHolder[0], lng:currentPosHolder[1]}, radius: 50}, processSVData);
        }


        map = new google.maps.Map(document.getElementById('sgmap'), {
        zoom: 10,
        center: {lat: 1.3521, lng: 103.8198 },
        clickableicons: false,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {position: google.maps.ControlPosition.TOP_RIGHT},
        draggableCursor: 'crosshair',
        clickableIcons: false
        });

        var marker;

        google.maps.event.addListener(map, 'click', function(event) {
           placeMarker(event.latLng);
           markerPos = [event.latLng.lat(), event.latLng.lng()];
           markerPosLiteral = event.latLng
           distance = google.maps.geometry.spherical.computeDistanceBetween(markerPosLiteral, panoPosLiteral);
           distance = Math.round(distance);
           distance = distance + posMoved*1000;

           function retrieveResults() {
            for (var i = 0; i < resultsArray.length; i++) {
              if (resultsArray[i][0] <= distance) {
                return resultsArray[i][1];
                break;
              };
            };
          };


          if (posMoved > 0) {
            $('.penalty-text').fadeIn(0);
            $('.penalty-m').text(posMoved*1000);
            $('.penalty-number').text(posMoved);
          }

          $(document).ready(function() {
            $(".score-text").text(distance);
            $(".score-liner").text(retrieveResults());

            $('.btn-guess').click(function() {
              $('.results-container').fadeIn('fast');
            });

            $('.close-results').click(function() {
              $('.results-container').fadeOut(0);
            });
        });

        });

        function placeMarker(location) {
          if (marker == null) {
            marker = new google.maps.Marker({
                  position: location,
                  map: map
              });
          } else {
            marker.setPosition(location);
          }
        }

      }
    }

    var instructionsArray = [
      "Welcome to <span class=\"lost\">Lost</span>, a geo game based on Google.",
      "The situation: You're heading home in a bus, chatting on the phone with a friend. You alight and start walking.",
      "When the phone call ends, you look around and realise that you're hopelessly lost. Where are you?",
      "Explore your surroundings and place a marker on the map when you figure out your location! But be warned...every time you move from your current location, there'll be a penalty!"
    ]

    var instructionsCount = 0

    $(document).ready(function() {
      $('.btn-next').click(function() {
        if (instructionsCount<2) {
          instructionsCount++;
          $('.instructions-text').text(instructionsArray[instructionsCount]);
        } else if (instructionsCount==2) {
          instructionsCount++;
          $('.instructions-text').text(instructionsArray[instructionsCount]);
          $('.btn-next').text("Start Game");
        } else {
          instructionsCount = 0;
          $('.instructions-container').fadeOut('fast');
          $('.fa-question-circle').fadeIn('fast');
          $('.instructions-text').html(instructionsArray[instructionsCount]);
          $('.btn-next').html("Next<i class='fa fa-long-arrow-right'></i>");
        }
      });

      $('.fa-question-circle').click(function() {
        $('.instructions-container').fadeIn('fast');
        $('.fa-question-circle').fadeOut('fast');
      });

      $('.close-instructions').click(function() {
        $('.instructions-container').fadeOut('fast');
        $('.fa-question-circle').fadeIn('fast');
      })

    });
