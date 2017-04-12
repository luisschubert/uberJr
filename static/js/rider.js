function updateDriverInfo(driverName, carModel, carColor,plates, arrivalTime,cost){
  $('.driver-name').html(driverName);
  $('.car-model').html(carModel);
  $('.car-color').html(carColor);
  $('.car-plates').html(plates);
  $('.time').html(arrivalTime);
  $('.cost').html(cost);
}
var counter = 1;
function updateDriverMarkers(){
  console.log("updating location " + counter);
  for(var i = 0;i<curMarkers.length;i++){
      console.log(curMarkers[i]);
      driverslocations[i][1] = driverslocations[i][1]+0.005;
      driverslocations[i][2] = driverslocations[i][2]+0.005;

      curMarkers[i].setPosition(new google.maps.LatLng(driverslocations[i][1], driverslocations[i][2]))
  }
  counter = counter +1;
  setTimeout(updateDriverMarkers,5000);
}

function getCurrentAddress(lat,lng){
  $.ajax({
    url:'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key=AIzaSyBnXUp2Txy1C2OyYp0crd8iyaIDSb-N8oU',
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
