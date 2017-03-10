# uberJr
Uber clone

## Webserver Routes
>This will outline the routes our webserver can handle and the views it will return.

#### /
displays the login view

#### /driver
displays the driver view

#### /rider
displays the rider view

#### /signup
displays the signup view

#### /login
displays the login view

#### /geolocationTest
displays a button to retrieve GPS Coordinates using HTML5 API


## API Documentation
>all api calls go to /api/...

#### getTravelTime (POST) JSON
###### Parameters:
* originLongitude
* originLatitude
* destinationAddress
* estimatePickupTime
* pickUpAddress //OPTIONAL

#### getEstimatePickupTime (POST) JSON
###### Parameters:
* originLongitude
* originLatitude

#### signup (POST) JSON
###### Parameters:
* email
* password

#### login (POST) JSON
###### Parameters:
* email
* password
