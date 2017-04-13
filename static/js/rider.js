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

function showAvailableDrivers(lat,lng){
  $.ajax({
    url:'api/getDrivers',
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

function requestDriver(origin, destination) {
  console.log("called requestDriver")
    $.ajax({
      url:'api/requestdriver',
      type: 'POST',
      data:{
        'origin': origin,
        'destination': destination
      },
      success: function(data,status) {
        console.log(status);
        console.log(data);
      }
    });
}


function requestRide() {
    //requestDriver()
    console.log("requesting ride");
    var originA = document.getElementById('originRider').value;
    var destinationA = document.getElementById('destinationRider').value;
    var formData = {
        //'origin': $('input[name=origin]').val(),
        //'destination': $('input[name=destination]').val()
        'origin': originA,
        'destination': destinationA
    }
    $.ajax({
            url: '/api/rider',
            type: 'POST',
            data: formData,
            success: function(data, status) {
                //what to do when data is returned
                requestDriver(originA, destinationA);
                console.log(status);
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
                    /*var outputDiv = document.getElementById('output');
                    var priceDiv = document.getElementById('price');
                    outputDiv.innerHTML = '';
                    priceDiv.innerHTML = '';*/
                    deleteMarkers(markersArray);

                    var showGeocodedAddressOnMap = function(asDestination) {
                      var icon = asDestination ? destinationIcon : originIcon;
                      return function(results, status) {
                        if (status === 'OK') {
                          map.fitBounds(bounds.extend(results[0].geometry.location));
                          markersArray.push(new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location,
                            icon: icon
                          }));
                        } else {
                          alert('Geocode was not successful due to: ' + status);
                        }
                      };
                    };

                    for (var i = 0; i < originList.length; i++) {
                      var results = response.rows[i].elements;
                      geocoder.geocode({'address': originList[i]},
                          showGeocodedAddressOnMap(false));
                      for (var j = 0; j < results.length; j++) {
                        geocoder.geocode({'address': destinationList[j]},
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

                //console.log(document.getElementsByClassName('cost')[0].value);
                //$("#cost wrapper").text("1337");
                $(".overlay.destination").hide(); setTimeout(function() {
                    $("body.rider").addClass('side-bar-active');
                    $("#cost wrapper").text("1337");
                }, 200);
            }
    });
}