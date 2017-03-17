import json

#extracts the travel time from the direction API response
#routes.legs.duration.value --> this returns the duration of the trip in seconds.
def extractTravelTime(response):
    parsed_response = json.loads(response)
    travelTime = parsed_response[u'routes'][0][u'legs'][0][u'duration_in_traffic'][u'value']
    travelDistance = parsed_response[u'routes'][0][u'legs'][0][u'distance'][u'value']
    return travelTime, travelDistance

#this will access the database and check if the username is not already registered.
#if the user is not registered a new entry will be created.
def signup(email,password):
    return False

def login(email,password):
    return False
    #check if the email exists in the system
    #get the hash for the user-email
    #then calculate the hash
    #compare the hashes

#calculates the travelCost based on the formula
def calculateCost(travelTime, travelDistance):
    return 300
