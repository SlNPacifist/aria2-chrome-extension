angular
  .module('DownloadAsApp', ['ClientCreator'])
  .controller('DownloadAsController', ['$scope', 'ClientCreator',
  function ($scope, ClientCreator) {
    chrome.runtime.getBackgroundPage(function setName(background) {
      $scope.$apply(function() {
        $scope.url = background.getDownloadedUrl();
      });
    });
    $scope.submit = function() {
      if (ClientCreator.current) {
        var options = {
          out: $scope.name
        }
        ClientCreator.current.aria2.addUri([$scope.url], options, function(err, res) {
          console.log("Result of addUri", err, res);
        });
      } else {
        console.log("No connection");
      }
    }
  }]);