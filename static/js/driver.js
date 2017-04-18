var isActive = false;
var driverCoordinates;
var theLat = 0;
var theLong = 0;
var pickupCoordinates;
var destCoordinates;
var drivingStatus = false;

$(document).ready(function() {
    trackPosition();
});

function updateLocation(position) {
  console.log("updateLocation rightnow");
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  driverCoordinates = {lat:lat, lng:lng};
  console.log(driverCoordinates);
  //to ensure that the location isn't updated before the driver becomes active
  if (isActive) {
    console.log("isActive? yes it is...");
    //never called??
    // need to add log here
      $.ajax({
          url:'api/updateDriverLocation',
          type: 'POST',
          data:{
            'lat': lat,
            'lng': lng,
          },
          success: function(data) {
              console.log(data);
          }
      });
  }
  /*
  if(drivingStatus){
    // update the location on the database named ActiveDrivers
    //    api/activeDriverUpdate
    var formData ={
      'status':
    }
    $.ajax({
        url: '/api/activeDriverUpdate',
        type: 'POST',
        data: formData,
        success: function(data, status) {
            foundRider = false;
            checkForRider();
            console.log(status + " : " + data);
            $(".overlay.destination").hide(); setTimeout(function() {
                $("body.driver").addClass('side-bar-active');
            }, 200);
        }
    });
  }
  */
}

function trackPosition() {
  console.log("trackPosition rightnow: ");
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updateLocation);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function toggleInactive() {
    isActive = false;
    $('#driverInactive').hide();
    $("body.driver").removeClass('side-bar-active');
    $(".overlay.destination").show();
    directionsDisplay.setMap(null);
}

function toggleFoundRider(rider){
  console.log(rider);
  console.log(driverCoordinates);
  console.log("found Rider and updating view");
  $('#waitting-state').removeClass('active');
  $('#ride-request').addClass('active');
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
  console.log(pickupCoordinates);
  calculateAndDisplayRoute(directionsService,directionsDisplay,driverCoordinates,pickupCoordinates);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById("directions-to-rider"));
}

function toggleAcceptRide() {
    console.log("accepted ride and updating view");
    $('#ride-request').removeClass('active');
    $('#directions-to-rider').addClass('active');
}

function togglePickedupRider(coords) {
    console.log(coords);
    console.log(pickupCoordinates);
    console.log("picked up Rider and updating view");
    $('#directions-to-rider').removeClass('active');
    $('#directions-to-destination').addClass('active');
    destCoordinates = {lat:coords.dest_lat, lng:coords.dest_long};
    console.log("destCoordinates:" + destCoordinates);
    calculateAndDisplayRoute(directionsService,directionsDisplay,pickupCoordinates,destCoordinates);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directions-to-destination"));
}

function toggleCompletedRide() {
    $('#directions-to-destination').removeClass('active');
    $('#waitting-state').addClass('active');
    foundRider = false;
    trackPosition();
    directionsDisplay.setMap(null);
    checkForRider();
}

var foundRider;
var checkForRiderTimeout;
function checkForRider() {
    $.ajax({
        url: 'api/checkForRider',
        type: 'POST',
        success: function(data) {
            console.log(data);
            if (data == 'none') {
                console.log('no match yet');
            } else {
                console.log(data.pickup_lat);
                console.log(data.pickup_long);
                console.log(data.rider_name);
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

function setInactive() {
    isActive = false;
    $.ajax({
        url: '/api/inactive',
        type: 'POST',
        success: function(data) {
            console.log(data);
            foundRider = true;
            clearTimeout(checkForRiderTimeout);
            toggleInactive();
        }
    });
}

function readyDrive() {
  console.log("readyDrive function right now");
    isActive = true;
    pickedUp = true;
    console.log(curr_lat);
    console.log(curr_long);
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
            foundRider = false;
            checkForRider();
            console.log(status + " : " + data);
            $(".overlay.destination").hide(); setTimeout(function() {
                $("body.driver").addClass('side-bar-active');
            }, 200);
        }
    });
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
                foundRider = true;
                clearTimeout(checkForRiderTimeout);
                toggleInactive();
            } else {
                foundRider = true;
                toggleAcceptRide();
            }
        }
    });
}

function pickup() {
    var formData = {
        'status': $('input[name=ready]').val()
    };
    $.ajax({
        url: '/api/pickup',
        type: 'POST',
        data: formData,
        success: function(data, status) {
            if (data == 'none') {
                console.log('pickup coords not found??');
            } else {
                console.log(data.dest_lat);
                console.log(data.dest_long);
                togglePickedupRider(data);
            }
        }
    });
}

function completeRide() {
    var formData = {
        'status': $('input[name=completed]').val()
    };
    $.ajax({
        url: '/api/completeRide',
        type: 'POST',
        data: formData,
        success: function(data, status) {
            if (data == 'none') {
                console.log('ride not completed');
            } else {
                console.log(data);
                toggleCompletedRide();
            }
        }
    });
}
