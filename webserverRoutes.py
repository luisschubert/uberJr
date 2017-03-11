from flask import Flask,request,render_template, jsonify
import json
import helperFunctions
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

#ROUTES
@app.route("/")
def home():
    return render_template("login.html")

@app.route("/driver")
def driver():
    return render_template("driver.html")

@app.route("/rider")
def rider():
    return render_template("rider.html")

@app.route("/signup")
def signup():
    return render_template("signup.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/geolocationTest")
def geolocationTest():
    return render_template("geolocationTest.html")

#API for the frontend to request estimate travel time/cost based on user GPS location and destination Address
@app.route("/api/getTravelTime", methods=['POST'])
def api_getTravelInfo():
    originLongitude  = request.json.get('longitude')
    originLatitude = request.json.get('latitude')
    destinationAddress = request.json.get('destinationAddress')
    estimatePickUpTime = request.json.get('estimatePickUpTime')

    originGPS ="%s,%s" % (originLatitude,originLongitude)

    #for now
    departureTime = "now"

    #we should add departure time to this request based on the available drivers.
    #currently departure time is set to now.
    #departure time parameter is necessary to receive traffic information in the response.
    #there are 3 different modes for traffic calculation based on historical data. best_guess, pessimistic, optimistic.
    r = requests.get("https://maps.googleapis.com/maps/api/directions/json?origin=%s&destination=%s&key=%s&departure_time=%s" % (originGPS,destinationAddress,apiKey, departureTime))
    print r
    if r.status_code == 200:
        response = r.content
        travelTime, travelDistance = helperFunctions.extractTravelTime(response)
        travelCost = helperFunctions.calculateCost(travelTime,travelDistance)
        response = jsonify(estimateTime = travelTime, estimateCost = travelCost)
        print response
        return response
    else:
        return "error"

@app.route("/api/signup", methods=['POST'])
def api_signup():
    email = request.json.get('email')
    password = request.json.get('password')
    success = helperFunctions.signup(email,password)
    if(success):
        return "OK"
    else:
        return "FAILURE"

@app.route("/api/login", methods=['POST'])
def api_login():
    email = request.json.get('email')
    password = request.json.get('password')
    #compute hash for password
    # request to the firebase



if __name__ == '__main__':
    app.run(debug=True)
