// page init
jQuery(function() {
	initWow();
});

// wow for scroll animations
function initWow() {
	new WOW().init();
}

$(document).ready(function(){
   $('#wrapper').fadeIn(1200);
	 getLocation();
});

var locationCenterMap = "";

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("there was an error with getting the location");
    }
}

function showPosition(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    map.setCenter(new google.maps.LatLng(lat, lng));
    locationCenterMap = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
}

function doRegister(){
	var name = $('#nameField').val();
	var email = $('#emailField').val();
	var password = $('#passwordField').val();
	$.post("/api/signup",
		{
				name: name,
				email: email,
				password: password
		},
		function(data, status){
			//what to do when data is returned
		});
}

function doLogin(){
	var email = $('#emailField').val();
	var password = $('#passwordField').val();
	$.post("/api/login",
    {
        email: email,
        password: password
    },
    function(data, status){
        //what to do when data is returned
    });
}

var map;

var sjsu = new google.maps.LatLng(37.336206, -121.882491);



var MY_MAPTYPE_ID = 'custom_style';

function initMap() {

  var featureOpts = [
    {
      stylers: [
        { hue: '#87CEFA' },
        { visibility: 'simplified' },
        { gamma: 0.5 },
        { weight: 0.5 }
      ]
    },
    {
      elementType: 'labels',
      stylers: [
        { visibility: 'on' }
      ]
    },
    {
      featureType: 'water',
      stylers: [
        { color: '#0878be' }
      ]
    }
  ];

  var mapOptions = {
    zoom: 14,
    center:sjsu,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
    },
    mapTypeId: MY_MAPTYPE_ID
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  var styledMapOptions = {
    name: 'Custom Style'
  };

  //To show rider location
  setTimeout(function () { //here tmp until lat lng fix
        curMarker = new RichMarker({
			position: locationCenterMap,
			map: map,
			content: '<div class="richmarker-wrapper"><span class="pulse"></span></div>',
			shadow: 0
		});
  }, 4000);
  
  var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

  map.mapTypes.set(MY_MAPTYPE_ID, customMapType);
}

google.maps.event.addDomListener(window, 'load', initMap);
