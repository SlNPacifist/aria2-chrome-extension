angular
  .module('PopupApp', ['external'])
  .controller('PopupController', ['$scope', 'SubscriptionService',
  function ($scope, SubscriptionService) {
    $scope.info = "Connecting";
    SubscriptionService.subscribe('aria2.getVersion', [], function(err, res) {
      $scope.$apply(function() {
        console.log("Updating version");
        $scope.info = err || res;
      });
    });
  }]);