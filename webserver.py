from flask import Flask,request,render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
import json
import tools
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
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:uberjr@localhost:5432/uberjr'
db = SQLAlchemy(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    email = db.Column(db.Text, unique=True)
    password = db.Column(db.Text)
    isDriver = db.Column(db.Boolean)

    def __init__(self, name, email, password, isDriver):
        self.name = name
        self.email = email
        self.password = password
        self.isDriver = isDriver

    def __repr__(self):
        return '<User %r>' % self.name

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

@app.route("/signupdriver")
def signupdriver():
    return render_template("signup-driver.html")

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
    #get current systemtime
    departureTime = "now"

    #we should add departure time to this request based on the available drivers.
    #currently departure time is set to now.
    #departure time parameter is necessary to receive traffic information in the response.
    #there are 3 different modes for traffic calculation based on historical data. best_guess, pessimistic, optimistic.
    r = requests.get("https://maps.googleapis.com/maps/api/directions/json?origin=%s&destination=%s&key=%s&departure_time=%s" % (originGPS,destinationAddress,apiKey, departureTime))
    print r
    if r.status_code == 200:
        response = r.content
        travelTime, travelDistance = tools.extractTravelTime(response)
        travelCost = tools.calculateCost(travelTime,travelDistance)
        response = jsonify(estimateTime = travelTime, estimateCost = travelCost)
        print response
        return response
    else:
        return "error"

@app.route("/api/signup", methods=['POST'])
def api_signup():
    name = request.form.get('name')
    userEmail = request.form.get('email')
    password = request.form.get('password')
    confirmpassword = request.form.get('confirmpassword')
    print "name: %s, email: %s, password: %s, confirmpassword: %s" %(name,userEmail,password, confirmpassword)
    user = Users.query.filter_by(email=userEmail).first()
    if user is None:
        if password == confirmpassword:
            new_user = Users(name, userEmail, password, False)
            print new_user
            db.session.add(new_user)
            db.session.commit()
            return "OK"
    else:
        return "FAILURE"

@app.route("/api/login", methods=['POST'])
def api_login():
    userEmail = request.form.get('email')
    password = request.form.get('password')
    #hash password here?
    user = Users.query.filter_by(email=userEmail).first()
    if user is not None:
        #compare hashed password to hashed password in db
        if user.password == password:
            if user.isDriver == True:
                print 'driver login succeeded'
                return "Driver login succeeded"
            else:
                print 'rider login succeeded'
                return "Rider login succeeded"
            #here we need to create a cookie for the client and return it along with the response
        else:
            print 'users password is incorrect'
            return "Invalid password!"
    elif user is None:
        print 'user by that email does not exist'
        return "No account with that email was found!"
    else:
        #can't think of additional errors to be thrown
        #but if they exist print them here
        print "No idea??"
        return "No idea??"


if __name__ == '__main__':
    app.run(debug=True)
