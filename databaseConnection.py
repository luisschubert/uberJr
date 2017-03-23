from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import requests

#from models import Users

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://luisschubert@localhost:5432/uberjr'
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


@app.route("/")
def home():
    return "Home Page!"

@app.route("/create_user")
def create_user():

    new_user = Users('Daniel Rica', 'danrica92@yahoo.com', '123456', False)

    db.session.add(new_user)
    db.session.commit()

    return "User created!"

@app.route("/view_users")
def view_user():

    daniel = Users.query.filter_by(name='Daniel Rica').first()

    return daniel.email



if __name__ == "__main__":
    app.run()
