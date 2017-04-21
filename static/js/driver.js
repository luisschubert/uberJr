var isActive = false;
var driverCoordinates;
var pickupCoordinates;
var destCoordinates;
var foundRider;
var checkForRiderTimeout;

$(document).ready(function() {
    trackPosition();
});

function updateLocation(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    driverCoordinates = {lat:lat, lng:lng};
    // to ensure that the location isn't updated before the driver becomes active
    if (isActive) {
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
    var formData = {
        'status': $('input[name=ready]').val(),
        'originLat': curr_lat,
        'originLong': curr_long
    }
    $.ajax({
        url: '/api/drive',
        type: 'POST',
        data: formData,
        success: function(data, status) {
            console.log(status + " : " + data);
            isActive = true;
            foundRider = false;
            checkForRider();
            $('#waitting-state').addClass('active');
            toggleActive();
        }
    });
}

function toggleActive() {
    $(".overlay.destination").hide(); setTimeout(function() {
        $("body.driver").addClass('side-bar-active');
    }, 200);
}

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
    })
    if (!foundRider) {
        clearTimeout(checkForRiderTimeout);
        checkForRiderTimeout = setTimeout(checkForRider, 10000);
    }
}

function toggleFoundRider(rider) {
    console.log("found rider and updating view with details");
    $('#waitting-state').removeClass('active');
    $('#ride-title').html("New Ride Request!");
    $('#ride-request').addClass('active');
    $('#specifics').addClass('active');
    $('.rider-name').html(rider.rider_name);
    pickupCoordinates = {lat:rider.pickup_lat, lng:rider.pickup_long};
    geocoder.geocode({'location': pickupCoordinates}, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                $('.rider-location').html(results[0].formatted_address);
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
                setInactive();
            } else {
              // if driver accepted ride request
                foundRider = true;
                toggleAcceptRide();
            }
        }
    });
}

function toggleAcceptRide() {
    console.log("accepted ride and updating view");
    $('#ride-title').html("Enroute to Pickup");
    $('#specifics').removeClass('active');
    $('#directions-to-rider').addClass('active');
    directionsDisplay.setPanel(document.getElementById("directions-rider"));
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
            foundRider = true;
            clearTimeout(checkForRiderTimeout);
            toggleInactive();
        }
    });
}

function toggleInactive() {
    $('#driverInactive').hide();
    $('.sidebar-state').removeClass('active');
    $("body.driver").removeClass('side-bar-active');
    $(".overlay.destination").show();
    directionsDisplay.setMap(null);
}


//driver status toggle
$('#switch-toggle').click(function(e){
  if($('.switch').hasClass('disabled')) {
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












