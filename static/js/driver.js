var isActive = false;
var driverCoordinates;
var pickupCoordinates;
var destCoordinates;
//var trackPositionTimeout;
var foundRider;
var checkForRiderTimeout;
var riderCanceled;
var riderCanceledTimeout;
var timedOut;

$(document).ready(function() {
    trackPosition();
});

function getCurrentAddress(lat, lng) {
  console.log("getCurrentAddress of the driver");
    $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+ lat + ',' + lng + '&key=AIzaSyBnXUp2Txy1C2OyYp0crd8iyaIDSb-N8oU',
        method: 'POST',
        success: function(data,status){
          console.log(status + " : " + data);
          //get the address from the response object
          address = data.results[0].formatted_address;
          //insert the addres
          $('#originRider').val(address);
        }
    });
}

function showAvailableDrivers(lat, lng) {
    //nothing goes here
}

function updateLocation(position) {
    console.log("updateLocation rightnow");
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    driverCoordinates = {lat:lat, lng:lng};
    showPosition(position);
    // or use getLocation();
    console.log(driverCoordinates);
    // to ensure that the location isn't updated before the driver becomes active
    if (isActive) {
        console.log("isActive? yes it is...");
        $.ajax({
            url:'/api/updateDriverLocation',
            type: 'POST',
            data: {
              'lat': lat,
              'lng': lng
            },
            success: function(data) {
                console.log(data);
            }
        })
    }
}

function errorHandler(err) {
    if (err.code == 1) {
        console.log("Error: Access to location is denied!");
    } else if (err.code == 2) {
        console.log("Error: Position is unavailable!");
    }
}

function trackPosition() {
    if (navigator.geolocation) {
        var options = {maximumAge:10000, timeout:10000, enableHighAccuracy:true};
        navigator.geolocation.watchPosition(updateLocation, errorHandler, options);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function readyDrive() {
    console.log("Current driver latitude: " + curr_lat);
    console.log("Current driver longitude: " + curr_long);
    //driverCoordinates = {lat:curr_lat, lng:curr_long};
    var formData = {
        'status': $('input[name=ready]').val(),
        'originLat': curr_lat,
        'originLong': curr_long
    };
    $.ajax({
        url: '/api/drive',
        type: 'POST',
        data: formData,
        success: function(data, status) {
            console.log(status + " : " + data);
            isActive = true;
            //trackPositionTimeout = self.setInterval(function() {trackPosition()}, 10000);
            foundRider = false;
            //$('#logout-btn').addClass('disabled');
            checkForRider();
        }
    });
}

/*function trackPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            driverCoordinates = {lat:lat, lng:lng};
            console.log("updated lat: " + lat);
            console.log("updated long: " + lng);
            $.ajax({
                url: '/api/updateDriverLocation',
                type: 'POST',
                data: {
                  'lat': lat,
                  'lng': lng
                },
                success: function(data) {
                    console.log(data);
                }
            });
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}*/

function checkForRider() {
    $.ajax({
        url: '/api/checkForRider',
        type: 'GET',
        cache: false,
        success: function(data) {
            if (data == "ride request not paired yet") {
                console.log('no match yet');
            } else {
                console.log("Pickup latitude: " + data.pickup_lat);
                console.log("Pickup longitude: " + data.pickup_long);
                console.log("Rider's name: " + data.rider_name);
                console.log("Pickup ETA: " + data.pickup_eta);
                foundRider = true;
                clearTimeout(checkForRiderTimeout);
                toggleFoundRider(data);
            }
        }
    });
    if (!foundRider) {
        clearTimeout(checkForRiderTimeout);
        checkForRiderTimeout = setTimeout(checkForRider, 10000);
    }
}

function toggleFoundRider(rider) {
    console.log("found rider and updating view with details");
    $('#waitting-state').removeClass('active');
    $('#ride-title').html("New Ride Request!");
    $('#tooltip').html('You must decline or complete the ride first!');
    $('.switch').addClass('disabled');
    $('#ride-request').addClass('active');
    $('#specifics').addClass('active');
    $('.rider-name').html(rider.rider_name);
    pickupCoordinates = {lat:rider.pickup_lat, lng:rider.pickup_long};
    geocoder.geocode({'location': pickupCoordinates}, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                $('#location').html("Pickup Address: <span>" + results[0].formatted_address + "</span>");
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
    $('.time').html(rider.pickup_eta);
    calculateAndDisplayRoute(directionsService,directionsDisplay,driverCoordinates,pickupCoordinates);
    directionsDisplay.setMap(map);
}

function acceptDeclineRide(val) {
    var formData = {
        'status': val
    };
    $.ajax({
        url: '/api/acceptDeclineRide',
        type: 'POST',
        data: formData,
        success: function(data, status) {
            console.log(data);
            if (data == 'ride declined. driver marked inactive, and rider returned to ride request pool') {
            // if driver declined ride request, timeout/mark inactive
                timedOut = true;
                setInactive();
            } else {
              // if driver accepted ride request
                foundRider = true;
                riderCanceled = false;
                checkRideCanceled();
                toggleAcceptRide();
            }
        }
    });
}

function toggleAcceptRide() {
    console.log("accepted ride and updating view");
    $('#tooltip').html('You must complete the ride first!');
    $('#ride-title').html("Enroute to Pickup");
    $('#specifics').removeClass('active');
    $('#directions-to-rider').addClass('active');
    directionsDisplay.setPanel(document.getElementById("directions-rider"));
}

function checkRideCanceled() {
    $.ajax({
        url: '/api/checkRideCanceled',
        type: 'GET',
        success: function(data, status) {
            if (data == 'ride has been canceled by rider. returned to pool') {
                riderCanceled = true;
                clearTimeout(riderCanceledTimeout);
                console.log('ride has been canceled by rider.');
                toggleRiderCanceled();
            } else {
                console.log(data);
            }
        }
    });
    if (!riderCanceled) {
        clearTimeout(riderCanceledTimeout);
        riderCanceledTimeout = setTimeout(checkRideCanceled, 8000);
    }
}

function toggleRiderCanceled() {
    console.log("rider canceled; view updated");
    $('.sidebar-state').removeClass('active');
    $('.switch').removeClass('disabled');
    $('#rider-canceled').addClass('active');
    setTimeout(function() {
        $('#rider-canceled').removeClass('active')
        $("#waitting-state").addClass('active');
    }, 5000);
    directionsDisplay.setMap(null);
    foundRider = false;
    checkForRider();
}

function pickup() {
    $.ajax({
        url: '/api/pickup',
        type: 'POST',
        success: function(data, status) {
            if (data == 'none') {
                console.log('destination coords not found??');
            } else {
                console.log("Destination latitude:" + data.dest_lat);
                console.log("Destination longitude:" + data.dest_long);
                riderCanceled = true;
                clearTimeout(riderCanceledTimeout);
                togglePickedupRider(data);
            }
        }
    });
}

function togglePickedupRider(coords) {
    console.log(coords);
    console.log(pickupCoordinates);
    console.log("picked up Rider and updating view");
    $('#ride-title').html("Enroute to Destination");
    $('#directions-to-rider').removeClass('active');
    $('#directions-to-destination').addClass('active');
    $("#sidebar-driver").mCustomScrollbar("scrollTo", "#ride-request");
    destCoordinates = {lat:coords.dest_lat, lng:coords.dest_long};
    geocoder.geocode({'location': destCoordinates}, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                $('#location').html("Destination Address: <span>" + results[0].formatted_address + "</span>");
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
    calculateAndDisplayRoute(directionsService,directionsDisplay,pickupCoordinates,destCoordinates);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directions-dest"));
}

function completeRide() {
    $.ajax({
        url: '/api/completeRide',
        type: 'POST',
        success: function(data, status) {
            if (data == 'none') {
                console.log('ride not completed');
            } else {
                console.log(data);
                foundRider = false;
                toggleCompletedRide();
                // track position again if we stop tracking after pickup
                trackPosition();
                checkForRider();
            }
        }
    });
}

function toggleCompletedRide() {
    $('.sidebar-state').removeClass('active');
    $('.switch').removeClass('disabled');
    $('#waitting-state').addClass('active');
    directionsDisplay.setMap(null);
}

function setInactive() {
    $.ajax({
        url: '/api/inactive',
        type: 'POST',
        success: function(data) {
            console.log(data);
            isActive = false;
            //clearInterval(trackPositionTimeout);
            foundRider = true;
            clearTimeout(checkForRiderTimeout);
            toggleInactive();
        }
    });
}

function toggleInactive() {
    $('#driverInactive').hide();
    $('#switch-toggle').attr('checked', false);
    $('.sidebar-state').removeClass('active');
    directionsDisplay.setMap(null);
    if (timedOut) {
        $('#tooltip').html('You cannot be active until you are no longer timed out!');
        toggleTimedout();
    } else {
        //$('#logout-btn').removeClass('disabled');
    }
}

function toggleTimedout() {
    var countDownDate = new Date().getTime() + 5 * 60 * 1000;
    var x = setInterval(function() {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        $('#timer').html(minutes + "m " + seconds + "s ");
        if (distance < 0) {
            clearInterval(x);
            timedOut = false;
            $('#timed-out').removeClass('active');
            $('.switch').removeClass('disabled');
            //$('#logout-btn').removeClass('disabled');
        }
    }, 1000);
    $('#timed-out').addClass('active');
}

//driver status toggle
$('#switch-toggle').click(function(e) {
    if ($('.switch').hasClass('disabled')) {
        e.preventDefault();
    }
    else {
        if ($('#switch-toggle').is(':checked')) {
            $('.loc-sbmt-demo').click();
            $('#waitting-state').toggleClass('active');
            $('.driver-welcome').hide();
        }
        else {
            $('.inactive').click();
            $('#waitting-state').toggleClass('active');
        }
    }
});
