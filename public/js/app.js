// Declare app level module which depends on filters, and services
angular.module('scheduler', ['ngResource', 'ngRoute', 'mgcrea.ngStrap', 'ui.bootstrap.tpls', 'ui.bootstrap.modal', 'ui.date', 'ui.calendar', 'ui.select2'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home/home.html', 
        controller: 'HomeController'})
      .otherwise({redirectTo: '/'});
  }]);
