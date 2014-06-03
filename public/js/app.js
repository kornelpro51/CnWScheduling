// Declare app level module which depends on filters, and services
angular.module('scheduler', ['ngResource', 'ngRoute', 'mgcrea.ngStrap', 'ui.bootstrap.tpls', 'ui.bootstrap.modal', 'ui.date', 'ui.calendar', 'ui.select2'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home/home.html', 
        controller: 'HomeController'})
      .otherwise({redirectTo: '/'});
  }]).directive('noblank', function (){ 
   return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
          //For DOM -> model validation
          ngModel.$parsers.unshift(function(value) {
             if (typeof value == 'undefined' || (typeof value == 'string' && value.trim() == "")) {
             	ngModel.$setValidity('noblank', false);
             } else if (value == false) {
             	ngModel.$setValidity('noblank', false);
             } else {
             	ngModel.$setValidity('noblank', true);
             }
             return value;
          });

          //For model -> DOM validation
          ngModel.$formatters.unshift(function(value) {
          	 if (typeof value == 'undefined' || (typeof value == 'string' && value.trim() == "")) {
             	ngModel.$setValidity('noblank', false);
             } else if (value == false) {
             	ngModel.$setValidity('noblank', false);
             } else {
             	ngModel.$setValidity('noblank', true);
             }
             return value;
          });
      }
   };
});