/**
 * Created by evan on 4/2/16.
 */
app.config(function ($stateProvider, $urlRouterProvider) {

    /**
     * To change the body tag for the template, simply put the class
     * that you want to style it with in the bodyClasses object in data.
     */

    $stateProvider
        .state('index', {
            url: '/',
            views: {
                //I think this is the way to go.. Allows us to specify a content template and a nav
                // template for each page.
                content: {templateUrl: 'views/main.html'}
            }
        });

    $urlRouterProvider.otherwise('/');
});
