angular.module('scheduler')
	.controller('HomeController', ['$scope', '$location','$modal', function ($scope, $location, $modal) {
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
		$scope.scheduleSource = [];
		$scope.alertEventClick = function (calEvent, jsEvent, view, target) {
			console.log(calEvent, jsEvent, view);
		}
		$scope.alertDayClick = function (date, allDay, jsEvent, view, target) {
			console.log(date, allDay, jsEvent, view, target);
			$scope.openWizard();
		}

		$scope.items = ['item1', 'item2', 'item3'];

		$scope.openWizard = function(size) {
			var modalInstance = $modal.open({
		      templateUrl: 'myModalContent.html',
		      controller: 'ModalInstanceCtrl',
		      size: size,
		      resolve: {
		        items: function () {
		          return $scope.items;
		        }
		      }
		    });

		    modalInstance.result.then(function (selectedItem) {
		      $scope.selected = selectedItem;
		    }, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		    });
		}
	}]);

angular.module('scheduler')
	.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'items', function ($scope, $modalInstance, items) {
  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);