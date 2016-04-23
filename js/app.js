'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ui.bootstrap', 'ui.router']);

app.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});

app.controller("mainController", function ($scope, $timeout) {

    $scope.nameSortedAsc = false;
    $scope.yearSortedAsc = false;
    $scope.currentPage = 1; //current page
    $scope.maxSize = 10; //pagination max size
    $scope.entryLimit = 10;

    $scope.filteredList = [];

    $scope.alumniList = [];

    $scope.fakeList = function () {
        for (var i = 0; i < 1000; i++) {
            $scope.alumniList.push({
                name: faker.name.findName(), url: "https://cse.msu.edu", graduationYear: faker.random.number({
                    'min': 1995,
                    'max': 2050
                })
            });
        }
    };

    $scope.fakeList();
    $scope.noOfPages = Math.ceil($scope.alumniList.length / $scope.entryLimit);

    $scope.onSortByNames = function () {

        $scope.alumniList.sort(function (a, b) {
            // Compare the 2 dates
            if (!$scope.nameSortedAsc) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            }
            else {
                if (a.name > b.name) return -1;
                if (a.name < b.name) return 1;
                return 0;
            }
        });

        $scope.nameSortedAsc = !$scope.nameSortedAsc;
    };

    //Do an initial sort.
    $scope.onSortByNames();

    $scope.onSortByYears = function () {

        $scope.alumniList.sort(function (a, b) {
            // Compare the 2 dates
            if (!$scope.yearSortedAsc) {
                if (a.graduationYear < b.graduationYear) return -1;
                if (a.graduationYear > b.graduationYear) return 1;
                return 0;
            }
            else {
                if (a.graduationYear > b.graduationYear) return -1;
                if (a.graduationYear < b.graduationYear) return 1;
                return 0;
            }
        });

        $scope.yearSortedAsc = !$scope.yearSortedAsc;

    };

    $scope.filter = function () {
        $timeout(function () {
            //wait for 'filtered' to be changed
            /* change pagination with $scope.filtered */
            $scope.noOfPages = Math.ceil($scope.filtered.length / $scope.entryLimit);
        }, 10);
    };

});

function OnLinkedInFrameworkLoad() {
    IN.Event.on(IN, "auth", OnLinkedInAuth);
}
