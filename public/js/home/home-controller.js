angular.module('scheduler')
    .controller('HomeController', ['$scope', '$location', '$injector','$modal', 'AppointmentService', function ($scope, $location, $injector, $modal, AppointmentService) {
        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: true,
                selectable: true,
                header: {
                    left: 'month agendaWeek agendaDay',
                    center: 'title',
                    right: 'today prev,next'
                },
                eventClick: function(calEvent, jsEvent, view) {
                    $scope.alertEventClick(calEvent, jsEvent, view, this);
                },
                dayClick: function(date, allDay, jsEvent, view) {
                    $scope.alertDayClick(date, allDay, jsEvent, view, this);
                },
            }
        }

        $scope.calendarSource = [{
            events: [
                {
                    title: 'Event1',
                    start: '2014-04-04'
                },
                {
                    title: 'Event2',
                    start: '2014-05-05'
                }
            ],
            color: 'yellow',   // an option!
            textColor: 'black' // an option!
        },{
            events: [
                {
                    title: 'Event1',
                    start: '2014-05-04'
                },
                {
                    title: 'Event2',
                    start: '2014-05-05'
                }
            ],
            color: 'green',   // an option!
            textColor: 'black' // an option!
        }];
        $scope.appointments = [];

        function createFullcalendarEvent(data) {

        }

        function convertToDBFormat(data) {
            if( Object.prototype.toString.call( data ) === '[object Array]' ) { {
                angular.forEach(data, function(value, key) {
                    value.starts_at = new Date(value.date + " " + value.startTime);
                    value.ends_at = new Date(value.date + " " + value.endTime);
                })
            } else {
                data.starts_at = new Date(data.date + " " + data.startTime);
                data.ends_at = new Date(data.date + " " + data.endTime);
            }
        }

        function convertFromDBFormat(data) {
            if( Object.prototype.toString.call( data ) === '[object Array]' ) { {
                angular.forEach(data, function(value, key) {
                    value.date = dateFormat(value.starts_at, "mm/dd/yyyy");
                    value.startTime = dateFormat(value.starts_at, "hh:MM TT");
                    value.endTime = dateFormat(value.starts_at, "hh:MM TT");
                })
            } else {
                data.date = dateFormat(data.starts_at, "mm/dd/yyyy");
                data.startTime = dateFormat(data.starts_at, "hh:MM TT");
                data.endTime = dateFormat(data.starts_at, "hh:MM TT");
            }
        }

        $scope.init = function () {
            AppointmentService.getApptGroupList().then(function(data) {
                angular.forEach(data, function(value, key) {
                    createFullcalendarEvent(value);
                });
            });
        }

        $scope.alertEventClick = function (calEvent, jsEvent, view, target) {

        }
        $scope.alertDayClick = function (date, allDay, jsEvent, view, target) {
            $scope.openWizard();
        }
        
        $scope.openWizard = function(size) {

            var modalInstance = $modal.open({
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceCtrl',
              size: size,
              resolve: {
                paramUsers: function () { 
                    var pr = AppointmentService.getUserList();
                    return pr;
                },
                paramTypes: function () {
                    var pr = AppointmentService.getApptTypeList();
                    return pr; 
                }
              }
            });

            modalInstance.result.then(function (appointments) {
                convertToDBFormat(appointments.appointments);
                AppointmentService.createAppointment(appointments).then(function() {
                    
                });
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }
    }]);

angular.module('scheduler')
    .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'paramUsers', 'paramTypes', function ($scope, $modalInstance, paramUsers, paramTypes) {
    $scope.step = 0;    
    
    $scope.info = {
        users: [],
        types: []
    }    

    $scope.data = {
        attendees : [],
        appointments : []
    }
    
    $scope.newAttendee = {};
    $scope.newAppointment = {};


    $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1900:-0'
    };

    function LoadInformations () {
        if ( paramUsers.status == 200 && paramUsers.data.success ) {
            $scope.info.users = paramUsers.data.result;
        }
        if ( paramTypes.status == 200 && paramTypes.data.success ) {
            $scope.info.types = paramTypes.data.result;
        }
    }
    
    function ResetAttendee () {
        $scope.newAttendee = {
            email : '',
            firstName : '',
            lastName : '',
            editMode : true
        }
    }

    function ResetAppointment() {
        $scope.newAppointment = {
            type         : '',
            title        : '',
            date         : '',
            startTime    : '',
            endTime      : '',
            content      : ''
        }
        if ($scope.info.types.length > 0) {
            $scope.newAppointment.type = $scope.info.types[0].appt_type_id;
        }        
    }

    function calcMinutesDiff (from, to) {
        var fromMinutes = parseInt(from.substring(0,2)) * 60+ parseInt(from.substring(3,5));
        var toMinutes = parseInt(to.substring(0,2)) * 60+ parseInt(to.substring(3,5));
        if (from.substring(6) == "PM") {
            fromMinutes += 720;
        }
        if (to.substring(6) == "PM") {
            toMinutes += 720;
        }
        return toMinutes - fromMinutes;
    }

    LoadInformations();

    ResetAttendee();
    ResetAppointment();

    // ---------------------------------------------

    $scope.ok = function () {
        $modalInstance.close($scope.data);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.next = function() {
        if ($scope.data.attendees.length > 0) {
            $scope.step = 1;
        } else {
            alert("Please add attendees.")
        }
    };
    

    // ----------------------------------------------

    $scope.addAttendee = function (form) {
        if (form.$valid) {
            var att = jQuery.extend({}, $scope.newAttendee);
            att.editMode = false;
            $scope.data.attendees.push(att);
            form.$setPristine();
            ResetAttendee();
            //form.$setValidity();
        } else {
            form.$setDirty();
            alert("Please select a email address and input user names.");
        }
    }
    $scope.editAttendee = function(attendee) {
        attendee.editMode = true;
    }
    $scope.completeAttendee = function (form, attendee) {
        if (form.$valid) {
            attendee.editMode = false;
        } else {
            form.$setDirty();
            alert("Please input user names.");
        }
    }
    $scope.removeAttendee = function (attendee, index) {
        if(confirm("Are you sure you want to remove the selected attendee?")) {
            $scope.data.attendees.splice(index, 1);
        }
    }

    // -----------------------------------------------

    $scope.done = function() {
        $modalInstance.close($scope.data);
    };

    $scope.addAnother = function(form) {
        if (form.$valid) {
            if (calcMinutesDiff($scope.newAppointment.startTime, $scope.newAppointment.endTime) < 10) {
                alert("The appointment duration should be larger than 10 minuets.")
                return;
            } else {
                var app = jQuery.extend({}, $scope.newAppointment);
                $scope.data.appointments.push(app);
                ResetAppointment();
                form.$setPristine();
            }
        }
    }    

    $scope.tooltip = {
        "title": "Hello Tooltip<br />This is a multiline message!",
        "checked": false
    };
}]);