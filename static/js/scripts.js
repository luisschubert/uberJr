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
	console.log("running");
	var name = $('#nameField').val();
	var email = $('#emailField').val();
	var password = $('#passwordField').val();
	var confirmpassword = $('#confPasswordField').val();
	$.post("/api/signup",
		{
				name: name,
				email: email,
				password: password,
				confirmpassword: confirmpassword
		},
		function(data, status){
			//what to do when data is returned
			console.log(data);
			console.log(status);
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


var driverslocations = [
	['driverOne', 37.3495, -121.8940 ],
	['driverTwo', 37.3290, -121.8888 ],
	['driverThree', 37.3310, -121.8604 ]
];


var MY_MAPTYPE_ID = 'custom_style';

function initMap() {


  //map styles
  var featureOpts = [
  	{
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#7c93a3"
            },
            {
                "lightness": "-10"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#c2d1d6"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#dde3e3"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#c2d1d6"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#a9b4b8"
            },
            {
                "lightness": "0"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#a3c7df"
            }
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
        userMarker = new RichMarker({
			position: locationCenterMap,
			map: map,
			content: '<div class="richmarker-wrapper"><span class="pulse"></span></div>',
			shadow: 0
		});
  }, 4000);


  //To show drivers near by
  for(var i = 0; i < driverslocations.length; i++){
		curMarker = new RichMarker({
			position: new google.maps.LatLng(driverslocations[i][1], driverslocations[i][2]),
			map: map,
			content: '<div class="richmarker-wrapper"><span class="uber-car"></span></div>',
			shadow: 0
		});
	}

  var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

  map.mapTypes.set(MY_MAPTYPE_ID, customMapType);
}

google.maps.event.addDomListener(window, 'load', initMap);
