angular.module('scheduler').factory('AppointmentService',['$http', '$resource', function($http, $resource) {
	var appointmentService = {
		getUserList: function () {
			var promise = $http.get('/api/v1/appointment/users').then(function (response) {
				return response;
			});
			return promise;
		},
		getApptTypeList: function () {
			var promise = $http.get('/api/v1/appointment/appt_types').then(function (response) {
				return response;
			});
			return promise;
		},
		getApptGroupList: function () {
			var promise = $http.get('/api/v1/appointment/appts').then(function (response) {
				return response;
			});
			return promise;
		},
		getAppointment: function (apptId) {
			var promise = $http.get( '/api/v1/appointment/appts/' + apptId ).then(function (response) {
				return response;
			});
			return promise;
		},
		createAppointment: function (data) {
			var promise = $http.post('/api/v1/appointment/appts', data).then(function (response) {
				return response;
			});
			return promise;
		},
		modifyAppointment: function (apptId, data) {
			var promise = $http.put('/api/v1/appointment/appts/' + apptId).then(function (response) {
				return response;
			});
			return promise;
		}
	};
	return appointmentService;
}]);