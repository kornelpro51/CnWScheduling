angular.module('scheduler').service('EventShareService',['$rootScope', function($rootScope) {
	var eventShareService = {		
		refreshAppointment: function (apptGroupId) {
			$rootScope.$broadcast('refreshAppointment', apptGroupId)
		}
	};
	return eventShareService;
}]);