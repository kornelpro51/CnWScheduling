angular.module('scheduler').factory('AppointmentService',['$http', '$resource', function($http, $resource) {
	var appointmentService = {
		getUserList: function () {
			var promise = $http.get('/api/v1/appointment/users').then(function (response) {
				return response;
			});
			return promise;
		},
		createNewUsers: function(users) {
			var promise = $http.post('/api/v1/appointment/users', users).then(function (response) {
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
		// --------------------------------------------------------------
		// --------------   Appointment Group services ------------------
		// --------------------------------------------------------------
		getApptGroupList: function () {
			var promise = $http.get('/api/v1/appointment/appts').then(function (response) {
				return response;
			});
			return promise;
		},
		createApptGroup: function (data) {
			var promise = $http.post('/api/v1/appointment/appts', data).then(function (response) {
				return response;
			});
			return promise;
		},
		getApptGroup: function(apptGroupId) {
			var promise = $http.get('/api/v1/appointment/appts/' + apptGroupId).then(function (response) {
				return response;
			});
			return promise;
		},
		deleteApptGroup: function(apptGroupId) {
			var promise = $http.delete('/api/v1/appointment/appts/' + apptGroupId).then(function (response) {
				return response;
			});
			return promise;
		},
		modifyApptGroupUsers: function(apptGroupId, users) {
			var promise = $http.put('/api/v1/appointment/appts/' + apptGroupId+ '/users', users).then(function (response) {
				return response;
			});
			return promise;
		},
		// --------------------------------------------------------
		// --------------   Appointment services ------------------
		// --------------------------------------------------------
		createAppointment: function (apptGroupId, apptId, data) {
			var promise = $http.post('/api/v1/appointment/appts/' + apptGroupId, data).then(function (response) {
				return response;
			});
			return promise;
		},

		getAppointment: function (apptGroupId, apptId) {
			var promise = $http.get( '/api/v1/appointment/appts/' + apptGroupId + '/appt/' + apptId ).then(function (response) {
				return response;
			});
			return promise;
		},
		modifyAppointment: function (apptGroupId, apptId, data) {
			var promise = $http.put('/api/v1/appointment/appts/' + apptGroupId + '/appt/' + apptId, data).then(function (response) {
				return response;
			});
			return promise;
		},
		deleteAppointment: function (apptGroupId, apptId, data) {
			var promise = $http.delete('/api/v1/appointment/appts/' + apptGroupId + '/appt/' + apptId).then(function (response) {
				return response;
			});
			return promise;
		}
	};
	return appointmentService;
}]);