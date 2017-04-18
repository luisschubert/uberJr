//function updateDriverInfo(driverName, carModel, carColor,plates, arrivalTime,cost){
function toggleFoundDriver(driverName, carModel, carColor, plates, pickupTime) {
    $('.sidebar-state').removeClass('active'); //disables any active
    $('#driver-found').addClass('active');
    $('.driver-name').html(driverName);
    $('.car-model').html(carModel);
    $('.car-color').html(carColor);
    $('.car-plates').html(plates);
    $('.time').html(pickupTime);
    //$('.cost').html(cost);
}

function toggleNoDrivers() {
    $('.sidebar-state').removeClass('active'); //disables any active
    $('#no-drivers').addClass('active');
}

function toggleRideCompleted() {
    $("body.rider").removeClass('side-bar-active');
    //$("destinationRider").val("");
    $(".overlay.destination").show();
    directionsDisplay.setMap(null);
}

var counter = 1;
function updateDriverMarkers() {
    console.log("updating location " + counter);
    for (var i = 0; i < curMarkers.length; i++) {
        console.log(curMarkers[i]);
        driverslocations[i][1] = driverslocations[i][1] + 0.005;
        driverslocations[i][2] = driverslocations[i][2] + 0.005;
        curMarkers[i].setPosition(new google.maps.LatLng(driverslocations[i][1], driverslocations[i][2]))
    }
    counter = counter + 1;
    setTimeout(updateDriverMarkers, 5000);
}

function getCurrentAddress(lat, lng) {
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
    })
}

function trackPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updateLocation);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function requestDriver(origin, destination) {
    console.log("called requestDriver")
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
              console.log("ride is still in progress");
          }
        }
    })
    if (!rideCompleted) {
        clearTimeout(rideCompletedTimeout);
        rideCompletedTimeout = setTimeout(checkRideCompleted, 10000);
    }
}

function requestRide() {
    console.log("requesting ride");
    var originA = document.getElementById('originRider').value;
    var destinationA = document.getElementById('destinationRider').value;
    var formData = {
        'origin': originA,
        'destination': destinationA
    }
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
