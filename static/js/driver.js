var isActive = false;
var driverCoordinates;
var theLat = 0;
var theLong = 0;


$(document).ready(function() {
    trackPosition();
    checkForRider();
});

function updateLocation(position){
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  driverCoordinates ={lat:lat, lng:lng};
  //to insure that the location isn't update before the driver becomes active
  if(isActive){
    $.ajax({
      url:'api/updateDriverLocation',
      type: 'POST',
      data:{
        'lat': lat,
        'lng': lng,
      },
      success: function(data,status){
        console.log(status);
        console.log(data);
      }
    })
  }
}

function trackPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updateLocation);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}


function toggleFoundRider(rider){
  console.log(rider);
  console.log(driverCoordinates);
  console.log("found Rider and updating view");
  $('#waitting-state').removeClass('active');
  $('#ride-request').addClass('active');
  $('.rider-name').html(rider.rider_name);
  var riderCoordinates = {lat:rider.pickup_lat, lng:rider.pickup_long};
  console.log(riderCoordinates);

  calculateAndDisplayRoute(directionsService,directionsDisplay,driverCoordinates,riderCoordinates);
  directionsDisplay.setMap(map);
}

// function calculateAndDisplayDriverRoute(directionsService, directionsDisplay, theOrigin, theDestination) {
//     directionsService.route({
//         origin: {lat:driverLat,lng:driverLng},
//         destination: {lat:riderLat,lng:riderLng},
//         travelMode: 'DRIVING'
//     }, function(response, status) {
//         if (status === 'OK') {
//             directionsDisplay.setDirections(response);
//         } else {
//             window.alert('Directions request failed due to ' + status);
//         }
//     });
// }




var foundRider = false;
function checkForRider(){
  $.ajax({
    url:'api/checkForRider',
    type: 'POST',
    success: function(data,status){
      console.log(status);
      console.log(data);
      if(data == 'none'){
        console.log('no match yet');
      }else{
        foundRider = true;
        console.log(data.pickup_lat);
        console.log(data.pickup_long);
        console.log(data.rider_name);
        toggleFoundRider(data);
      }
    }
  })
  if(!foundRider){
    setTimeout(checkForRider, 10000);
  }
}

function readyDrive() {
    console.log("running");
    isActive = true;
    console.log(curr_lat);
    console.log(curr_long);
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
            //what to do when data is returned
            console.log(status + " : " + data);
            $(".overlay.destination").hide(); setTimeout(function() {
                $("body.driver").addClass('side-bar-active');
            }, 200);
        }
    });
}
