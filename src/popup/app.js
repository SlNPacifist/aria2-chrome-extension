angular
  .module('PopupApp', ['options', 'AriaLib', 'ClientCreator'])
  .controller('PopupController', ['$scope', 'options', 'AriaLib', 'ClientCreator',
  function ($scope, options, AriaLib, ClientCreator) {
    $scope.info = "Connecting";
    ClientCreator.fromOptions(options.get(), function(err, client) {
      if (err) {
        $scope.$apply(function() {
          $scope.info = "Could not connect";
        });
        return;
      }
      client.aria2.getVersion(function(err, res) {
        $scope.$apply(function() {
          $scope.info = err || res;
        });
      });
    });
  }]);