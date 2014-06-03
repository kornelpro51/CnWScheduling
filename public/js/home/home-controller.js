angular.module('scheduler')
    .controller('HomeController', ['$scope', '$location', '$injector','$modal', 'AppointmentService', function ($scope, $location, $injector, $modal, AppointmentService) {
        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: false,
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

        $scope.calendarSource = [];
        $scope.appointmentInfos = [];

        function createFullcalendarEvent(data) {
            //$scope.calendarSource.push(data);
            var calEvent = {};
            calEvent.events = [];
            angular.forEach(data.appointmentEvents, function(evt, key) {
                calEvent.events.push({
                    title: evt.title,
                    start: evt.starts_at,
                    end: evt.ends_at,
                    allDay: false
                });
            });
            calEvent.meta = jQuery.extend({}, data);
            $scope.calendarSource.push(calEvent);
        }

        function convertToDBFormat(data) {
            if( Object.prototype.toString.call( data ) === '[object Array]' ) { 
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
            if( Object.prototype.toString.call( data ) === '[object Array]' ) {
                angular.forEach(data, function(value, key) {
                    value.date = dateFormat(value.starts_at, "mm/dd/yyyy");
                    value.startTime = dateFormat(value.starts_at, "hh:MM TT");
                    value.endTime = dateFormat(value.ends_at, "hh:MM TT");
                })
            } else {
                data.date = dateFormat(data.starts_at, "mm/dd/yyyy");
                data.startTime = dateFormat(data.starts_at, "hh:MM TT");
                data.endTime = dateFormat(data.ends_at, "hh:MM TT");
            }
        }

        $scope.init = function () {
            AppointmentService.getApptGroupList().then(function(data) {
                $scope.appointmentInfos = data.data.result;
                angular.forEach($scope.appointmentInfos, function(value, key) {
                    convertFromDBFormat(value.appointmentEvents);
                    createFullcalendarEvent(value);
                });
            });
        }

        $scope.alertEventClick = function (calEvent, jsEvent, view, target) {
            $scope.openWizard(dateFormat(calEvent.start, "mm/dd/yyyy"), calEvent.source.meta);
        }
        $scope.alertDayClick = function (date, allDay, jsEvent, view, target) {
            $scope.openWizard(date);
        }
        
        $scope.openWizard = function(date, initialData) {
            if (typeof initialData == 'undefined') {
                var modalInstance = $modal.open({
                  templateUrl: 'createAppointmentModal.html',
                  controller: 'CreateAppointmentCtrl',
                  size: 'lg',
                  resolve: {
                    paramUsers: function () { 
                        var pr = AppointmentService.getUserList();
                        return pr;
                    },
                    paramTypes: function () {
                        var pr = AppointmentService.getApptTypeList();
                        return pr; 
                    },
                    pickupDate: function() { return date; },
                    initialData: function () { return initialData; }
                  }
                });

                modalInstance.result.then(function (appt) {
                    convertToDBFormat(appt.appointmentEvents);
                    if (typeof appt.appt_group_id == "undefined") { // new appointment is created.
                        AppointmentService.createAppointment(appt).then(function(result) {
                            if ( result.data && result.data.success) {
                                appt.appt_group_id = result.data.result.appt_group_id;
                            }
                            $scope.appointmentInfos.push(appt);
                            createFullcalendarEvent(appt);
                        });
                    } else {
                        //AppointmentService.updateAppointment(appt).then(function(result) {
                        //    $scope.appointmentInfos.push(appt);
                        //    createFullcalendarEvent(appt);
                        //});
                    }
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            } else {
                var modalInstance = $modal.open({
                    templateUrl: 'viewAppointmentModal.html',
                    controller: 'ViewAppointmentCtrl',
                    size: 'lg',
                    resolve: {
                        paramUsers: function () { 
                            var pr = AppointmentService.getUserList();
                            return pr;
                        },
                        paramTypes: function () {
                            var pr = AppointmentService.getApptTypeList();
                            return pr; 
                        },
                        pickupDate: function() { return date; },
                        initialData: function () { return initialData; }
                    }
                });
            }
        }
    }]);

angular.module('scheduler')
    .controller('CreateAppointmentCtrl', ['$scope', '$modalInstance', 'paramUsers', 'paramTypes', 'pickupDate', 'initialData', function ($scope, $modalInstance, paramUsers, paramTypes, pickupDate, initialData) {
    $scope.step = 0;    
    $scope.pickupDate = pickupDate;
    
    $scope.info = {
        users: [],
        types: []
    }

    $scope.data = {
        attendees : [],
        appointmentEvents : []
    }

    $scope.newAttendee = {};
    $scope.newAppointment = {
        type         : '',
        title        : '',
        date         : '',
        startTime    : '',
        endTime      : '',
        description  : '',
        notes        : '',
    }


    $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1900:-0'
    };
    $scope.dlgTitle = '';



    $scope.select2Options = {
        createSearchChoice:function(term, data) { 
            if ($(data).filter(function() { 
                    return this.text.localeCompare(term)===0; 
                }).length===0) {

                return {id:term, text:term};
            } 
        },
        'multiple': false,
        'data': $scope.info.users
    };

    $scope.newAttendeeFormInvalid = false;

    function LoadInformations () {
        if ( paramUsers.status == 200 && paramUsers.data.success ) {
            $scope.info.users = jQuery.extend($scope.info.users, paramUsers.data.result);
        }
        if ( paramTypes.status == 200 && paramTypes.data.success ) {
            $scope.info.types = jQuery.extend($scope.info.types, paramTypes.data.result);
        }
    }
    
    function ResetAttendee () {
        $scope.newAttendee = {
            email : '',
            firstName : '',
            lastName : '',
            editMode : true,
            isNameConfigurable : true
        }
    }

    function ResetAppointment(initialDate) {
        $scope.newAppointment = {
            type         : '',
            title        : '',
            date         : '',
            startTime    : '',
            endTime      : '',
            description  : '',
            notes        : '',
        }
        if ($scope.info.types.length > 0) {
            $scope.newAppointment.type = $scope.info.types[0].appt_type_id;
        }
        if (initialDate instanceof Date) {
            $scope.newAppointment.date = dateFormat($scope.pickupDate, "mm/dd/yyyy");
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

    function convertInfoUsers2Select2 () {
        angular.forEach($scope.info.users, function(user, idx) {
            user.text = user.email;
            user.id = user.user_id;
        });
    }

    function getUserEmail (userId) {
        var email = null;
        angular.forEach($scope.info.users, function(user, idx) {
            if(user.user_id == userId) {
                email = user.email;
            }
        });
        return email;
    }

    function getUserInfo (userId) {
        var userInfo = null;
        angular.forEach($scope.info.users, function(user, idx) {
            if(user.user_id == userId) {
                userInfo = user;
            }
        });
        return userInfo;   
    }

    function getCustomizedUserInfo (userId) {
        var userInfo = null;
        angular.forEach($scope.info.users, function(user, idx) {
            if(user.user_id == userId) {
                userInfo = user;
            }
        });
        return userInfo;   
    }

    function initializeData() {
        if (typeof initialData != "undefined") {
            $scope.data = jQuery.extend({}, initialData);
            angular.forEach($scope.data.attendees, function(attendee, key) {
                var user = getUserInfo(attendee.user_id);
                attendee.firstName = user.given_name;
                attendee.lastName = user.family_name;
                attendee.email = user.email;
                attendee.editMode = false;
            });
            $scope.dlgTitle = "Edit your appointment.";
        } else {
            $scope.dlgTitle = "Create your appointment.";
        }
    }

    LoadInformations();

    convertInfoUsers2Select2();

    ResetAttendee();
    ResetAppointment($scope.pickupDate);

    initializeData();

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

    $scope.$watch('newAttendee.id', function( newID, oldID ) {
        if ( newID ) {
            if ( oldID ) {
                if (newID.id == oldID.id) {
                    return;
                }
            }
            if (newID.user_id) {
                $scope.newAttendee.isNameConfigurable = false;
                $scope.newAttendee.firstName = newID.given_name;
                $scope.newAttendee.lastName = newID.family_name;
            } else {
                $scope.newAttendee.isNameConfigurable = true;
            }
        }
    });
    $scope.initFormDirty = function(form) {
        console.log("---- initFormDirty ---- ");
        form.$setPristine();
    }
    $scope.addAttendee = function (form) {
        if (form.$valid) {
            var att = jQuery.extend({}, $scope.newAttendee);
            att.editMode = false;
            if (att.id.user_id) {
                att.user_id = att.id.user_id;
                att.email = att.id.email;
            } else {
                att.user_id = att.id.id;
                att.email = att.id.text;

                $scope.select2Options.data.push({
                    id : att.user_id, 
                    text : att.email,
                    user_id : att.user_id, 
                    email : att.email, 
                    family_name : att.lastName, 
                    given_name : att.firstName,
                    is_new: true
                });
            }

            $('#newAttendeeForm').find('input[name="firstname"]').focus();
            $scope.data.attendees.push(att);
            $scope.newAttendeeFormInvalid = false;
            form.$setPristine();
            ResetAttendee();
            //form.$setValidity();
        } else {
            form.$setDirty();
            $scope.newAttendeeFormInvalid = true;
            alert("Please select a email address and input user names.");
        }
    }
    $scope.changeAttendee = function (attendee) {
        var userInfo = getCustomizedUserInfo(attendee.user_id);
        if (userInfo) {
            attendee.email = userInfo.email;
            attendee.firstName = userInfo.given_name;
            attendee.lastName = userInfo.family_name;
        }
    }
    $scope.editAttendee = function(attendee) {
        attendee.editMode = true;
    }
    $scope.completeAttendee = function (form, attendee) {
        if (form.$valid) {
            attendee.editMode = false;
            /*if (attendee.id.user_id) {
                attendee.user_id = attendee.id.user_id;
                attendee.email = attendee.id.email;
            } else {
                attendee.user_id = attendee.id.id;
                attendee.email = attendee.id.text;
            }*/
            attendee.email = getUserEmail(attendee.user_id);
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

    $scope.done = function(form) {
        if (form.$valid) {
            if (calcMinutesDiff($scope.newAppointment.startTime, $scope.newAppointment.endTime) < 10) {
                alert("The appointment duration should be larger than 10 minuets.")
                return;
            } else {
                var app = jQuery.extend({}, $scope.newAppointment);
                $scope.data.appointmentEvents.push(app);
                ResetAppointment();
                form.$setPristine();

                $modalInstance.close($scope.data);
            }
        } else {
            form.title.$dirty = true;
            form.date.$dirty = true;
            form.starttime.$dirty = true;
            form.endtime.$dirty = true;
            alert("Please input required fields.");
        }
    };

    $scope.addAnother = function(form) {
        if (form.$valid) {
            if (calcMinutesDiff($scope.newAppointment.startTime, $scope.newAppointment.endTime) < 10) {
                alert("The appointment duration should be larger than 10 minuets.")
                return;
            } else {
                var app = jQuery.extend({}, $scope.newAppointment);
                $scope.data.appointmentEvents.push(app);
                ResetAppointment();
                form.$setPristine();
            }
        } else {
            form.title.$dirty = true;
            form.date.$dirty = true;
            form.starttime.$dirty = true;
            form.endtime.$dirty = true;
            alert("Please input required fields.");
        }
    }    

    $scope.tooltip = {
        "title": "Hello Tooltip<br />This is a multiline message!",
        "checked": false
    };
}]);

angular.module('scheduler')
    .controller('ViewAppointmentCtrl', ['$scope', '$modalInstance', 'paramUsers', 'paramTypes', 'pickupDate', 'initialData', function ($scope, $modalInstance, paramUsers, paramTypes, pickupDate, initialData) {
    
    $scope.currentAppointment = null;
    $scope.currentPos = 0;
    $scope.endPos = 0;

    $scope.data = {
        attendees: [],
        appointments: []
    }

    $scope.info = {
        users: [],
        types: []
    }

    function LoadInformations () {
        if ( paramUsers.status == 200 && paramUsers.data.success ) {
            $scope.info.users = jQuery.extend($scope.info.users, paramUsers.data.result);
        }
        if ( paramTypes.status == 200 && paramTypes.data.success ) {
            $scope.info.types = jQuery.extend($scope.info.types, paramTypes.data.result);
        }
    }

    function getUserInfo (userId) {
        var userInfo = null;
        angular.forEach($scope.info.users, function(user, idx) {
            if(user.user_id == userId) {
                userInfo = user;
            }
        });
        return userInfo;   
    }

    function InitializeData() {
        if ( initialData ) {
            $scope.data = jQuery.extend({}, initialData);
            if ($scope.data.appointmentEvents && $scope.data.appointmentEvents.length > 0) {
                $scope.currentAppointment = $scope.data.appointmentEvents[0]
                $scope.currentPos = 0;
                $scope.endPos = $scope.data.appointmentEvents.length-1;
            }
            angular.forEach($scope.data.attendees, function(attendee, key) {
                var user = getUserInfo(attendee.user_id);
                attendee.firstName = user.given_name;
                attendee.lastName = user.family_name;
                attendee.email = user.email;
            });
        }
    }

    LoadInformations();
    InitializeData();

    $scope.nextAppointment = function() {
        if ( $scope.currentPos < $scope.endPos ) {
            $scope.currentPos = $scope.currentPos + 1;
            $scope.currentAppointment = $scope.data.appointmentEvents[$scope.currentPos];
        }
    }
    $scope.prevAppointment = function() {
        if ( $scope.currentPos > 0 ) {
            $scope.currentPos = $scope.currentPos - 1;
            $scope.currentAppointment = $scope.data.appointmentEvents[$scope.currentPos];
        }
    }
    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
}]);