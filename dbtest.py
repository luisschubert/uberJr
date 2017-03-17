import psycopg2

# i created the db from psql in the terminal. do that first
# --> create database test; <--

# create a connection to the database test.
conn = psycopg2.connect("dbname=test user=postgres")
#cursor to navigate the database
cur = conn.cursor()

#create a testtable
cur.execute("create table testtable(testdata int, testtext text);")

#insert some arbitrary data into the table
cur.execute("insert into testtable (testdata,testtext) Values (2,'hello');")

#select the inserted data
cur.execute("select * from testtable;")

#print out the response from the last statement
print cur.fetchone()

#this is important because it persists the changes you make to the db.
conn.commit()

#close your connections
cur.close()
conn.close()
