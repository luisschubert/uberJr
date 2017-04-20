//function updateDriverInfo(driverName, carModel, carColor,plates, arrivalTime,cost){
function toggleFoundDriver(driverName, carModel, carColor, plates, pickupTime) {
    console.log("toggleFoundDriver right now");
    $('.sidebar-state').removeClass('active'); //disables any active
    $('#driver-found').addClass('active');
    $('.driver-name').html(driverName);
    $('.car-model').html(carModel);
    $('.car-color').html(carColor);
    $('.car-plates').html(plates);
    $('.time').html(pickupTime);
    //$('.cost').html(cost);

    // remove dummy drivers here...
}

function toggleNoDrivers() {
  console.log("toggleNoDrivers right now");
    $('.sidebar-state').removeClass('active'); //disables any active
    $('#no-drivers').addClass('active');
    directionsDisplay.setMap(null);
}

function toggleRideCompleted() {
  console.log("toggleRideCompleted right now");
    $("body.rider").removeClass('side-bar-active');
    $(".overlay.destination").show();
    directionsDisplay.setMap(null);
}

var counter = 1;
var d_lat;
var d_lng;
function updateDriverMarkers() {
  console.log("<NITYAM> .. updateDriverMarkers right now");
  // remove the current marker
  // check database(rides table) here by ajax
  $.ajax({
      url: '/api/checkDriverLocation',
      type: 'POST',
      // data: formData, // formdata notDefined
      success: function(data) {
          if (data == 'none') {
              console.log('Driver coords not found... check the RIDERS table connection');
          } else {
            console.log("Inside updateDriverMarkers' Ajax command");
            d_lat = data.dest_lat;
            d_lng = data.dest_long;
          }
      }
  });
  if (typeof(d_lat) == "undefined"){
    console.log("UNDEFINED DRIVER's LOCATION");
  }else {
    console.log("driver lat outside :", d_lat);
    console.log("driver lng outside:", d_lng);
  }
  console.log("updating the marker on new location");
  // update driver location or the marker

/*

    console.log("updateDriverMarkers rightnow");
    console.log("updating location " + counter);
    for (var i = 0; i < curMarkers.length; i++) {
        console.log(curMarkers[i]);
        driverslocations[i][1] = driverslocations[i][1] + 0.005;
        driverslocations[i][2] = driverslocations[i][2] + 0.005;
        curMarkers[i].setPosition(new google.maps.LatLng(driverslocations[i][1], driverslocations[i][2]));
    }
    counter = counter + 1;
    setTimeout(updateDriverMarkers, 5000);
    */
}

function getCurrentAddress(lat, lng) {
  console.log("getCurrentAddress of the rider");
    $.ajax({
        url:'https://maps.googleapis.com/maps/api/geocode/json?latlng='+ lat + ',' + lng + '&key=AIzaSyBnXUp2Txy1C2OyYp0crd8iyaIDSb-N8oU',
        method: 'POST',
        success: function(data,status){
          console.log(status + " : " + data);
          //get the address from the response object
          address = data.results[0].formatted_address;
          //insert the addres
          $('#originRider').val(address);
          //removes the placeholder text
          //$('#originRider').removeAttr('placeholder');
        }
    });
}

function showAvailableDrivers(lat, lng) {
  console.log("showAvailableDrivers rightnow");
    $.ajax({
        url:'api/getDrivers',
        type: 'POST',
        data:{
          'lat': lat,
          'lng': lng,
        },
        success: function(data, status) {
          console.log(status);
          console.log(data);
        }
    });
}

function trackPosition() {
  console.log("trackPosition of the rider");
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updateLocation);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function requestDriver(origin, destination) {
  console.log("requestDriver rightnow");
    console.log("called requestDriver");
    $.ajax({
        url:'api/requestdriver',
        type: 'POST',
        data: {
          'origin': origin,
          'destination': destination
        },
        success: function(data, status) {
          if (data == 'No drivers available. Check back later!') {
              toggleNoDrivers();
          } else {
              rideCompleted = false;
              checkRideCompleted();
              console.log(status);
              console.log(data);
              toggleFoundDriver(data.name, data.make, data.color, data.license_plate, data.pickup_eta);
          }
        }
    });
}

var rideCompleted;
var rideCompletedTimeout;
function checkRideCompleted(){
  console.log("checkRideCompleted right now");
    $.ajax({
        url:'api/checkRideCompleted',
        type: 'POST',
        success: function(data, status) {
          if (data == 'true') {
              clearTimeout(rideCompletedTimeout);
              rideCompleted = true;
              console.log("ride completed");
              toggleRideCompleted();
          } else {
              updateDriverMarkers();
              console.log("ride is still in progress");
          }
        }
    });
    if (!rideCompleted) {
        clearTimeout(rideCompletedTimeout);
        rideCompletedTimeout = setTimeout(checkRideCompleted, 10000);
    }
}

function requestRide() {
    console.log("requesting ride rightnow");
    var originA = document.getElementById('originRider').value;
    var destinationA = document.getElementById('destinationRider').value;
    var formData = {
        'origin': originA,
        'destination': destinationA
    };
    $.ajax({
        url: '/api/rider',
        type: 'POST',
        data: formData,
        success: function(data, status) {
            requestDriver(originA, destinationA);
            console.log(data);
            service.getDistanceMatrix({
                origins: [originA],
                destinations: [destinationA],
                travelMode: 'DRIVING',
                drivingOptions: {
                    departureTime: currentTime,
                    trafficModel: google.maps.TrafficModel.BEST_GUESS
                },
                unitSystem: google.maps.UnitSystem.IMPERIAL,
                avoidHighways: false,
                avoidTolls: false
            }, function(response, status) {
                if (status !== 'OK') {
                    alert('Error was: ' + status);
                } else {
                    var originList = response.originAddresses;
                    var destinationList = response.destinationAddresses;
                    deleteMarkers(markersArray);
                    var showGeocodedAddressOnMap = function() {
                        return function(results, status) {
                            if (status === 'OK') {
                                map.fitBounds(bounds.extend(results[0].geometry.location));
                            } else {
                                alert('Geocode was not successful due to: ' + status);
                            }
                        };
                    };

                    for (var i = 0; i < originList.length; i++) {
                        var results = response.rows[i].elements;
                        geocoder.geocode({
                                'address': originList[i]
                            },
                            showGeocodedAddressOnMap(false));
                        for (var j = 0; j < results.length; j++) {
                            geocoder.geocode({
                                    'address': destinationList[j]
                                },
                                showGeocodedAddressOnMap(true));
                            /*outputDiv.innerHTML += originList[i] + ' to ' + destinationList[j] +
                                ': <b>' + results[j].distance.text + '</b> in <b>' +
                                results[j].duration.text + '</b><br>';
                            priceDiv.innerHTML += '<b>Estimated Value</b>: $' + calculateCost(results[j].distance.value, results[j].duration.value);*/
                        }
                    }

                }
            });
            calculateAndDisplayRoute(directionsService, directionsDisplay, originA, destinationA);
            directionsDisplay.setMap(map);
            $(".overlay.destination").hide();
            setTimeout(function() {
                $("body.rider").addClass('side-bar-active');
            }, 200);
        }
    });
}
