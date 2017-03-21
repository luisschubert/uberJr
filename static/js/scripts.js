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


var driverslocations = [
	['driverOne', 37.3495, -121.8940 ],
	['driverTwo', 37.3290, -121.8888 ],
	['driverThree', 37.3310, -121.8604 ]
];


var MY_MAPTYPE_ID = 'custom_style';

function initMap() {

  var featureOpts = [
  	{
        "featureType": "all",
        "elementType": "all",
        "stylers": [
            {
                "invert_lightness": true
            },
            {
                "saturation": 20
            },
            {
                "lightness": 50
            },
            {
                "gamma": 0.4
            },
            {
                "hue": "#00ffee"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#405769"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#232f3a"
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
        curMarker = new RichMarker({
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
