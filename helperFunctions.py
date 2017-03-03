import json

#extracts the travel time from the direction API response
#routes.legs.duration.value --> this returns the duration of the trip in seconds.
def extractTravelTime(response):
    parsed_response = json.loads(response)
    #TEST# this needs to be tested. most likely this will not work.
    #['duration_in_traffic']['value']
    print "####\n"
    print parsed_response
    print "####\n"
    travelTime = parsed_response[u'routes'][0][u'legs'][0][u'duration_in_traffic'][u'value']
    print "##2##\n"
    print travelTime
    print "##2##\n"
    travelDistance = parsed_response[u'routes'][0][u'legs'][0][u'distance'][u'value']
    print "##3##\n"
    print travelDistance
    print "##3##\n"
    #this is dummy data

    return travelTime, travelDistance

#this will access the database and check if the username is not already registered.
#if the user is not registered a new entry will be created.
def signup(email,password):
    return

#calculates the travelCost based on the formula
def calculateCost(travelTime, travelDistance):
    return 300
