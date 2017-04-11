function updateDriverInfo(driverName, carModel, carColor,plates, arrivalTime,cost){
  $('.driver-name').html(driverName);
  $('.car-model').html(carModel);
  $('.car-color').html(carColor);
  $('.car-plates').html(plates);
  $('.time').html(arrivalTime);
  $('.cost').html(cost);
}
