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
    checkForRider();
});




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
