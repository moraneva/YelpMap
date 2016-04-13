var Yelp = require('yelp');
var fs = require('fs');

var yelp = new Yelp({
    consumer_key: '-lcWSvSQmWrb3HWuf-L4Sg',
    consumer_secret: 'wmUD0XFTlAFxvbhvzqPFZZViGkI',
    token: 'e6TUSidFfNGr_erlnpDvArNlxeJbNhZW',
    token_secret: 'WyvEieYdlIXFo-tU1VuIIYjkpK8'
});

fs.readFile('dataRetreival/counties.csv', 'utf8', function (err, data) {
    if (err)
        return console.log(err);

    _processCounties(data, 3141);
});

function _processCounties(data, offset) {
    var counties = data.split('\n');
    var output = {};

    //Get info for each county here.
    for (var i = offset; i < counties.length; i++) {

        var county = counties[i];
        //Initial probe for first 20 results
        yelp.search({term: 'food', location: county.split(',')[1]})
            .then((function (county, i) {
                return function (result) {
                    var numBusinesses = result["total"];

                    console.log("=========================================================")
                    console.log("Cycling through " + numBusinesses + " business ratings for " + counties[i].split(',')[1]);
                    var ratingTotal = 0;

                    ratingTotal += _addRatings(result);

                    if (numBusinesses > 20) {
                        var offset = 20;
                        while (offset < numBusinesses) {
                            _searchYelp(county.split(',')[1], offset, (function (ratingTotal) {
                                return function (result) {
                                    ratingTotal += _addRatings(result);
                                    console.log(ratingTotal);
                                }
                            })(ratingTotal));
                            offset += 20;
                        }
                    }
                    output[county.split(',')[0]] = ratingTotal;
                };
            }(county, i)))
            .catch(function (err) {
                console.log(err);
                return;
            })
    }


}

function _searchYelp(county, offset, callback) {
    yelp.search({term: 'food', location: county, offset: offset}).then(function (result) {
        callback(result);
    });
}

function _addRatings(jsonObject) {

    var ratingTotal = 0;
    jsonObject["businesses"].forEach(function (business) {
        ratingTotal += business["rating"];
    });

    return ratingTotal;
}