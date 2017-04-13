var isActive = false;
var driverCoordinates;
function updateLocation(position){
  var lat = position.coords.latitude;
  var lng = position.coords.latitude;
  driverCoordinates = new google.maps.LatLng(lat, lng);
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

$(document).ready(function() {
    trackPosition();
    checkForRider();
});

function toggleFoundRider(rider){
  console.log(rider);
  console.log(driverCoordinates);
  var driverAddress;
  var riderAddress;
  console.log("found Rider and updating view");
  $('#waitting-state').removeClass('active');
  $('#ride-request').addClass('active');
  $('.rider-name').html(rider.rider_name);
  var riderCoordinates = new google.maps.LatLng(rider.pickup_lat, rider.pickup_long);
  console.log(riderCoordinates);
  geocoder.geocode({'location': riderCoordinates}, function(results, status) {
    if (status === 'OK') {
      if (results[1]) {
        riderAddress = results[1].formatted_address;
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
  geocoder.geocode({'location': driverCoordinates}, function(results, status) {
    if (status === 'OK') {
      if (results[1]) {
        driverAddress = results[1].formatted_address;
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
  console.log(driverAddress);
  console.log(riderAddress);

  calculateAndDisplayRoute(directionsService,directionsDisplay,driverAddress,riderAddress);
}




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
        foundMatch = true;
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
