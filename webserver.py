from flask import Flask,request,render_template,jsonify,url_for,make_response,redirect,session
from flask_sqlalchemy import SQLAlchemy
import json
import tools
from datetime import datetime
import requests
from flask_bcrypt import Bcrypt

#gmaps = googlemaps.Client(key='AIzaSyBSbiX832JWq30JrqzH4tj-HriK9eJhhNs')

apiKey = "AIzaSyBSbiX832JWq30JrqzH4tj-HriK9eJhhNs"
app = Flask(__name__)
app.secret_key = '\x9a{\xfc\x86(0\x92=Y\xaf-\xdf\x05z\x91\xadL+\xdeP\xa3w\xc0\x07'
bcrypt = Bcrypt(app)
#used this to test if directions API was working as expected
#
# r = requests.get("https://maps.googleapis.com/maps/api/directions/json?origin=75+9th+Ave+New+York,+NY&destination=MetLife+Stadium+1+MetLife+Stadium+Dr+East+Rutherford,+NJ+07073&key=AIzaSyBSbiX832JWq30JrqzH4tj-HriK9eJhhNs")
# if r.status_code ==200:
#     response =r.content
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://Daniel@localhost:5432/Daniel'
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
    if 'email' in session:
        user = Users.query.filter_by(email = session['email']).first()
        print user.isDriver
        if user.isDriver == True:
            return redirect(url_for('driver'))
        else:
            return redirect(url_for('rider'))
    else:
        return render_template("login.html")

@app.route("/driver")
def driver():
    if 'email' not in session:
        return redirect(url_for('login'))
    user = Users.query.filter_by(email = session['email']).first()
    # do we need to check if an account with that email exists here? (redirect to signup page if nonexistent?)
    # might be unnecessary since we already check for that in the login API call?
    if user.isDriver == False:
        return redirect(url_for('rider'))
    else:
        return render_template("driver.html")

@app.route("/rider")
def rider():
    if 'email' not in session:
        return redirect(url_for('login'))
    user = Users.query.filter_by(email = session['email']).first()
    # do we need to check if an account with that email exists here? (redirect to signup page if nonexistent?)
    # might be unnecessary since we already check for that in the login API call?
    if user.isDriver == True:
        return redirect(url_for('driver'))
    else:
        return render_template("rider.html")

@app.route("/signup")
def signup():
    if 'email' in session:
        user = Users.query.filter_by(email = session['email']).first()
        if user.isDriver == True:
            return redirect(url_for('driver'))
        else:
            return redirect(url_for('rider'))
    else:
        return render_template("signup.html")

@app.route("/signupdriver")
def signupdriver():
    return render_template("signup-driver.html")

@app.route("/login")
def login():
    if 'email' in session:
        user = Users.query.filter_by(email = session['email']).first()
        if user.isDriver == True:
            return redirect(url_for('driver'))
        else:
            return redirect(url_for('rider'))
    else:
        return render_template("login.html")

@app.route("/logout")
def logout():
    if 'email' not in session:
        return redirect(url_for('login'))
    session.pop('email', None)
    return redirect(url_for('home'))

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
    print(request.form)
    name = request.form.get('name')
    userEmail = request.form.get('email')
    password = request.form.get('password')
    confirmpassword = request.form.get('confirmpassword')
    print "name: %s, email: %s, password: %s, confirmpassword: %s" %(name,userEmail,password, confirmpassword)
    user = Users.query.filter_by(email=userEmail).first()
    isDriver = False
    if user is None:
        if password == confirmpassword:
            hashedpw = bcrypt.generate_password_hash(password)
            new_user = Users(name, userEmail, hashedpw, isDriver)
            print new_user
            db.session.add(new_user)
            db.session.commit()
            if (isDriver == True):
                print 'driver account creation succeeded'
                resp = make_response(url_for('driver'))
                session['email'] = new_user.userEmail
                return resp
            else:
                print 'rider account creation succeeded'
                resp = make_response(url_for('rider'))
                session['email'] = new_user.email
                return resp
    else:
        return "FAILURE"

@app.route("/api/login", methods=['POST'])
def api_login():
    userEmail = request.form.get('email')
    password = request.form.get('password')
    user = Users.query.filter_by(email=userEmail).first()
    if user is not None:
        #compare hashed password to hashed password in db
        if bcrypt.check_password_hash(user.password, password):
            #here we need to create a cookie for the client and return it along with the response
            if user.isDriver == True:
                print 'driver login succeeded'
                resp = make_response(url_for('driver'))
                session['email'] = user.email
                return resp
            else:
                print 'rider login succeeded'
                resp = make_response(url_for('rider'))
                session['email'] = user.email
                return resp
        else:
            print 'user\'s password is incorrect'
            return "Invalid password!"
    elif user is None:
        print 'user with that email does not exist'
        return "No account with that email was found!"
    else:
        #can't think of additional errors to be thrown
        #but if they exist print them here
        print "No idea??"
        return "No idea??"


if __name__ == '__main__':
    app.run(debug=True)
