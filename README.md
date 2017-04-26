# uberJr – Installation and Configuration Guide

For best practice install Ubuntu in a Virtual Machine and run uberJr in sandboxed environment to ensure consistent performance.

## 1. Install Python (if you don't already have it) 
We are using version 2.7  
run `python` in your terminal to check if you have python install.  
if a python interpreter is launched, run to check your version
```
import sys
print (sys.version)
```
else download python here https://www.python.org/downloads/

Also make sure that pip is installed to install the Python dependencies in the next step.
### Linux:
```
sudo apt-get install python-setuptools
sudo easy_install pip
```

## 2. Install Python Dependencies

Python dependencies will be installed using Pip.

### flask
`sudo pip install flask`

### flask-bcrypt
`sudo pip install flask-bcrypt`

### flask_sqlalchemy
`sudo pip install flask_sqlalchemy`

### requests
`sudo pip install requests`

### googlemaps
`sudo pip install googlemaps`

### psycopg2
`sudo pip install psycopg2`

## 3. Install PostgreSQL
### Linux:
```
sudo apt-get install postgres
```

### OS X:
Install the PostgresApp from https://postgresapp.com/.  
This is the easiest way to run a PostgreSQL Server on Mac. Follow Instructions on site for installation.  

## 4. Connect to Postgres, Create Database & Tables
### Connect to Postgres:
### Linux:
Connect to the postgres server with the postgres user:
```
sudo su - postgres
psql -p5432
```
### OS X:
Connect to the postgres server with the postgres user:
```
"/Applications/Postgres.app/Contents/Versions/9.6/bin/psql" -p5432 -d "postgres"
```
### Create Database & Tables:
Create a new database called `uberjr`
```
create Database uberjr;
```
Connect to the `uberjr` database.
```
\c uberjr;
```
To execute the sql statement in `databaseSetup.sql` we will just copy and paste the contents of the file into our psql prompt.

To check if the tables have been create successfully you can execute:
```
\d
```
Change the postgres password to `uberjr`
```
\password postgres;
```

## 5. Launch uberJr 
Clone the repository to your machine.
Navigate to the project in your terminal and run to start the webserver:
```
python webserver.py
```
UberJr is now running at `localhost:5000` [uberJr](http://localhost:5000)

