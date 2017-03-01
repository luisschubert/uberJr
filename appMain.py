from flask import Flask,request

from datetime import datetime
import requests

#gmaps = googlemaps.Client(key='AIzaSyBSbiX832JWq30JrqzH4tj-HriK9eJhhNs')


app = Flask(__name__)
r = requests.get("https://maps.googleapis.com/maps/api/directions/json?origin=75+9th+Ave+New+York,+NY&destination=MetLife+Stadium+1+MetLife+Stadium+Dr+East+Rutherford,+NJ+07073&key=AIzaSyBSbiX832JWq30JrqzH4tj-HriK9eJhhNs")
if r.status_code ==200:
    response =r.content

@app.route("/")
def home():
    return str(response)

@app.route("/api/getTravelTime")
def getTravelTime():
    jsonPayload = request.get_json()
    #json payload contains:
    #gps coordinates of user location
    #destination address


if __name__ == '__main__':
    app.run(debug=True)