// Declare app level module which depends on filters, and services
angular.module('scheduler', ['ngResource', 'ngRoute', 'ui.bootstrap', 'ui.date', 'ui.calendar'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home/home.html', 
        controller: 'HomeController'})
      .otherwise({redirectTo: '/'});
  }]);
