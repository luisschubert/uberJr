import json

#extracts the travel time from the direction API response
#routes.legs.duration.value --> this returns the duration of the trip in seconds.
def extractTravelTime(response):
    parsed_response = json.loads(response)
    travelTime = parsed_response[u'routes'][0][u'legs'][0][u'duration_in_traffic'][u'value']
    travelDistance = parsed_response[u'routes'][0][u'legs'][0][u'distance'][u'value']
    return travelTime, travelDistance

#calculates the travelCost based on the formula
def calculateCost(timeToDest, milesToDest):
    cost = 2.50 + (0.65 * timeToDest / 60) + (0.85 * milesToDest) + 1.75
    return "%.2f" % round(cost, 2)
