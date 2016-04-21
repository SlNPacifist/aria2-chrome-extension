angular
  .module('PopupApp', ['ClientCreator'])
  .controller('PopupController', ['$scope', 'ClientCreator',
  function ($scope, ClientCreator) {
    $scope.info = "Connecting";
    ClientCreator.fromCurrentOptions(function(client) {
      client.aria2.getVersion(function(err, res) {
        $scope.$apply(function() {
          $scope.info = err || res;
        });
      });
    });
  }]);