var isActive = false;
function updateLocation(position){
  var lat = position.coords.latitude;
  var lng = position.coords.latitude;
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
});
