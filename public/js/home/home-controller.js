angular.module('scheduler')
    .controller('HomeController', ['$scope', '$location', '$injector','$modal', 'AppointmentService', 'EventShareService', function ($scope, $location, $injector, $modal, AppointmentService, EventShareService) {
        var calendarHeight = getCalendarHeight();
        $scope.uiConfig = {
            calendar: {
                height: calendarHeight,
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
                viewRender: function(view, element) {
                    console.log("view changed", view.visStart, view.visEnd, view.start, view.end);

                    initialize();
                },
                windowResize: function( view) {
                    console.log("resize event fired");
                }
            }
        }

        $scope.calendarSource = [];
        $scope.appointmentInfos = [];
        $scope.userInfos = [];

        $(window).unbind('resize').bind('resize', function() {
            $scope.schedule.fullCalendar('option', 'height', getCalendarHeight());
        }).unbind('orientationchange').bind('orientationchange', function() {            
            $scope.schedule.fullCalendar('option', 'height', getCalendarHeight());
        });

        function getCalendarHeight() {
            return Math.max(300, $(window).height() - 80);
        }
        function getUserNameById(userid) {
            var user = null;
            for (var idx in $scope.userInfos) {
                if ($scope.userInfos[idx].user_id == userid) {
                    user = $scope.userInfos[idx];
                    break;
                }
            }
            return user.given_name + " " + user.family_name;
        }

        function createFullcalendarEvent(data) {
            //$scope.calendarSource.push(data);
            var calEvent = {};
            var eventLabel = "";
            calEvent.events = [];
            if (data.attendees.length > 1) {
                if (typeof data.attendees[0].given_name == "string") {
                    eventLabel = data.attendees[0].given_name + " " + data.attendees[0].family_name + " ...";
                } else {
                    eventLabel = getUserNameById(data.attendees[0].user_id) + " ...";
                }
            } else if (data.attendees.length > 0) {
                if (typeof data.attendees[0].given_name == "string") {
                    eventLabel = data.attendees[0].given_name + " " + data.attendees[0].family_name;
                } else {
                    eventLabel = getUserNameById(data.attendees[0].user_id);
                }
            } else {
                return;
            }
            angular.forEach(data.appointmentEvents, function(evt, key) {
                calEvent.events.push({
                    title: eventLabel,
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
                    value.starts_at = new Date(value.starts_at);
                    value.ends_at = new Date(value.ends_at);
                    value.startTime = dateFormat(value.starts_at, "hh:MM TT");
                    value.endTime = dateFormat(value.ends_at, "hh:MM TT");
                })
            } else {
                data.date = dateFormat(data.starts_at, "mm/dd/yyyy");
                data.starts_at = new Date(data.starts_at);
                data.ends_at = new Date(data.ends_at);
                data.startTime = dateFormat(data.starts_at, "hh:MM TT");
                data.endTime = dateFormat(data.ends_at, "hh:MM TT");
            }
        }
        function initialize() {
            AppointmentService.getApptGroupList().then(function(data) {
                $scope.appointmentInfos = data.data.result.groups;
                $scope.userInfos = data.data.result.users;
                angular.forEach($scope.appointmentInfos, function(value, key) {
                    convertFromDBFormat(value.appointmentEvents);
                    createFullcalendarEvent(value);
                });
            }, function(reason) {
                alert('Failed: ' + reason);
                window.location.href = "/";
            });
        }

        $scope.init = function () {
            //initialize();
        }

        $scope.$on('refreshAppointment', function(event, apptGroupId) {
            console.log(' ** refreshAppointment ** ');
        });

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
                  windowClass: 'min-dialog',
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
                        AppointmentService.createApptGroup(appt).then(function(result) {
                            if ( result.data && result.data.success) {
                                appt.appt_group_id = result.data.result.appt_group_id;
                            }
                            $scope.appointmentInfos.push(appt);
                            createFullcalendarEvent(appt);
                        }, function(reason) {
                            alert('Failed: ' + reason);
                            window.location.href = "/";
                        });
                    } else {
                        //AppointmentService.updateAppointment(appt).then(function(result) {
                        //    $scope.appointmentInfos.push(appt);
                        //    createFullcalendarEvent(appt);
                        //});
                    }
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                    //window.location.href = "/";
                });
                //modalInstance.opened.then(function(result) {
                //    alert(result);
                //}
                //, function(result){
                //    alert(result);
                //});
            } else {
                var modalInstance = $modal.open({
                    templateUrl: 'viewAppointmentModal.html',
                    controller: 'ViewAppointmentCtrl',
                    windowClass: 'min-dialog',
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
    .controller('CreateAppointmentCtrl', ['$scope', '$modalInstance', 'paramUsers', 'paramTypes', 'pickupDate', 'initialData', 'AppointmentService', function ($scope, $modalInstance, paramUsers, paramTypes, pickupDate, initialData, AppointmentService) {
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

    $scope.states = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Dakota","North Carolina","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
    $scope.icons = [{"value":"Gear","label":"Gear"},{"value":"Globe","label":"Globe"},{"value":"Heart","label":"Heart"},{"value":"Camera","label":"Camera"}];
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
            given_name : '',
            family_name : '',
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
    $scope.icons = [{"value":"Gear","label":"<i class=\"fa fa-gear\"></i> Gear dfda"},
    {"value":"Globe","label":"<i class=\"fa fa-globe\"></i> Globe  dff"},
    {"value":"Heart","label":"<i class=\"fa fa-heart\"></i> Heart  aaa"},
    {"value":"Camera","label":"<i class=\"fa fa-camera\"></i> Camera ddd"}];
    function convertInfoUsers2Select2 () {
        angular.forEach($scope.info.users, function(user, idx) {
            user.text = user.email;
            user.id = user.user_id;
        });
    }
    function convertInfoUsers2BSTypeahead () {
        angular.forEach($scope.info.users, function(user, idx) {
            user.label = user.email + " (" + user.given_name + ", " + user.family_name + ")";
            user.value = user.email;
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
                attendee.given_name = user.given_name;
                attendee.family_name = user.family_name;
                attendee.email = user.email;
                attendee.editMode = false;
            });
            $scope.dlgTitle = "Edit your appointment.";
        } else {
            $scope.dlgTitle = "Create your appointment.";
          var startTime = new Date();
          startTime.setMinutes(0);
          $scope.newAppointment.startTime = startTime.format("hh:MM TT");
          var endTime = new Date();
          endTime.setMinutes(30);
          $scope.newAppointment.endTime = endTime.format("hh:MM TT");
        }
    }

    LoadInformations();

    //convertInfoUsers2Select2();
    convertInfoUsers2BSTypeahead();

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
    $scope.reset = function (form) {
      form.$setPpristine();
    };
    $scope.next = function() {
        var isDuplicatedUserExist = false;
        for( var idx = 0; idx < $scope.data.attendees.length - 1; idx++ ) {
            for( var idx2 = idx + 1; idx2 < $scope.data.attendees.length; idx2++ ) {
                if ($scope.data.attendees[idx].email == $scope.data.attendees[idx2].email) {
                    $scope.data.attendees[idx2].hasError = true;
                    isDuplicatedUserExist = true;
                }
            }
        }
        if (isDuplicatedUserExist) {
            alert("Please remove duplicated users.");
            return;
        }
        if ($scope.data.attendees.length > 0) {
            AppointmentService.createNewUsers($scope.data.attendees).then(function(result) {
                if ( result.data && result.data.success) {
                    angular.forEach(result.data.result, function(user_db, idx) {
                        angular.forEach($scope.data.attendees, function (user_client, idx) {
                            if (user_client.email == user_db.email && user_db.user_id != null) {
                                user_client.user_id = user_db.user_id;
                            }
                        });
                    });
                    $scope.step = 1;
                } else {
                    alert("Did not create new users. Please try again.");
                }
            }, function(reason) {
                alert('Failed: ' + reason);
                window.location.href = "/";
            });
        } else {
            alert("Please add attendees.")
        }
    };


    // ----------------------------------------------

    $scope.$watch('newAttendee.id', function( newID, oldID ) {
        if ( newID ) {
            if ( newID == oldID ) {
                return;
            }
            if ( typeof newID == 'object' ) {
                $scope.newAttendee.isNameConfigurable = false;
                $scope.newAttendee.given_name = newID.given_name;
                $scope.newAttendee.family_name = newID.family_name;
                $scope.newAttendee.email = newID.email;
                var att = jQuery.extend({}, $scope.newAttendee);
                att.given_name = $scope.newAttendee.id.given_name;
                att.family_name = $scope.newAttendee.id.family_name;
                att.email = $scope.newAttendee.id.email;
                att.user_id = $scope.newAttendee.id.user_id;
                $('#newAttendeeForm').find('input[name="email"]').focus();
                $scope.data.attendees.push(att);
                $scope.myform.$setPristine();
                ResetAttendee();
            } else {
                for(var idx in $scope.info.users) {
                    if (newID == $scope.info.users[idx].email ) {
                        $scope.newAttendee.isNameConfigurable = false;
                        $scope.newAttendee.given_name = $scope.info.users[idx].given_name;
                        $scope.newAttendee.family_name = $scope.info.users[idx].family_name;
                        $scope.newAttendee.email = $scope.info.users[idx].email;
                        $scope.newAttendee.id = $scope.info.users[idx];
                        return;
                    }
                }
                $scope.newAttendee.isNameConfigurable = true;
                $scope.newAttendee.email = newID;
            }
        }
    });
    $scope.$on('$typeahead.select', function(evt, value, id) {
        if ( typeof value == 'object' ) {
            $scope.$digest();
        }
    });

    $scope.$watch('newAppointment.type', function( newType, oldType ) {
        if (typeof newType != 'undefined' ) {
            if ( newType === oldType ) {
                return;
            }
            for (var i = 0; i < $scope.info.types.length; i++) {
                if( $scope.info.types[i].appt_type_id == newType ) {
                    $scope.newAppointment.title = $scope.info.types[i].title;
                    $scope.newAppointment.description = $scope.info.types[i].description;
                }
            };
        }
    });
    $scope.initFormDirty = function(form) {
        console.log("---- initFormDirty ---- ");
        form.$setPristine();
      $scope.myform = form;
    }
    $scope.addAttendee = function (form) {
        //$scope.newAttendee.id = '12345';
        //return;
        if (form.$valid) {
            var att = jQuery.extend({}, $scope.newAttendee);
            if (typeof $scope.newAttendee.id == 'object') {
                att.given_name = $scope.newAttendee.id.given_name;
                att.family_name = $scope.newAttendee.id.family_name;
                att.email = $scope.newAttendee.id.email;
                att.user_id = $scope.newAttendee.id.user_id;
            } else {
                att.email = $scope.newAttendee.id;
                att.user_id = null;
            }

            $('#newAttendeeForm').find('input[name="email"]').focus();
            $scope.data.attendees.push(att);
            form.$setPristine();
            ResetAttendee();
        } else {
            form.email.$dirty = true;
            form.given_name.$dirty = true;
            form.family_name.$dirty = true;
            alert("Please select a email address and input user names.");
        }
    }
    $scope.changeAttendee = function (attendee) {
        var userInfo = getCustomizedUserInfo(attendee.user_id);
        if (userInfo) {
            attendee.email = userInfo.email;
            attendee.given_name = userInfo.given_name;
            attendee.family_name = userInfo.family_name;
        }
    }
    $scope.editAttendee = function(attendee) {
        attendee.editMode = true;
    }
    $scope.completeAttendee = function (form, attendee) {
        if (form.$valid) {
            attendee.editMode = false;
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

    $scope.done = function(form, discardCurrent) {
        if(discardCurrent) {
          $modalInstance.close($scope.data);
          return;
        }
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
    .controller('ViewAppointmentCtrl', ['$scope', '$rootScope', '$timeout', '$modalInstance', 'AppointmentService', 'EventShareService', 'paramUsers', 'paramTypes', 'pickupDate', 'initialData', function ($scope, $rootScope, $timeout, $modalInstance, AppointmentService, EventShareService, paramUsers, paramTypes, pickupDate, initialData) {

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
    $scope.newAttendee = {};

    $scope.notify = {
        visible : false,
        message : ''
    }
    $scope.viewmode = 'view';

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
                attendee.given_name = user.given_name;
                attendee.family_name = user.family_name;
                attendee.email = user.email;
            });
        }
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
    function ResetAttendee () {
        $scope.newAttendee = {
            email : '',
            given_name : '',
            family_name : '',
            isNameConfigurable : true
        }
    }
    function convertInfoUsers2BSTypeahead () {
        angular.forEach($scope.info.users, function(user, idx) {
            user.label = user.email + " (" + user.given_name + ", " + user.family_name + ")";
            user.value = user.email;
        });
    }

    function isDuplicateAttendeesExist() {
        var isExist = false;
        for( var idx = 0; idx < $scope.newAttendees.length - 1; idx++ ) {
            for( var idx2 = idx + 1; idx2 < $scope.newAttendees.length; idx2++ ) {
                if ($scope.newAttendees[idx].email == $scope.newAttendees[idx2].email) {
                    $scope.newAttendees[idx].hasError = true;
                    $scope.newAttendees[idx2].hasError = true;
                    isExist = true;
                }
            }
        }
        return isExist;
    }

    LoadInformations();
    InitializeData();
    ResetAttendee();
    convertInfoUsers2BSTypeahead();

    $scope.$watch('newAppointment.type', function( newType, oldType ){
        if (typeof newType != 'undefined' ) {
            if ( newType === oldType ) {
                return;
            }
            for (var i = 0; i < $scope.info.types.length; i++) {
                if( $scope.info.types[i].appt_type_id == newType ) {
                    $scope.newAppointment.title = $scope.info.types[i].title;
                    $scope.newAppointment.description = $scope.info.types[i].description;
                }
            };
        }
    });

    $scope.$watch('newAttendee.id', function( newID, oldID ) {
        if ( newID ) {
            if ( newID == oldID ) {
                return;
            }
            if ( typeof newID == 'object' ) {
                $scope.newAttendee.isNameConfigurable = false;
                $scope.newAttendee.given_name = newID.given_name;
                $scope.newAttendee.family_name = newID.family_name;
                $scope.newAttendee.email = newID.email;
                $scope.newAttendee.user_id = newID.user_id;

                var att = jQuery.extend({}, $scope.newAttendee);
                $('#newAttendeeForm').find('input[name="email"]').focus();
                $scope.newAttendees.push(att);
                $scope.myform.$setPristine();
                ResetAttendee();
            } else {
                for(var idx in $scope.info.users) {
                    if (newID == $scope.info.users[idx].email ) {
                        $scope.newAttendee.id = $scope.info.users[idx];
                        return;
                    }
                }
                $scope.newAttendee.isNameConfigurable = true;
                $scope.newAttendee.email = newID;
            }
        }
    });
    $scope.$on('$typeahead.select', function(evt, value, id) {
        if ( typeof value == 'object' ) {
            $scope.$digest();
        }
    });
    $scope.initFormDirty = function(form) {
        console.log("---- initFormDirty ---- ");
        form.$setPristine();
        $scope.myform = form;
    }

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
    
    $scope.changeDlgMode = function ( mode ) {
        $scope.viewmode = mode;
        if ($scope.viewmode == 'new_appt') {
            delete $scope.currentAppointment.type;
            $scope.newAppointment = angular.extend({}, $scope.currentAppointment);
        } else if ($scope.viewmode == 'edit_appt') {
            delete $scope.currentAppointment.type;
            $scope.newAppointment = angular.extend({}, $scope.currentAppointment);
        } else if ( $scope.viewmode == 'edit_att' ) {
            $scope.newAttendees = angular.extend([], $scope.data.attendees);
            ResetAttendee();
        } else if ($scope.viewmode == 'view') {
            delete $scope.newAppointment;
            delete $scope.newAttendees;
        }
    }
    function showNotification(msg, d) {
        var delay = d || 3000;
        $scope.notify.visible = true;
        $scope.notify.message = msg;
        $timeout.cancel($scope.notify.timeout);
        $scope.notify.timeout = $timeout(function() {
            $scope.notify.visible = false;
        }, delay);
    }

    $scope.SaveAppointment = function ( mode ) {
        convertToDBFormat($scope.newAppointment);
        AppointmentService.modifyAppointment($scope.data.appt_group_id, $scope.currentAppointment.appt_id, $scope.newAppointment).then(function(result) {
            if(result.data.success) {
                angular.extend($scope.currentAppointment, $scope.newAppointment);
                showNotification('The appointment was saved successfully.');
                if (mode) {
                    $scope.changeDlgMode('view');
                }
            } else {
                showNotification('Appointment is not saved.');
            }
        }, function(reason) {
            console.error(reason);
            alert('Failed on save appointment');
        });
    }
    $scope.DeleteAppointment = function (  ) {
        if ($scope.data.appointmentEvents.length <= 1) {
            if(confirm("If you delete last appointment this appointment group will be deleted. Are you sure?")) {
                $scope.DeleteAppointmentGroup();
            }
            return;
        }
        AppointmentService.deleteAppointment($scope.data.appt_group_id, $scope.currentAppointment.appt_id).then(function(result) {
            if(result.data.success) {
                $scope.data.appointmentEvents.splice($scope.currentPos, 1);
                $scope.endPos = $scope.data.appointmentEvents.length - 1;
                if ($scope.currentPos > $scope.endPos) {
                    $scope.currentPos = $scope.endPos;
                }
                $scope.currentAppointment = $scope.data.appointmentEvents[$scope.currentPos];
                $scope.changeDlgMode('view');
            } else {
                showNotification('Appointment is not saved.');
            }
        }, function(reason) {
            console.error(reason);
            alert('Failed on delete appointment');
        });
    }
    $scope.DeleteAppointmentGroup = function() {
        AppointmentService.deleteApptGroup($scope.data.appt_group_id).then(function(result) {
            if( result.data.success) {
                $modalInstance.dismiss('cancel');
            } else {
                alert(result.data.msg);
            }
        }, function(reason) {
            console.error(reason);
            alert('Failed on delete of the appointment group.');
        });
    }



    $scope.addAttendee = function (form) {
        if (form.$valid) {
            var att = jQuery.extend({}, $scope.newAttendee);
            if (typeof $scope.newAttendee.id == 'object') {
                att.given_name = $scope.newAttendee.id.given_name;
                att.family_name = $scope.newAttendee.id.family_name;
                att.email = $scope.newAttendee.id.email;
                att.user_id = $scope.newAttendee.id.user_id;
            } else {
                att.email = $scope.newAttendee.id;
                att.user_id = null;
            }

            $('#newAttendeeForm').find('input[name="email"]').focus();
            $scope.newAttendees.push(att);
            form.$setPristine();
            ResetAttendee();
        } else {
            form.email.$dirty = true;
            form.given_name.$dirty = true;
            form.family_name.$dirty = true;
            alert("Please select a email address and input user names.");
        }
    }
    $scope.removeAttendee = function (attendee, index) {
        if(confirm("Are you sure you want to remove the selected attendee?")) {
            $scope.newAttendees.splice(index, 1);
        }
    }
    $scope.SaveAttendees = function(mode) {
        if ($scope.newAttendees.length < 1) {
            alert('Please add attendees.');
            return;
        }
        if (isDuplicateAttendeesExist()) {
            alert('Some of the email addresses are duplicated.');
            return;
        }
        AppointmentService.createNewUsers($scope.newAttendees).then(function(result) {
            if (result.data && result.data.success) {
                angular.forEach(result.data.result, function(user_db, idx) {
                    angular.forEach($scope.newAttendees, function (user_client, idx) {
                        if (user_client.email == user_db.email && user_db.user_id != null) {
                            user_client.user_id = user_db.user_id;
                        }
                    });
                });
                AppointmentService.modifyApptGroupUsers( $scope.data.appt_group_id, $scope.newAttendees).then(function() {
                    delete $scope.data.attendees;
                    $scope.data.attendees = angular.extend([], $scope.newAttendees);
                    showNotification("The attendees information updated successfully.");
                    
                    EventShareService.refreshAppointment($scope.data.appt_group_id);

                    if (mode) {
                        $scope.changeDlgMode('view');
                    }
                });
            } else if (result.data) {
                alert(result.data.msg)
            } else {
                alert("Did not save users.");
            }
        }, function(reason) {
            console.error(reason);
            alert('Failed on save appointment');
        });
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
}]);