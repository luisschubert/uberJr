# uberJr – Installation and Configuration Guide

For best practice install Ubuntu in a Virtual Machine and run uberJr in sandboxed environment to ensure consistent performance.

## 1. Install Python (if you don't already have it) 
https://www.python.org/downloads/
We are using version 2.7
run `python` in your terminal of choice to launch a python interpreter.
run
```
import sys
print (sys.version)
```
to check your version

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
OS X -> https://postgresapp.com/ this is the easiest way to run a PostgreSQL Server on Mac. Follow Instructions on site.
Linux:
```
sudo apt-get install postgres
```

## 4. Connect to Postgres, Create Database & Tables
### Linux:
Connect to the postgres server with the postgres user:
```
sudo su - postgres
psql -p5432
```
First we will create a new database called `uberjr`.
```
create Database uberjr;
```
Now we'll have to connect to the database.
```
\c uberjr
```
To execute the sql statement in `databaseSetup.sql` we will just copy and paste the contents of the file into our psql prompt.

To check if the tables have been create successfully you can execute:
```
\d
```
### OS X
Connect to the postgres server with the postgres user:
```
"/Applications/Postgres.app/Contents/Versions/9.6/bin/psql" -p5432 -d "postgres"
```
First we will create a new database called `uberjr`.
```
create Database uberjr;
```
Now we'll have to connect to the database.
```
\c uberjr
```
To execute the sql statement in `databaseSetup.sql` we will just copy and paste the contents of the file into our psql prompt.

To check if the tables have been create successfully you can execute:
```
\d
```
