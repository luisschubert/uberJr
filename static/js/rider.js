var originA;
var destinationA;
var counter = 1;
var travelTime;
var timeToDest;
var rideFare;
var rideAccepted;
var rideAcceptedTimeout;
var pickedUp;
var pickedUpTimeout;
var rideCompleted;
var rideCompletedTimeout;

function showAvailableDrivers(lat, lng) {
    $.ajax({
        url: '/api/getDrivers',
        type: 'POST',
        data: {
          'lat': lat,
          'lng': lng,
        },
        success: function(data, status) {
          console.log(status);
          console.log(data);
        }
    });
}

function updateDriverMarkers() {
    console.log("updating location " + counter);
    for (var i = 0; i < curMarkers.length; i++) {
        console.log(curMarkers[i]);
        driverslocations[i][1] = driverslocations[i][1] + 0.005;
        driverslocations[i][2] = driverslocations[i][2] + 0.005;
        curMarkers[i].setPosition(new google.maps.LatLng(driverslocations[i][1], driverslocations[i][2]));
    }
    counter = counter + 1;
    setTimeout(updateDriverMarkers, 5000);
}

function getCurrentAddress(lat, lng) {
    $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+ lat + ',' + lng + '&key=AIzaSyBnXUp2Txy1C2OyYp0crd8iyaIDSb-N8oU',
        method: 'POST',
        success: function(data,status) {
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

function requestRide() {
    console.log("requesting ride");
    originA = document.getElementById('originRider').value;
    destinationA = document.getElementById('destinationRider').value;
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
            $('#waitting-state').addClass('active');
            setTimeout(function() {
                $("body.rider").addClass('side-bar-active');
            }, 200);
        }
    });
}

function requestDriver(origin, destination) {
    console.log("called requestDriver")
    $.ajax({
        url: '/api/requestdriver',
        type: 'POST',
        data: {
          'origin': origin,
          'destination': destination
        },
        success: function(data, status) {
            console.log("requestdriver data = " + data);
            if (data == "No drivers available. Check back later!") {
                toggleNoDrivers();
            } else {
                travelTime = data.travelTime;
                rideFare = data.fare;
                // estimated time to destination (minutes) assuming departure time = pickup time
                timeToDest = data.timeToDest;
                rideAccepted = false;
                console.log("called checkRideAccepted in requestDriver");
                checkRideAccepted();
                console.log(data);
            }
        }
    });
}

function checkRideAccepted() {
    var formData = {
        'timeToRider': travelTime
    };
    $.ajax({
      url: '/api/checkRideAccepted',
      type: 'POST',
      data: formData,
      success: function(data, status) {
          console.log(data);
          // if ride request is pending acceptance
          if (data == "ride request not accepted yet") {
              console.log("ride request is pending acceptance");
          } else if (data == "ride request hasn't been paired yet or has been declined") {
            // else if ride request is declined
              rideAccepted = true;
              clearTimeout(rideAcceptedTimeout);
              // request ride/find another driver (check if paired in requestDriver?)
              console.log("driver declined ride request. searching for another driver");
              requestDriver(originA, destinationA);
          } else if (data == "ride request can't be checked for acceptance because no drivers available") {
              console.log("find out why checkRideAccepted is being called in the first place if rideAccepted is being set to true and the timeout is being cleared??");
          } else {
            // else if ride request is accepted
              rideAccepted = true;
              clearTimeout(rideAcceptedTimeout);
              pickedUp = false;
              checkPickedUp();
              toggleFoundDriver(data.name, data.make, data.color, data.license_plate, data.pickup_eta);
          }
      }
    });
    if (!rideAccepted) {
        clearTimeout(rideAcceptedTimeout);
        setTimeout(checkRideAccepted, 10000);
    }
}

//function updateDriverInfo(driverName, carModel, carColor,plates, arrivalTime,cost){
function toggleFoundDriver(driverName, carModel, carColor, plates, pickupTime) {
    $('.sidebar-state').removeClass('active'); //disables any active
    $('#driver-found').addClass('active');
    $('#rider-buttons').addClass('active');
    $('#driver-found-title').html('A driver is on the way!');
    $('.driver-name').html(driverName);
    $('.car-model').html(carModel);
    $('.car-color').html(carColor);
    $('.car-plates').html(plates);
    $('.time-title').html('Estimated Time of Pickup:');
    $('.time').html(pickupTime);
    $('.cost').html("$" + rideFare);
}

function toggleNoDrivers() {
    $('.sidebar-state').removeClass('active'); //disables any active
    $('#no-drivers').addClass('active');
    directionsDisplay.setMap(null);
}

function checkPickedUp() {
    var formData = {
        'timeToRider': travelTime,
        'timeToDest': timeToDest
    };
    $.ajax({
        url: '/api/checkPickedUp',
        type: 'POST',
        data: formData,
        success: function(data, status) {
            if (data != 'false') {
                pickedUp = true;
                clearTimeout(pickedUpTimeout);
                rideCompleted = false;
                checkRideCompleted();
                togglePickedUp(data.arrival_time);
            } else {
                console.log("rider is still waiting to be picked up");
            }
        }
    });
    if (!pickedUp) {
        clearTimeout(pickedUpTimeout);
        pickedUpTimeout = setTimeout(checkPickedUp, 10000);
    }
}

function togglePickedUp(arrivaltime) {
    console.log("picked up and updating view");
    $('#driver-found-title').html('Enroute to Destination');
    $('#rider-buttons').removeClass('active');
    $('.time-title').html('Estimated Time of Arrival:');
    $('.time').html(arrivaltime);
    $('#directions-ride').addClass('active');
    directionsDisplay.setPanel(document.getElementById("directions-ride"));
}

function checkRideCompleted() {
    $.ajax({
        url: '/api/checkRideCompleted',
        type: 'GET',
        success: function(data, status) {
          if (data == 'true') {
              rideCompleted = true;
              clearTimeout(rideCompletedTimeout);
              console.log("ride completed");
              toggleRideCompleted();
          } else {
              console.log("ride is still in progress");
          }
        }
    });
    if (!rideCompleted) {
        clearTimeout(rideCompletedTimeout);
        rideCompletedTimeout = setTimeout(checkRideCompleted, 10000);
    }
}

function toggleRideCompleted() {
    $('.sidebar-state').removeClass('active');
    $("body.rider").removeClass('side-bar-active');
    $(".overlay.destination").show();
    directionsDisplay.setMap(null);
}
