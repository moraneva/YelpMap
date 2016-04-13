var Yelp = require('yelp');
var fs = require('fs');
var Q = require('q');

var yelp = new Yelp({
    consumer_key: '-lcWSvSQmWrb3HWuf-L4Sg',
    consumer_secret: 'wmUD0XFTlAFxvbhvzqPFZZViGkI',
    token: 'e6TUSidFfNGr_erlnpDvArNlxeJbNhZW',
    token_secret: 'WyvEieYdlIXFo-tU1VuIIYjkpK8'
});

fs.readFile('dataRetreival/counties.csv', 'utf8', function (err, counties) {
    if (err)
        return console.log(err);
    counties = counties.split('\n');
    var length = counties.length;
    var counter = 0;
    for (var i = 0; i < 1; i++) {
        var endOffset = Math.ceil(counter + length / 1) > length ? length : Math.ceil(counter + length / 8);
        _processCounties(counties, counter, endOffset, i);
        counter = endOffset + 1;
    }
});

function _processCounties(counties, offset, endOffset, fileIndex) {

    var output = {};

    //Get info for each county here.
    //Initial probe for first 20 results
    var index = offset;

    _promiseWhile(function () {
        return index < endOffset;
    }, function () {

        index++;
        return _processCounty(counties[index - 1]).then(function (result) {
            console.log("Average rating  for " + counties[index - 1].split(',')[1] + ": " + result);
            fs.open('dataRetreival/ratings' + fileIndex + '.csv', 'a', 666, function (e, id) {
                fs.write(id, counties[index - 2].split(',')[0] + ',' + counties[index - 2].split(',')[1] + ',' + result + '\n', null, 'utf8', function () {
                    fs.close(id, function () {
                        console.log('results written to file');
                    });
                });
            });
        }); // arbitrary async
    }).then(function () {

    }).done(function () {
        console.log("====================================================================")
    });

}

function _processCounty(county) {

    var deferred = Q.defer();
    yelp.search({category_filter: 'restaurants', location: county.split(',')[1]})
        .then((function (county) {
            return function (result) {
                var numBusinesses = result["total"];
                console.log("=========================================================")
                console.log("Cycling through " + numBusinesses + " restaurant ratings for " + county.split(',')[1]);
                var ratingTotal = 0;

                ratingTotal += _addRatings(result);

                if (numBusinesses > 20) {
                    var businessCount = 20;
                    var maxNum = numBusinesses < 1000 ? numBusinesses : 1000;
                    _promiseWhile(function () {
                        return businessCount < maxNum;
                    }, function () {

                        return _apiCallWithOffset(county, businessCount).then(function (ratings) {
                            ratingTotal += ratings;
                            businessCount += 20;
                            return; // arbitrary async
                        });

                    }).then(function () {

                        deferred.resolve(ratingTotal / maxNum);
                    }).done();
                }
            };
        }(county)))
        .catch(function (err) {
            console.log(err);
            return;
        });

    return deferred.promise;
}

function _apiCallWithOffset(county, offset) {
    return yelp.search({category_filter: 'restaurants', location: county.split(',')[1], offset: offset})
        .then(
            function (result) {
                var ratingTotal = 0;

                ratingTotal += _addRatings(result);

                return ratingTotal;
            })
        .catch(function (err) {
            console.log(err);
            return;
        });
}

function _addRatings(jsonObject) {

    var ratingTotal = 0;
    jsonObject["businesses"].forEach(function (business) {
        ratingTotal += business["rating"];
    });

    return ratingTotal;
}

function _promiseWhile(condition, body) {
    var done = Q.defer();

    function loop() {
        // When the result of calling `condition` is no longer true, we are
        // done.
        if (!condition()) return done.resolve();
        Q.when(body(), loop, done.reject);
    }

    Q.nextTick(loop);

    // The promise
    return done.promise;
}
