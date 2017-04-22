// page init
jQuery(function() {
    initWow();
});

// wow for scroll animations
function initWow() {
    new WOW().init();
}

var locationCenterMap = "";

var curr_lat;
var curr_long;

$(document).ready(function() {
    $('#wrapper').fadeIn(1200);
    $('#riderRequest').submit(function(e) {
        e.preventDefault();
        requestRide();
    });
    $('#driverReady').submit(function(e) {
        e.preventDefault();
        readyDrive();
        $('#driverInactive').show();
    });
    $('#pickupReady').submit(function(e) {
        e.preventDefault();
        pickup();
    });
    $('#rideCompleted').submit(function(e) {
        e.preventDefault();
        completeRide();
    });
    $('#retry-ride-request').click(function(e) {
        e.preventDefault();
        $('.sidebar-state').removeClass('active');
        $("body.rider").removeClass('side-bar-active');
        $(".overlay.destination").show();
    });
    $('#acceptDeclineRide input[type=submit]').click(function(e) {
        var val = $(this).attr('value');
        e.preventDefault();
        acceptDeclineRide(val);
    });
    $('#driverInactive').submit(function(e) {
        e.preventDefault();
        setInactive();
    });
    $('#cancel-btn').click(function(e){
        e.preventDefault();
        $('.sidebar-state').removeClass('active');
        $('#cancel-conf').addClass('active');
    });
    $('#conf-yes').submit(function(e) {
        e.preventDefault();
        cancelRide();
    });
    $('#conf-no').click(function(e) {
        e.preventDefault();
        $('#cancel-conf').removeClass('active');
        $('#driver-found').addClass('active');
        $('#rider-buttons').addClass('active');
    });
    getLocation();
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("there was an error with getting the location");
    }
}

function showPosition(position) {
    lat = position.coords.latitude;
    curr_lat = position.coords.latitude;
    lng = position.coords.longitude;
    curr_long = position.coords.longitude;
    map.setCenter(new google.maps.LatLng(lat, lng));
    locationCenterMap = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    console.log(lat);
    console.log(lng);
    getCurrentAddress(lat,lng);
    showAvailableDrivers(lat,lng);
}

function deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, theOrigin, theDestination) {
    directionsService.route({
        origin: theOrigin,
        destination: theDestination,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

var map;
var bounds;
var markersArray = [];

var directionsService;
var directionsDisplay;

var currentTime = new Date();

var geocoder;

var sjsu = new google.maps.LatLng(37.336206, -121.882491);


var driverslocations = [
    ['driverOne', 37.3495, -121.8940],
    ['driverTwo', 37.3290, -121.8888],
    ['driverThree', 37.3310, -121.8604]
];


var MY_MAPTYPE_ID = 'custom_style';
var curMarkers = [];

function initMap() {
    var driverslocations = [
        ['driverOne', 37.3495, -121.8940],
        ['driverTwo', 37.3290, -121.8888],
        ['driverThree', 37.3310, -121.8604]
    ];

    //map styles
    var featureOpts = [{
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#7c93a3"
        }, {
            "lightness": "-10"
        }]
    }, {
        "featureType": "administrative.country",
        "elementType": "geometry",
        "stylers": [{
            "visibility": "on"
        }]
    }, {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#c2d1d6"
        }]
    }, {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#dde3e3"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#c2d1d6"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#a9b4b8"
        }, {
            "lightness": "0"
        }]
    }, {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#a3c7df"
        }]
    }];

    bounds = new google.maps.LatLngBounds;

    directionsService = new google.maps.DirectionsService;

    directionsDisplay = new google.maps.DirectionsRenderer;

    var mapOptions = {
        zoom: 14,
        center: sjsu,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
        },
        mapTypeId: MY_MAPTYPE_ID
    };

    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    geocoder = new google.maps.Geocoder;

    var styledMapOptions = {
        name: 'Custom Style'
    };

    //To show rider location
    setTimeout(function() { //here tmp until lat lng fix
        userMarker = new RichMarker({
            position: locationCenterMap,
            map: map,
            content: '<div class="richmarker-wrapper"><span class="pulse"></span></div>',
            shadow: 0
        });
    }, 5000);

    //To show drivers near by
    for (var i = 0; i < driverslocations.length; i++) {
        curMarkers[i] = new RichMarker({
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
