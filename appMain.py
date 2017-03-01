from flask import Flask,request
import json
from datetime import datetime
import requests

#gmaps = googlemaps.Client(key='AIzaSyBSbiX832JWq30JrqzH4tj-HriK9eJhhNs')

apiKey = "AIzaSyBSbiX832JWq30JrqzH4tj-HriK9eJhhNs"
app = Flask(__name__)
#used this to test if directions API was working as expected
#
# r = requests.get("https://maps.googleapis.com/maps/api/directions/json?origin=75+9th+Ave+New+York,+NY&destination=MetLife+Stadium+1+MetLife+Stadium+Dr+East+Rutherford,+NJ+07073&key=AIzaSyBSbiX832JWq30JrqzH4tj-HriK9eJhhNs")
# if r.status_code ==200:
#     response =r.content

@app.route("/")
def home():
    return "<h1>UberJr</h1>"

#API for the frontend to request estimate travel time based on user GPS location and destination Address
@app.route("/api/getTravelTime")
def getTravelTime():
    #json payload contains:
    #gps coordinates of user location
    #destination address
    jsonPayload = request.get_json()
    gpsCoordinates  = jsonPayload['GPS']
    originAddress = getAddressFromGPS(gpsCoordinates)
    destinationAddress = jsonPayload['destinationAddress']
    r = request.get("https://maps.googleapis.com/maps/api/directions/json?origin=%s&destination=%s&key=%s" % (originAddress,destinationAddress,apiKey))
    if r.status_code == 200:
        response = r.content
        travelTime = extractTravelTime(response)
        return jsonify(estimateTime = travelTime)
    else:
        return "error"
#takes gpsCoordinates as a parameter and makes a request to Geolocation API to return address.
def getAddressFromGPS(gpsCoordinates):
    return

#extracts the travel time from the direction API response
def extractTravelTime(response):
    return



if __name__ == '__main__':
    app.run(debug=True)
